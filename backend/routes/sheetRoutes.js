import express from "express";
import {
  createSheet,
  getAllSheets,
  getSheetById,
  updateSheet,
  deleteSheet,
  addProblemToSheet,
  removeProblemFromSheet,
} from "../controllers/sheetController.js";
import {
  bulkImportContestsAsSheets,
  previewContests,
  syncSheetProblems,
} from "../controllers/bulkContestController.js";

const router = express.Router();

// Bulk import routes (before /:id routes)
router.post("/bulk-import", bulkImportContestsAsSheets);
router.post("/preview", previewContests);

// Basic CRUD routes
router.post("/", createSheet);
router.get("/", getAllSheets);

// Sync sheet problems (before /:id to avoid conflict)
router.post("/sync/:id", syncSheetProblems);

// Dynamic ID routes
router.get("/:id", getSheetById);
router.put("/:id", updateSheet);
router.delete("/:id", deleteSheet);

// Problem management routes
router.post("/:id/problems", addProblemToSheet);
router.delete("/:id/problems/:problemId", removeProblemFromSheet);

export default router;