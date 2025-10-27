import Training from "../models/Training.js";
import Trainee from "../models/Trainee.js";
import Sheet from "../models/Sheet.js";
import Contest from "../models/Contest.js";
import { 
  checkSolvedProblems,
  getContestStandings as fetchCFStandings, 
  calculatePoints 
} from "../services/codeforcesService.js";

/**
 * Get overall standings for a training
 * Combines performance from all sheets and contests
 */
export const getTrainingOverallStandings = async (req, res) => {
  try {
    const { trainingId } = req.params;
    
    const training = await Training.findById(trainingId)
      .populate("trainees")
      .populate("sheets")
      .populate("contests");
    
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    if (training.trainees.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No trainees in this training"
      });
    }
    
    console.log(`Calculating overall standings for ${training.trainees.length} trainees...`);
    
    // Get all items (sheets + contests) with their problems
    const items = [
      ...training.sheets.map(s => ({ ...s.toObject(), type: "Sheet" })),
      ...training.contests.map(c => ({ ...c.toObject(), type: "Contest" }))
    ];
    const handles = training.trainees.map(t => t.handle);

     // Map to accumulate total solved per trainee
    const traineeTotals = new Map();

    // For each item, calculate standings
    for (const item of items) {
      try {
        const cfStanding = await fetchCFStandings(
          item.cfContestId,
          handles,
          item.type === "Sheet"
        );

        // Loop over each trainee
        for (const trainee of training.trainees) {
          const cfData = cfStanding.find((s) => s.handle === trainee.handle);
          const solvedCount = cfData
            ? cfData.problemResults.filter((pr) => pr.points > 0).length
            : 0;
          // Update trainee's total solved problems
          const currentTotal = traineeTotals.get(trainee.handle) || {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            color: trainee.color,
            totalSolved: 0,
            totalPoints: 0,
            titlePhoto: trainee.titlePhoto,
            coach: trainee.coach,
            items: [], // store per-item performance
          };

          currentTotal.totalSolved += solvedCount;
          currentTotal.totalPoints += cfData ? cfData.points : 0;

          currentTotal.items.push({
            itemId: item._id,
            title: item.title,
            type: item.type,
            solvedCount,
            totalProblems: item.problems.length,
            points: cfData ? cfData.points : 0,
          });

          traineeTotals.set(trainee.handle, currentTotal);
        }
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
    // Convert Map to sorted array (highest solved first)
    const standings = Array.from(traineeTotals.values()).sort(
      (a, b) =>
        b.totalSolved - a.totalSolved || b.totalPoints - a.totalPoints
    );
    
    
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
          sheetsCount: training.sheets.length,
          contestsCount: training.contests.length,
          totalItems: items.length,
          totalProblems: items.reduce((sum, item) => sum + item.problems.length, 0),
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