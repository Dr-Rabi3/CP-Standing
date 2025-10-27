import express from "express";
import {
  createContest,
  getAllContests,
  getContestById,
  updateContest,
  deleteContest,
  addProblemToContest,
  removeProblemFromContest,
} from "../controllers/contestController.js";
import {
  bulkImportContests,
  previewContests,
  importSingleContest,
  syncContestProblems,
} from "../controllers/bulkContestController.js";

const router = express.Router();

// Bulk import routes (before /:id routes)
router.post("/bulk-import", bulkImportContests);
router.post("/preview", previewContests);
router.post("/import-single", importSingleContest);

// Basic CRUD routes
router.post("/", createContest);
router.get("/", getAllContests);

// Sync contest problems (before /:id to avoid conflict)
router.post("/sync/:id", syncContestProblems);

// Dynamic ID routes
router.get("/:id", getContestById);
router.put("/:id", updateContest);
router.delete("/:id", deleteContest);

// Problem management routes
router.post("/:id/problems", addProblemToContest);
router.delete("/:id/problems/:problemId", removeProblemFromContest);

export default router;