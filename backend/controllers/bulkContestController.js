import Contest from "../models/Contest.js";
import Sheet from "../models/Sheet.js";
import { getMultipleContestsInfo } from "../services/codeforcesService.js";

/**
 * Bulk import contests from Codeforces
 * Takes an array of contest IDs and creates/updates contests in database
 */
export const bulkImportContests = async (req, res) => {
  try {
    const { contestIds, asSheets } = req.body;
    
    if (!contestIds || !Array.isArray(contestIds) || contestIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contest IDs array is required and must not be empty"
      });
    }
    
    // Remove duplicates and convert to numbers
    const uniqueContestIds = [...new Set(contestIds.map(id => parseInt(id)))].filter(id => !isNaN(id));

    if (uniqueContestIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid contest IDs provided"
      });
    }
    
    console.log(`Fetching data for ${uniqueContestIds.length} contests from Codeforces...`);
    
    // Fetch all contests info from Codeforces API
    const contestsData = await getMultipleContestsInfo(uniqueContestIds, asSheets);
    
    const results = {
      created: [],
      updated: [],
      failed: [],
    };
    
    // Process each contest
    for (const contestData of contestsData) {
      try {
        if (!contestData.success) {
          results.failed.push({
            contestId: contestData.contestId,
            error: contestData.error,
          });
          continue;
        }
        
        // Prepare problems array
        const problems = contestData.problems.map(p => ({
          name: `${p.contestId}${p.index}`,
          alpha: p.index,
        }));
        
        const contestInfo = {
          title: contestData.name,
          duration: Math.floor(contestData.durationSeconds / 60), // Convert to minutes
          cfContestId: contestData.contestId.toString(),
          problems: problems,
        };
        
        if (asSheets) {
          // Create/Update as Sheet
          let sheet = await Sheet.findOne({ title: contestData.name });
          
          if (sheet) {
            // Update existing sheet
            sheet.duration = contestInfo.duration;
            sheet.problems = contestInfo.problems;
            await sheet.save();
            results.updated.push({
              id: sheet._id,
              type: "sheet",
              title: sheet.title,
              problems: sheet.problems.length,
              cfContestId: contestInfo.cfContestId
            });
          } else {
            // Create new sheet
            const newSheet = new Sheet(contestInfo);
            await newSheet.save();

            results.created.push({
              id: newSheet._id,
              type: "sheet",
              title: newSheet.title,
              problems: newSheet.problems.length,
              cfContestId: contestInfo.cfContestId
            });
          }
        } else {
          // Create/Update as Contest
          let contest = await Contest.findOne({ cfContestId: contestData.contestId.toString() });
          
          if (contest) {
            // Update existing contest
            contest.title = contestInfo.title;
            contest.duration = contestInfo.duration;
            contest.problems = contestInfo.problems;
            await contest.save();
            
            results.updated.push({
              id: contest._id,
              type: "contest",
              title: contest.title,
              cfContestId: contest.cfContestId,
              problems: contest.problems.length,
            });
          } else {
            // Create new contest
            const newContest = new Contest(contestInfo);
            await newContest.save();
            
            results.created.push({
              id: newContest._id,
              type: "contest",
              title: newContest.title,
              cfContestId: newContest.cfContestId,
              problems: newContest.problems.length,
            });
          }
        }
      } catch (error) {
        results.failed.push({
          contestId: contestData.contestId,
          error: error.message,
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: "Bulk import completed",
      data: {
        total: uniqueContestIds.length,
        created: results.created.length,
        updated: results.updated.length,
        failed: results.failed.length,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Bulk import contests as sheets
 * Convenience method that calls bulkImportContests with asSheets=true
 */
export const bulkImportContestsAsSheets = async (req, res) => {
  req.body.asSheets = true;
  return bulkImportContests(req, res);
};

/**
 * Get contest data from Codeforces without saving
 * Useful for previewing before importing
 */
export const previewContests = async (req, res) => {
  try {
    const { contestIds } = req.body;
    
    if (!contestIds || !Array.isArray(contestIds) || contestIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contest IDs array is required and must not be empty"
      });
    }
    
    const uniqueContestIds = [...new Set(contestIds.map(id => parseInt(id)))].filter(id => !isNaN(id));
    
    if (uniqueContestIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid contest IDs provided"
      });
    }
    
    console.log(`Previewing ${uniqueContestIds.length} contests from Codeforces...`);
    
    const contestsData = await getMultipleContestsInfo(uniqueContestIds);
    
    const successful = contestsData.filter(c => c.success);
    const failed = contestsData.filter(c => !c.success);
    
    res.status(200).json({
      success: true,
      message: "Preview completed",
      data: {
        total: uniqueContestIds.length,
        successful: successful.length,
        failed: failed.length,
        contests: successful.map(c => ({
          contestId: c.contestId,
          name: c.name,
          type: c.type,
          phase: c.phase,
          duration: Math.floor(c.durationSeconds / 60),
          problems: c.problems.length,
          problemsList: c.problems.map(p => ({
            index: p.index,
            name: p.name,
            rating: p.rating,
            tags: p.tags,
          })),
        })),
        failedContests: failed,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Import a single contest with custom settings
 */
export const importSingleContest = async (req, res) => {
  try {
    const { contestId, asSheet, customTitle, customDuration } = req.body;
    
    if (!contestId) {
      return res.status(400).json({
        success: false,
        error: "Contest ID is required"
      });
    }
    
    console.log(`Fetching contest ${contestId} from Codeforces...`);
    
    const contestsData = await getMultipleContestsInfo([parseInt(contestId)]);
    const contestData = contestsData[0];
    
    if (!contestData.success) {
      return res.status(404).json({
        success: false,
        error: contestData.error,
      });
    }
    
    // Prepare problems array
    const problems = contestData.problems.map(p => ({
      name: `${p.contestId}${p.index}`,
      alpha: p.index,
    }));
    
    const contestInfo = {
      title: customTitle || contestData.name,
      duration: customDuration || Math.floor(contestData.durationSeconds / 60),
      cfContestId: contestData.contestId.toString(),
      problems: problems,
    };
    
    let result;
    
    if (asSheet) {
      // Create as Sheet
      const newSheet = new Sheet(contestInfo);
      await newSheet.save();
      
      result = {
        id: newSheet._id,
        type: "sheet",
        title: newSheet.title,
        problems: newSheet.problems.length,
        data: newSheet,
      };
    } else {
      // Create as Contest
      const newContest = new Contest(contestInfo);
      await newContest.save();
      
      result = {
        id: newContest._id,
        type: "contest",
        title: newContest.title,
        cfContestId: newContest.cfContestId,
        problems: newContest.problems.length,
        data: newContest,
      };
    }
    
    res.status(201).json({
      success: true,
      message: `${asSheet ? 'Sheet' : 'Contest'} imported successfully`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Sync contest problems (update problems list from Codeforces)
 */
export const syncContestProblems = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }
    
    if (!contest.cfContestId) {
      return res.status(400).json({
        success: false,
        error: "Contest does not have a Codeforces contest ID"
      });
    }
    
    console.log(`Syncing problems for contest ${contest.cfContestId}...`);
    
    const contestsData = await getMultipleContestsInfo([parseInt(contest.cfContestId)]);
    const contestData = contestsData[0];
    
    if (!contestData.success) {
      return res.status(500).json({
        success: false,
        error: contestData.error,
      });
    }
    
    // Update problems
    contest.problems = contestData.problems.map(p => ({
      name: `${p.contestId}${p.index}`,
      alpha: p.index,
    }));
    
    contest.title = contestData.name;
    contest.duration = Math.floor(contestData.durationSeconds / 60);
    
    await contest.save();
    
    res.status(200).json({
      success: true,
      message: "Contest synced successfully",
      data: contest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Sync sheet problems
 */
export const syncSheetProblems = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sheet = await Sheet.findById(id);
    if (!sheet) {
      return res.status(404).json({
        success: false,
        error: "Sheet not found"
      });
    }
    
    // Extract contest ID from first problem
    if (!sheet.problems || sheet.problems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Sheet has no problems"
      });
    }
    
    const match = sheet.problems[0].name.match(/^(\d+)[A-Z]/);
    if (!match) {
      return res.status(400).json({
        success: false,
        error: "Cannot extract contest ID from problem names"
      });
    }
    
    const contestId = match[1];
    
    console.log(`Syncing problems for sheet from contest ${contestId}...`);
    
    const contestsData = await getMultipleContestsInfo([parseInt(contestId)]);
    const contestData = contestsData[0];
    
    if (!contestData.success) {
      return res.status(500).json({
        success: false,
        error: contestData.error,
      });
    }
    
    // Update problems
    sheet.problems = contestData.problems.map(p => ({
      name: `${p.contestId}${p.index}`,
      alpha: p.index,
    }));
    
    await sheet.save();
    
    res.status(200).json({
      success: true,
      message: "Sheet synced successfully",
      data: sheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};