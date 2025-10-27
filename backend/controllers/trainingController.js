import Training from "../models/Training.js";
import Trainee from "../models/Trainee.js";

// Create a new training
export const createTraining = async (req, res) => {
  try {
    const training = new Training(req.body);
    await training.save();
    res.status(201).json({ success: true, data: training });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all trainings
export const getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate("sheets")
      .populate("contests")
      .populate("trainees")
      .sort({ startDate: -1 });
    res.status(200).json({ success: true, count: trainings.length, data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single training by ID
export const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate("sheets")
      .populate("contests")
      .populate("trainees");
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update training
export const updateTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("sheets")
      .populate("contests")
      .populate("trainees");
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete training
export const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    res.status(200).json({ success: true, message: "Training deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add sheet to training
export const addSheetToTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    if (!training.sheets.includes(req.body.sheetId)) {
      training.sheets.push(req.body.sheetId);
      await training.save();
      await training.populate("sheets");
    }
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Remove sheet from training
export const removeSheetFromTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    training.sheets = training.sheets.filter(
      (s) => s.toString() !== req.params.sheetId
    );
    await training.save();
    await training.populate("sheets");
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add contest to training
export const addContestToTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    if (!training.contests.includes(req.body.contestId)) {
      training.contests.push(req.body.contestId);
      await training.save();
      await training.populate("contests");
    }
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Remove contest from training
export const removeContestFromTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    training.contests = training.contests.filter(
      (c) => c.toString() !== req.params.contestId
    );
    await training.save();
    await training.populate("contests");
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add trainee to training
export const addTraineeToTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    if (!training.trainees.includes(req.body.traineeId)) {
      training.trainees.push(req.body.traineeId);
      await training.save();
      await training.populate("trainees");
    }
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Add multiple trainees to training
export const addMultipleTraineesToTraining = async (req, res) => {
  try {
    const { traineeIds } = req.body;
    
    if (!traineeIds || !Array.isArray(traineeIds) || traineeIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "traineeIds array is required and must not be empty"
      });
    }
    
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    // Verify all trainees exist
    const trainees = await Trainee.find({ _id: { $in: traineeIds } });
    
    if (trainees.length !== traineeIds.length) {
      const foundIds = trainees.map(t => t._id.toString());
      const notFoundIds = traineeIds.filter(id => !foundIds.includes(id.toString()));
      
      return res.status(404).json({
        success: false,
        error: "Some trainees not found",
        notFoundIds
      });
    }
    
    const results = {
      added: [],
      alreadyExists: [],
    };
    
    // Add trainees that aren't already in the training
    traineeIds.forEach(traineeId => {
      const traineeIdStr = traineeId.toString();
      const exists = training.trainees.some(t => t.toString() === traineeIdStr);
      
      if (exists) {
        const trainee = trainees.find(t => t._id.toString() === traineeIdStr);
        results.alreadyExists.push({
          id: traineeId,
          name: trainee.name,
          handle: trainee.handle
        });
      } else {
        training.trainees.push(traineeId);
        const trainee = trainees.find(t => t._id.toString() === traineeIdStr);
        results.added.push({
          id: traineeId,
          name: trainee.name,
          handle: trainee.handle
        });
      }
    });
    
    await training.save();
    await training.populate("trainees");
    
    res.status(200).json({
      success: true,
      message: "Trainees processed",
      data: {
        training,
        added: results.added.length,
        alreadyExists: results.alreadyExists.length,
        results
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Add trainees by handles to training
export const addTraineesByHandlesToTraining = async (req, res) => {
  try {
    const { handles } = req.body;
    
    if (!handles || !Array.isArray(handles) || handles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "handles array is required and must not be empty"
      });
    }
    
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    // Find trainees by handles
    const trainees = await Trainee.find({ handle: { $in: handles } });
    
    const results = {
      added: [],
      alreadyExists: [],
      notFound: [],
    };
    
    const foundHandles = trainees.map(t => t.handle.toLowerCase());
    
    // Check which handles were not found
    handles.forEach(handle => {
      if (!foundHandles.includes(handle.toLowerCase())) {
        results.notFound.push(handle);
      }
    });
    
    // Add found trainees to training
    trainees.forEach(trainee => {
      const traineeIdStr = trainee._id.toString();
      const exists = training.trainees.some(t => t.toString() === traineeIdStr);
      
      if (exists) {
        results.alreadyExists.push({
          id: trainee._id,
          name: trainee.name,
          handle: trainee.handle
        });
      } else {
        training.trainees.push(trainee._id);
        results.added.push({
          id: trainee._id,
          name: trainee.name,
          handle: trainee.handle
        });
      }
    });
    
    await training.save();
    await training.populate("trainees");
    
    res.status(200).json({
      success: true,
      message: "Trainees processed",
      data: {
        training,
        added: results.added.length,
        alreadyExists: results.alreadyExists.length,
        notFound: results.notFound.length,
        results
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Add trainees by coach to training
export const addTraineesByCoachToTraining = async (req, res) => {
  try {
    const { coach } = req.body;
    
    if (!coach) {
      return res.status(400).json({
        success: false,
        error: "coach is required"
      });
    }
    
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    // Find all trainees with this coach
    const trainees = await Trainee.find({ coach });
    
    if (trainees.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No trainees found for coach: ${coach}`
      });
    }
    
    const results = {
      added: [],
      alreadyExists: [],
    };
    
    // Add trainees to training
    trainees.forEach(trainee => {
      const traineeIdStr = trainee._id.toString();
      const exists = training.trainees.some(t => t.toString() === traineeIdStr);
      
      if (exists) {
        results.alreadyExists.push({
          id: trainee._id,
          name: trainee.name,
          handle: trainee.handle
        });
      } else {
        training.trainees.push(trainee._id);
        results.added.push({
          id: trainee._id,
          name: trainee.name,
          handle: trainee.handle
        });
      }
    });
    
    await training.save();
    await training.populate("trainees");
    
    res.status(200).json({
      success: true,
      message: `Trainees from coach ${coach} processed`,
      data: {
        training,
        coach,
        totalTraineesForCoach: trainees.length,
        added: results.added.length,
        alreadyExists: results.alreadyExists.length,
        results
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Remove trainee from training
export const removeTraineeFromTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    training.trainees = training.trainees.filter(
      (t) => t.toString() !== req.params.traineeId
    );
    await training.save();
    await training.populate("trainees");
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get trainings by level
export const getTrainingsByLevel = async (req, res) => {
  try {
    const trainings = await Training.find({ level: req.params.level })
      .populate("sheets")
      .populate("contests")
      .populate("trainees")
      .sort({ startDate: -1 });
    res.status(200).json({ success: true, count: trainings.length, data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get specific sheet in training
export const getSheetInTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate("sheets");
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    const sheet = training.sheets.find(s => s._id.toString() === req.params.sheetId);
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found in this training" });
    }
    
    res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get specific contest in training
export const getContestInTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate("contests");
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found" });
    }
    
    const contest = training.contests.find(c => c._id.toString() === req.params.contestId);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found in this training" });
    }
    
    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};