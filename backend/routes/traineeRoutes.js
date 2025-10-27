import express from "express";
import {
  createTrainee,
  getAllTrainees,
  getTraineeById,
  getTraineeByHandle,
  updateTrainee,
  deleteTrainee,
  addPerformance,
  updatePerformance,
  getTraineesByCoach,
} from "../controllers/traineeController.js";
import {
  bulkImportTrainees,
  bulkSyncAllTrainees,
  bulkSyncTraineesByCoach,
  bulkSyncTraineesInTraining,
} from "../controllers/bulkTraineeController.js";


const router = express.Router();

// IMPORTANT: Specific routes MUST come BEFORE dynamic /:id routes

// Bulk operations routes (before any /:id routes)
router.post("/bulk-import", bulkImportTrainees);
router.post("/bulk-sync", bulkSyncAllTrainees);
router.post("/bulk-sync/coach/:coach", bulkSyncTraineesByCoach);
router.post("/bulk-sync/training/:trainingId", bulkSyncTraineesInTraining);

// Get routes with specific patterns (before /:id)
router.get("/coach/:coach", getTraineesByCoach);
router.get("/handle/:handle", getTraineeByHandle);

// List all trainees (before /:id)
router.get("/", getAllTrainees);

// Create new trainee (before /:id)
router.post("/", createTrainee);

// Dynamic ID routes (MUST be last)
router.get("/:id", getTraineeById);
router.put("/:id", updateTrainee);
router.delete("/:id", deleteTrainee);

// Performance management routes with :id
router.post("/:id/performances", addPerformance);
router.put("/:id/performances/:performanceId", updatePerformance);
export default router;