import Sheet from "../models/Sheet.js";

// Create a new sheet
export const createSheet = async (req, res) => {
  try {
    const sheet = new Sheet(req.body);
    await sheet.save();
    res.status(201).json({ success: true, data: sheet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all sheets
export const getAllSheets = async (req, res) => {
  try {
    const sheets = await Sheet.find().sort({ addedAt: -1 });
    res.status(200).json({ success: true, count: sheets.length, data: sheets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get single sheet by ID
export const getSheetById = async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }
    res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Update sheet
export const updateSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }
    res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete sheet
export const deleteSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndDelete(req.params.id);
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }
    res.status(200).json({ success: true, message: "Sheet deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add problem to sheet
export const addProblemToSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }
    sheet.problems.push(req.body);
    await sheet.save();
    res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Remove problem from sheet
export const removeProblemFromSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }
    sheet.problems = sheet.problems.filter(
      (p) => p._id.toString() !== req.params.problemId
    );
    await sheet.save();
    res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};