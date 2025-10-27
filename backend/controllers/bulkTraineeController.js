import Trainee from "../models/Trainee.js";
import Training from "../models/Training.js";
import { getMultipleUsersInfo, getRatingColor } from "../services/codeforcesService.js";

/**
 * Bulk import trainees from Codeforces
 * Takes an array of handles and creates/updates trainees in database
 */
export const bulkImportTrainees = async (req, res) => {
  try {
    const { handles, coach, trainingId } = req.body;

    if (!handles || !Array.isArray(handles) || handles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Handles array is required and must not be empty"
      });
    }
    
    // Remove duplicates and empty strings
    const uniqueHandles = [...new Set(handles.filter(h => h && h.trim()))];
    
    if (uniqueHandles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid handles provided"
      });
    }
    
    console.log(`Fetching data for ${uniqueHandles.length} handles from Codeforces...`);
    
    // Fetch all users info from Codeforces API (single request)
    const usersData = await getMultipleUsersInfo(uniqueHandles);
    
    const results = {
      created: [],
      updated: [],
      failed: [],
    };
    
    // Process each user
    for (const userData of usersData) {
      try {
        // Check if trainee already exists
        let trainee = await Trainee.findOne({ handle: userData.handle });
        
        if (trainee) {
          // Update existing trainee
          trainee.name = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : trainee.name || userData.handle;
          trainee.rating = userData.rating;
          trainee.color = getRatingColor(userData.rating);
          trainee.titlePhoto = userData.titlePhoto;
          if (coach) trainee.coach = coach;
          
          await trainee.save();
          
          results.updated.push({
            handle: trainee.handle,
            name: trainee.name,
            rating: trainee.rating,
            color: trainee.color,
          });
        } else {
          // Create new trainee
          const newTrainee = new Trainee({
            name: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`.trim()
              : userData.handle,
            handle: userData.handle,
            coach: coach || "",
            rating: userData.rating,
            color: getRatingColor(userData.rating),
            titlePhoto: userData.titlePhoto,
            pointsCollected: 0,
            performances: [],
          });
          
          await newTrainee.save();
          
          results.created.push({
            handle: newTrainee.handle,
            name: newTrainee.name,
            rating: newTrainee.rating,
            color: newTrainee.color,
            titlePhoto: newTrainee.titlePhoto,
          });
        }
      } catch (error) {
        results.failed.push({
          handle: userData.handle,
          error: error.message,
        });
      }
    }
    
    // Check for handles that weren't found in Codeforces
    const foundHandles = usersData.map(u => u.handle.toLowerCase());
    const notFoundHandles = uniqueHandles.filter(
      h => !foundHandles.includes(h.toLowerCase())
    );
    
    notFoundHandles.forEach(handle => {
      results.failed.push({
        handle,
        error: "Handle not found on Codeforces",
      });
    });
    
    res.status(201).json({
      success: true,
      message: "Bulk import completed",
      data: {
        total: uniqueHandles.length,
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
 * Bulk sync existing trainees from Codeforces
 * Updates rating and color for all trainees in database
 */
export const bulkSyncAllTrainees = async (req, res) => {
  try {
    const trainees = await Trainee.find();
    
    if (trainees.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No trainees found in database"
      });
    }
    
    const handles = trainees.map(t => t.handle);
    
    console.log(`Syncing ${handles.length} trainees from Codeforces...`);
    
    // Fetch all users info from Codeforces API
    const usersData = await getMultipleUsersInfo(handles);
    
    const results = {
      synced: [],
      failed: [],
    };
    
    // Create a map for quick lookup
    const usersMap = new Map(usersData.map(u => [u.handle.toLowerCase(), u]));
    
    // Update each trainee
    for (const trainee of trainees) {
      try {
        const userData = usersMap.get(trainee.handle.toLowerCase());
        
        if (userData) {
          trainee.rating = userData.rating;
          trainee.color = getRatingColor(userData.rating);
          trainee.titlePhoto = userData.titlePhoto;
          // Optionally update name if it was just the handle
          if (trainee.name === trainee.handle && userData.firstName && userData.lastName) {
            trainee.name = `${userData.firstName} ${userData.lastName}`.trim();
          }
          
          await trainee.save();
          
          results.synced.push({
            handle: trainee.handle,
            name: trainee.name,
            rating: trainee.rating,
            color: trainee.color,
            titlePhoto: trainee.titlePhoto,
          });
        } else {
          results.failed.push({
            handle: trainee.handle,
            error: "Handle not found on Codeforces",
          });
        }
      } catch (error) {
        results.failed.push({
          handle: trainee.handle,
          error: error.message,
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Bulk sync completed",
      data: {
        total: trainees.length,
        synced: results.synced.length,
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
 * Bulk sync trainees by coach
 * Updates rating and color for all trainees under a specific coach
 */
export const bulkSyncTraineesByCoach = async (req, res) => {
  try {
    const { coach } = req.params;
    
    const trainees = await Trainee.find({ coach });
    
    if (trainees.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No trainees found for coach: ${coach}`
      });
    }
    
    const handles = trainees.map(t => t.handle);
    
    console.log(`Syncing ${handles.length} trainees for coach ${coach} from Codeforces...`);
    
    const usersData = await getMultipleUsersInfo(handles);
    
    const results = {
      synced: [],
      failed: [],
    };
    
    const usersMap = new Map(usersData.map(u => [u.handle.toLowerCase(), u]));
    
    for (const trainee of trainees) {
      try {
        const userData = usersMap.get(trainee.handle.toLowerCase());
        
        if (userData) {
          trainee.rating = userData.rating;
          trainee.color = getRatingColor(userData.rating);
          trainee.titlePhoto = userData.titlePhoto;
          await trainee.save();
          
          results.synced.push({
            handle: trainee.handle,
            name: trainee.name,
            rating: trainee.rating,
            color: trainee.color,
            titlePhoto: trainee.titlePhoto,
          });
        } else {
          results.failed.push({
            handle: trainee.handle,
            error: "Handle not found on Codeforces",
          });
        }
      } catch (error) {
        results.failed.push({
          handle: trainee.handle,
          error: error.message,
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk sync completed for coach: ${coach}`,
      data: {
        coach,
        total: trainees.length,
        synced: results.synced.length,
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
 * Bulk sync trainees in a training
 * Updates rating and color for all trainees in a specific training program
 */
export const bulkSyncTraineesInTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    
    const training = await Training.findById(trainingId).populate("trainees");
    
    if (!training) {
      return res.status(404).json({
        success: false,
        error: "Training not found"
      });
    }
    
    if (training.trainees.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No trainees in this training"
      });
    }
    
    const handles = training.trainees.map(t => t.handle);
    
    console.log(`Syncing ${handles.length} trainees in training ${training.title}...`);
    
    const usersData = await getMultipleUsersInfo(handles);
    
    const results = {
      synced: [],
      failed: [],
    };
    
    const usersMap = new Map(usersData.map(u => [u.handle.toLowerCase(), u]));
    
    for (const trainee of training.trainees) {
      try {
        const userData = usersMap.get(trainee.handle.toLowerCase());
        
        if (userData) {
          trainee.rating = userData.rating;
          trainee.color = getRatingColor(userData.rating);
          trainee.titlePhoto = userData.titlePhoto;
          await trainee.save();
          
          results.synced.push({
            handle: trainee.handle,
            name: trainee.name,
            rating: trainee.rating,
            color: trainee.color,
            titlePhoto: trainee.titlePhoto,
          });
        } else {
          results.failed.push({
            handle: trainee.handle,
            error: "Handle not found on Codeforces",
          });
        }
      } catch (error) {
        results.failed.push({
          handle: trainee.handle,
          error: error.message,
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk sync completed for training: ${training.title}`,
      data: {
        trainingId: training._id,
        trainingTitle: training.title,
        total: training.trainees.length,
        synced: results.synced.length,
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