import Contest from "../models/Contest.js";

// Create a new contest
export const createContest = async (req, res) => {
  try {
    const contest = new Contest(req.body);
    await contest.save();
    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Get all contests
export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ addedAt: -1 });
    res.status(200).json({ success: true, count: contests.length, data: contests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get single contest by ID
export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update contest
export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete contest
export const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    res.status(200).json({ success: true, message: "Contest deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Add problem to contest
export const addProblemToContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    contest.problems.push(req.body);
    await contest.save();
    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// Remove problem from contest
export const removeProblemFromContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    contest.problems = contest.problems.filter(
      (p) => p._id.toString() !== req.params.problemId
    );
    await contest.save();
    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};