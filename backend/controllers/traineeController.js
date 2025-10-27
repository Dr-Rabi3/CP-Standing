import Trainee from "../models/Trainee.js";

// Create a new trainee
export const createTrainee = async (req, res) => {
  try {
    const trainee = new Trainee(req.body);
    await trainee.save();
    res.status(201).json({ success: true, data: trainee });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all trainees
export const getAllTrainees = async (req, res) => {
  try {
    const trainees = await Trainee.find().sort({ pointsCollected: -1 });
    res.status(200).json({ success: true, count: trainees.length, data: trainees.map(trainee => trainee._id) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single trainee by ID
export const getTraineeById = async (req, res) => {
  try {
    const trainee = await Trainee.findById(req.params.id);
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    res.status(200).json({ success: true, data: trainee });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get trainee by handle
export const getTraineeByHandle = async (req, res) => {
  try {
    const trainee = await Trainee.findOne({ handle: req.params.handle });
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    res.status(200).json({ success: true, data: trainee });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update trainee
export const updateTrainee = async (req, res) => {
  try {
    const trainee = await Trainee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    res.status(200).json({ success: true, data: trainee });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete trainee
export const deleteTrainee = async (req, res) => {
  try {
    const trainee = await Trainee.findByIdAndDelete(req.params.id);
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    res.status(200).json({ success: true, message: "Trainee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add performance to trainee
export const addPerformance = async (req, res) => {
  try {
    const trainee = await Trainee.findById(req.params.id);
    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    trainee.performances.push(req.body);
    trainee.pointsCollected += req.body.points || 0;
    await trainee.save();
    res.status(200).json({ success: true, data: trainee });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update trainee performance
export const updatePerformance = async (req, res) => {
  try {
    const trainee = await Trainee.findById(req.params.id);

    if (!trainee) {
      return res.status(404).json({ success: false, error: "Trainee not found" });
    }
    
    const performance = trainee.performances.id(req.params.performanceId);
    if (!performance) {
      return res.status(404).json({ success: false, error: "Performance not found" });
    }
    
    const oldPoints = performance.points;
    Object.assign(performance, req.body);
    trainee.pointsCollected += (performance.points - oldPoints);
    
    await trainee.save();
    res.status(200).json({ success: true, data: trainee });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get trainees by coach
export const getTraineesByCoach = async (req, res) => {
  try {
    const trainees = await Trainee.find({ coach: req.params.coach }).sort({ pointsCollected: -1 });
    res.status(200).json({ success: true, count: trainees.length, data: trainees });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};