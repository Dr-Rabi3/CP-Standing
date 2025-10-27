import Training from "../models/Training.js";
import Trainee from "../models/Trainee.js";
import Sheet from "../models/Sheet.js";
import Contest from "../models/Contest.js";
import {
  getUserInfo,
  checkSolvedProblems,
  getContestStandings as fetchCFStandings,
  calculatePoints,
  getRatingColor,
} from "../services/codeforcesService.js";


// Helper: Extract Codeforces contest ID from contest
const extractContestId = (contest) => {
  // If contest has a cfContestId field, use it
  if (contest.cfContestId) return contest.cfContestId;
  
  // Try to extract from first problem (e.g., "1234A" -> "1234")
  if (contest.problems && contest.problems.length > 0) {
    const match = contest.problems[0].name.match(/^(\d+)[A-Z]/);
    if (match) return match[1];
  }
  
  return null;
};

// Get sheet standings (uses individual checks - Approach 1)
export const getSheetStandings = async (req, res) => {
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
    
    if (!training.sheets.includes(sheetId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Sheet is not part of this training" 
      });
    }
    
    
    const cfSheetId = sheet.cfContestId;
    try {
      console.log(`Fetching sheet standings for ${training.trainees.length} trainees...`);
      const handles = training.trainees.map(t => t.handle);
      const cfStandings = await fetchCFStandings(cfSheetId, handles, true);

      // Map CF standings to our format
      const standings = training.trainees.map(trainee => {
        const cfData = cfStandings.find(s => s.handle === trainee.handle);
        
        if (cfData) {
          const solvedCount = cfData.problemResults.filter(
            pr => pr.points > 0
          ).length;
          
          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            titlePhoto: trainee.titlePhoto,
            color: trainee.color,
            rank: cfData.rank,
            solvedCount,
            totalProblems: sheet.problems.length,
            points: cfData.points,
            penalty: cfData.penalty,
            problemResults: cfData.problemResults,
            coach: trainee.coach,
          };
        }
        
        // Trainee didn't participate
        return {
          traineeId: trainee._id,
          name: trainee.name,
          handle: trainee.handle,
          rating: trainee.rating,
          titlePhoto: trainee.titlePhoto,
          color: trainee.color,
          rank: null,
          solvedCount: 0,
          totalProblems: sheet.problems.length,
          points: 0,
          participated: false,
          coach: trainee.coach,
        };
      });
      standings.sort((a, b) => (b.points || 0) - (a.points || 0));
      
      return res.status(200).json({
        success: true,
        method: "official_standings",
        data: {
          sheet: {
            id: sheet._id,
            title: sheet.title,
            cfSheetId,
            totalProblems: sheet.problems.length,
          },
          standings,
        },
      });
    } catch (error) {
      console.error(`Error fetching sheet standings: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get contest standings (uses bulk fetch - Approach 2)
export const getContestStandings = async (req, res) => {
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
    
    if (!training.contests.includes(contestId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Contest is not part of this training" 
      });
    }
    
    const cfContestId = extractContestId(contest);
    
    // APPROACH 2: Try to get official standings first (optimal)
    if (cfContestId) {
      try {
        console.log(`Fetching CF contest ${cfContestId} standings (1 API call)...`);
        
        const handles = training.trainees.map(t => t.handle);
        const cfStandings = await fetchCFStandings(cfContestId, handles);
        
        // Map CF standings to our format
        const standings = training.trainees.map(trainee => {
          const cfData = cfStandings.find(s => s.handle === trainee.handle);
          
          if (cfData) {
            const solvedCount = cfData.problemResults.filter(
              pr => pr.points > 0
            ).length;
            
            return {
              traineeId: trainee._id,
              name: trainee.name,
              handle: trainee.handle,
              rating: trainee.rating,
              titlePhoto: trainee.titlePhoto,
              color: trainee.color,
              rank: cfData.rank,
              solvedCount,
              totalProblems: contest.problems.length,
              points: cfData.points,
              penalty: cfData.penalty,
              problemResults: cfData.problemResults,
            };
          }
          
          // Trainee didn't participate
          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            titlePhoto: trainee.titlePhoto,
            color: trainee.color,
            rank: null,
            solvedCount: 0,
            totalProblems: contest.problems.length,
            points: 0,
            participated: false,
          };
        });
        
        standings.sort((a, b) => (b.points || 0) - (a.points || 0));
        
        return res.status(200).json({
          success: true,
          method: "official_standings",
          data: {
            contest: {
              id: contest._id,
              title: contest.title,
              cfContestId,
              totalProblems: contest.problems.length,
            },
            standings,
          },
        });
      } catch (cfError) {
        console.warn(`Failed to fetch CF standings: ${cfError.message}`);
        console.log("Falling back to individual submission checks...");
      }
    }
    
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