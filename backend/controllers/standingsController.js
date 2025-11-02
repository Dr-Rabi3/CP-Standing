import Training from "../models/Training.js";
import Sheet from "../models/Sheet.js";
import Contest from "../models/Contest.js";
import {
  getOrFetch,
  fetchAndCacheSheetStandings,
  fetchAndCacheContestStandings,
  fetchAndCacheOverallStandings,
} from "../services/redisCacheService.js";

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
 * Get sheet standings (auto cache-or-fetch)
 */
export const getSheetStandings = async (req, res) => {
  try {
    const { trainingId, sheetId } = req.params;
    
    const cacheKey = generateCacheKey("sheet", trainingId, sheetId);
    
    // Use getOrFetch: returns cache if available, otherwise fetches and caches
    const result = await getOrFetch(cacheKey, async () => {
      // Fetch function - only called if not in cache
      const training = await Training.findById(trainingId).populate("trainees");
      if (!training) {
        throw new Error("Training not found");
      }
      
      const sheet = await Sheet.findById(sheetId);
      if (!sheet) {
        throw new Error("Sheet not found");
      }
      
      if (!training.sheets.includes(sheetId)) {
        throw new Error("Sheet is not part of this training");
      }
      
      return await fetchAndCacheSheetStandings(training, sheet);
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
 * Get contest standings (auto cache-or-fetch)
 */
export const getContestStandings = async (req, res) => {
  try {
    const { trainingId, contestId } = req.params;
    
    const cacheKey = generateCacheKey("contest", trainingId, contestId);
    
    const result = await getOrFetch(cacheKey, async () => {
      const training = await Training.findById(trainingId).populate("trainees");
      if (!training) {
        throw new Error("Training not found");
      }
      
      const contest = await Contest.findById(contestId);
      if (!contest) {
        throw new Error("Contest not found");
      }
      
      if (!training.contests.includes(contestId)) {
        throw new Error("Contest is not part of this training");
      }
      
      return await fetchAndCacheContestStandings(training, contest);
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



// Sync trainee data from Codeforces
export const syncTraineeFromCodeforces = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trainee = await Trainee.findById(id);
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    
    const cfData = await getUserInfo(trainee.handle);
    
    trainee.rating = cfData.rating;
    trainee.color = getRatingColor(cfData.rating);
    
    await trainee.save();
    
    res.status(200).json({
      success: true,
      message: "Trainee synced successfully",
      data: trainee,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update performance for sheet
export const updateSheetPerformance = async (req, res) => {
  try {
    const { trainingId, sheetId, traineeId } = req.params;
    
    const trainee = await Trainee.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    
    const sheet = await Sheet.findById(sheetId);
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }
    
    const solvedProblems = await checkSolvedProblems(
      trainee.handle,
      sheet.problems
    );
    
    const solvedCount = solvedProblems.filter(p => p.solved).length;
    const points = calculatePoints(solvedCount, sheet.problems.length);
    
    let performance = trainee.performances.find(
      p => p.itemId.toString() === sheetId && p.itemType === "Sheet"
    );
    
    if (performance) {
      const oldPoints = performance.points;
      performance.problemsSolved = solvedCount;
      performance.points = points;
      trainee.pointsCollected += (points - oldPoints);
    } else {
      trainee.performances.push({
        itemId: sheetId,
        itemType: "Sheet",
        problemsSolved: solvedCount,
        points: points,
      });
      trainee.pointsCollected += points;
    }
    
    await trainee.save();
    
    res.status(200).json({
      success: true,
      message: "Performance updated successfully",
      data: {
        trainee,
        solvedCount,
        totalProblems: sheet.problems.length,
        points,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update performance for contest
export const updateContestPerformance = async (req, res) => {
  try {
    const { trainingId, contestId, traineeId } = req.params;
    
    const trainee = await Trainee.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    
    const solvedProblems = await checkSolvedProblems(
      trainee.handle,
      contest.problems
    );
    
    const solvedCount = solvedProblems.filter(p => p.solved).length;
    const points = calculatePoints(solvedCount, contest.problems.length);
    
    let performance = trainee.performances.find(
      p => p.itemId.toString() === contestId && p.itemType === "Contest"
    );
    
    if (performance) {
      const oldPoints = performance.points;
      performance.problemsSolved = solvedCount;
      performance.points = points;
      trainee.pointsCollected += (points - oldPoints);
    } else {
      trainee.performances.push({
        itemId: contestId,
        itemType: "Contest",
        problemsSolved: solvedCount,
        points: points,
      });
      trainee.pointsCollected += points;
    }
    
    await trainee.save();
    
    res.status(200).json({
      success: true,
      message: "Performance updated successfully",
      data: {
        trainee,
        solvedCount,
        totalProblems: contest.problems.length,
        points,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk update all trainees performance for a sheet
export const bulkUpdateSheetPerformance = async (req, res) => {
  try {
    const { trainingId, sheetId } = req.params;
    
    const training = await Training.findById(trainingId).populate("trainees");
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    const sheet = await Sheet.findById(sheetId);
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }
    
    const results = await Promise.all(
      training.trainees.map(async (trainee) => {
        try {
          const solvedProblems = await checkSolvedProblems(
            trainee.handle,
            sheet.problems
          );
          
          const solvedCount = solvedProblems.filter(p => p.solved).length;
          const points = calculatePoints(solvedCount, sheet.problems.length);
          
          let performance = trainee.performances.find(
            p => p.itemId.toString() === sheetId && p.itemType === "Sheet"
          );
          
          if (performance) {
            const oldPoints = performance.points;
            performance.problemsSolved = solvedCount;
            performance.points = points;
            trainee.pointsCollected += (points - oldPoints);
          } else {
            trainee.performances.push({
              itemId: sheetId,
              itemType: "Sheet",
              problemsSolved: solvedCount,
              points: points,
            });
            trainee.pointsCollected += points;
          }
          
          await trainee.save();
          
          return {
            traineeId: trainee._id,
            handle: trainee.handle,
            success: true,
            solvedCount,
            points,
          };
        } catch (error) {
          return {
            traineeId: trainee._id,
            handle: trainee.handle,
            success: false,
            error: error.message,
          };
        }
      })
    );
    
    res.status(200).json({
      success: true,
      message: "Bulk update completed",
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk update all trainees performance for a contest
export const bulkUpdateContestPerformance = async (req, res) => {
  try {
    const { trainingId, contestId } = req.params;
    
    const training = await Training.findById(trainingId).populate("trainees");
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    
    const results = await Promise.all(
      training.trainees.map(async (trainee) => {
        try {
          const solvedProblems = await checkSolvedProblems(
            trainee.handle,
            contest.problems
          );
          
          const solvedCount = solvedProblems.filter(p => p.solved).length;
          const points = calculatePoints(solvedCount, contest.problems.length);
          
          let performance = trainee.performances.find(
            p => p.itemId.toString() === contestId && p.itemType === "Contest"
          );
          
          if (performance) {
            const oldPoints = performance.points;
            performance.problemsSolved = solvedCount;
            performance.points = points;
            trainee.pointsCollected += (points - oldPoints);
          } else {
            trainee.performances.push({
              itemId: contestId,
              itemType: "Contest",
              problemsSolved: solvedCount,
              points: points,
            });
            trainee.pointsCollected += points;
          }
          
          await trainee.save();
          
          return {
            traineeId: trainee._id,
            handle: trainee.handle,
            success: true,
            solvedCount,
            points,
          };
        } catch (error) {
          return {
            traineeId: trainee._id,
            handle: trainee.handle,
            success: false,
            error: error.message,
          };
        }
      })
    );
    
    res.status(200).json({
      success: true,
      message: "Bulk update completed",
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};  