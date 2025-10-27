import express from "express";
import {
  createTraining,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
  addSheetToTraining,
  removeSheetFromTraining,
  addContestToTraining,
  removeContestFromTraining,
  addTraineeToTraining,
  addMultipleTraineesToTraining,
  addTraineesByHandlesToTraining,
  addTraineesByCoachToTraining,
  removeTraineeFromTraining,
  getTrainingsByLevel,
  getSheetInTraining,
  getContestInTraining,
} from "../controllers/trainingController.js";

const router = express.Router();

// Basic CRUD routes
router.post("/", createTraining);
router.get("/", getAllTrainings);
router.get("/level/:level", getTrainingsByLevel);
router.get("/:id", getTrainingById);
router.put("/:id", updateTraining);
router.delete("/:id", deleteTraining);

// Sheet management routes
router.post("/:id/sheets", addSheetToTraining);
router.get("/:id/sheets/:sheetId", getSheetInTraining);
router.delete("/:id/sheets/:sheetId", removeSheetFromTraining);

// Contest management routes
router.post("/:id/contests", addContestToTraining);
router.get("/:id/contests/:contestId", getContestInTraining);
router.delete("/:id/contests/:contestId", removeContestFromTraining);

// Trainee management routes
router.post("/:id/trainees", addTraineeToTraining);
router.post("/:id/trainees/bulk", addMultipleTraineesToTraining);
router.post("/:id/trainees/by-handles", addTraineesByHandlesToTraining);
router.post("/:id/trainees/by-coach", addTraineesByCoachToTraining);
router.delete("/:id/trainees/:traineeId", removeTraineeFromTraining);

export default router;