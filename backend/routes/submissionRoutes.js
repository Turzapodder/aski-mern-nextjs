import express from "express";
import SubmissionController from "../controllers/submissionController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";

const router = express.Router();

router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

router.get("/", SubmissionController.listSubmissions);
router.get("/:id", SubmissionController.getSubmissionById);
router.post("/mark-under-review", SubmissionController.markUnderReview);
router.post("/latest-status", SubmissionController.getLatestStatusByAssignments);

export default router;
