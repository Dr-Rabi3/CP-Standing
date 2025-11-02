import Training from "../models/Training.js";
import { 
  calculatePoints 
} from "../services/codeforcesService.js";
import { getOrFetch, fetchAndCacheOverallStandings } from "../services/redisCacheService.js";

/**
 * Generate cache key
 */
const generateCacheKey = (type, trainingId, itemId = null) => {
  if (itemId) {
    return `standings:${type}:${trainingId}:${itemId}`;
  }
  return `standings:${type}:${trainingId}`;
};

/**
 * Get overall training standings (auto cache-or-fetch)
 */
export const getOverallTrainingStandings = async (req, res) => {
  try {
    const { trainingId } = req.params;
    
    const cacheKey = generateCacheKey("overall", trainingId);
    
    const result = await getOrFetch(cacheKey, async () => {
      const training = await Training.findById(trainingId)
        .populate("trainees")
        .populate("sheets")
        .populate("contests");
        
      if (!training) {
        throw new Error("Training not found");
      }
      
      return await fetchAndCacheOverallStandings(training);
    });
    
    res.status(200).json({
      success: true,
      data: result.data,
      fromCache: result.fromCache,
      message: result.fromCache 
        ? "Data retrieved from cache" 
        : "Fresh data fetched and cached"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


/**
 * not checked
 * Get overall standings with filtering options
 */
export const getTrainingOverallStandingsFiltered = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { coach, minRating, maxRating, sortBy } = req.query;
    
    const training = await Training.findById(trainingId)
      .populate("trainees")
      .populate("sheets")
      .populate("contests");
    
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    // Filter trainees based on query params
    let filteredTrainees = training.trainees;
    
    if (coach) {
      filteredTrainees = filteredTrainees.filter(t => t.coach === coach);
    }
    
    if (minRating) {
      filteredTrainees = filteredTrainees.filter(t => t.rating >= parseInt(minRating));
    }
    
    if (maxRating) {
      filteredTrainees = filteredTrainees.filter(t => t.rating <= parseInt(maxRating));
    }
    
    if (filteredTrainees.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No trainees match the filter criteria"
      });
    }
    
    console.log(`Calculating standings for ${filteredTrainees.length} filtered trainees...`);
    
    const items = [
      ...training.sheets.map(s => ({ ...s.toObject(), type: "Sheet" })),
      ...training.contests.map(c => ({ ...c.toObject(), type: "Contest" }))
    ];
    
    const standings = await Promise.all(
      filteredTrainees.map(async (trainee) => {
        try {
          let totalSolved = 0;
          let totalProblems = 0;
          let totalPoints = 0;
          const itemsDetails = [];
          
          for (const item of items) {
            try {
              const solvedProblems = await checkSolvedProblems(
                trainee.handle,
                item.problems
              );
              
              const solvedCount = solvedProblems.filter(p => p.solved).length;
              const itemPoints = calculatePoints(solvedCount, item.problems.length);
              
              totalSolved += solvedCount;
              totalProblems += item.problems.length;
              totalPoints += itemPoints;
              
              itemsDetails.push({
                itemId: item._id,
                itemType: item.type,
                title: item.title,
                solvedCount,
                totalProblems: item.problems.length,
                points: itemPoints,
                percentage: Math.round((solvedCount / item.problems.length) * 100)
              });
            } catch (error) {
              itemsDetails.push({
                itemId: item._id,
                itemType: item.type,
                title: item.title,
                error: error.message,
                solvedCount: 0,
                totalProblems: item.problems.length,
                points: 0,
                percentage: 0
              });
            }
          }
          
          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            color: trainee.color,
            coach: trainee.coach,
            totalSolved,
            totalProblems,
            totalPoints,
            averagePercentage: totalProblems > 0 
              ? Math.round((totalSolved / totalProblems) * 100) 
              : 0,
            itemsDetails,
          };
        } catch (error) {
          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            error: error.message,
            totalSolved: 0,
            totalProblems: items.reduce((sum, item) => sum + item.problems.length, 0),
            totalPoints: 0,
            averagePercentage: 0,
          };
        }
      })
    );
    
    // Sort based on sortBy parameter
    switch (sortBy) {
      case "solved":
        standings.sort((a, b) => b.totalSolved - a.totalSolved);
        break;
      case "percentage":
        standings.sort((a, b) => b.averagePercentage - a.averagePercentage);
        break;
      case "rating":
        standings.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        standings.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // "points" or undefined
        standings.sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
          }
          return b.totalSolved - a.totalSolved;
        });
    }
    
    // Add rank
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });
    
    res.status(200).json({
      success: true,
      data: {
        training: {
          id: training._id,
          title: training.title,
          level: training.level,
          totalTrainees: training.trainees.length,
          filteredTrainees: filteredTrainees.length,
          sheetsCount: training.sheets.length,
          contestsCount: training.contests.length,
        },
        filters: {
          coach: coach || null,
          minRating: minRating || null,
          maxRating: maxRating || null,
          sortBy: sortBy || "points"
        },
        standings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * not checked
 * Get standings summary (stats only, no details)
 */
export const getTrainingStandingsSummary = async (req, res) => {
  try {
    const { trainingId } = req.params;
    
    const training = await Training.findById(trainingId)
      .populate("trainees")
      .populate("sheets")
      .populate("contests");
    
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    const items = [
      ...training.sheets.map(s => ({ ...s.toObject(), type: "Sheet" })),
      ...training.contests.map(c => ({ ...c.toObject(), type: "Contest" }))
    ];
    
    const totalProblems = items.reduce((sum, item) => sum + item.problems.length, 0);
    
    const standings = await Promise.all(
      training.trainees.map(async (trainee) => {
        try {
          let totalSolved = 0;
          let totalPoints = 0;
          
          for (const item of items) {
            const solvedProblems = await checkSolvedProblems(
              trainee.handle,
              item.problems
            );
            
            const solvedCount = solvedProblems.filter(p => p.solved).length;
            const itemPoints = calculatePoints(solvedCount, item.problems.length);
            
            totalSolved += solvedCount;
            totalPoints += itemPoints;
          }
          
          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            color: trainee.color,
            totalSolved,
            totalProblems,
            totalPoints,
            percentage: Math.round((totalSolved / totalProblems) * 100)
          };
        } catch (error) {
          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            error: error.message,
            totalSolved: 0,
            totalProblems,
            totalPoints: 0,
            percentage: 0
          };
        }
      })
    );
    
    standings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.totalSolved - a.totalSolved;
    });
    
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });
    
    res.status(200).json({
      success: true,
      data: {
        training: {
          id: training._id,
          title: training.title,
          level: training.level,
        },
        standings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};