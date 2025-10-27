import express from "express";
import {
  getSheetStandings,
  getContestStandings,
  syncTraineeFromCodeforces,
  updateSheetPerformance,
  updateContestPerformance,
  bulkUpdateSheetPerformance,
  bulkUpdateContestPerformance,
} from "../controllers/standingsController.js";
import {
  getTrainingOverallStandings,
  getTrainingOverallStandingsFiltered,
  getTrainingStandingsSummary,
} from "../controllers/trainingStandingsController.js";

const router = express.Router();

// Training overall standings (before specific routes)
router.get("/trainings/:trainingId/overall", getTrainingOverallStandings);
router.get("/trainings/:trainingId/overall/filtered", getTrainingOverallStandingsFiltered);
router.get("/trainings/:trainingId/summary", getTrainingStandingsSummary);

// Get standings
router.get("/trainings/:trainingId/sheets/:sheetId/standings", getSheetStandings);
router.get("/trainings/:trainingId/contests/:contestId/standings", getContestStandings);

// Sync trainee data from Codeforces
router.post("/trainees/:id/sync", syncTraineeFromCodeforces);

// Update individual trainee performance
router.post(
  "/trainings/:trainingId/sheets/:sheetId/trainees/:traineeId/update",
  updateSheetPerformance
);
router.post(
  "/trainings/:trainingId/contests/:contestId/trainees/:traineeId/update",
  updateContestPerformance
);

// Bulk update all trainees performance
router.post(
  "/trainings/:trainingId/sheets/:sheetId/bulk-update",
  bulkUpdateSheetPerformance
);
router.post(
  "/trainings/:trainingId/contests/:contestId/bulk-update",
  bulkUpdateContestPerformance
);

export default router;