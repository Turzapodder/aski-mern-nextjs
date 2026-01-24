import express from "express";
import rateLimit from "express-rate-limit";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";
import ReportController from "../controllers/reportController.js";

const router = express.Router();

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    status: "failed",
    message: "Too many reports submitted. Please try again later.",
  },
});

router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

router.post("/", reportLimiter, ReportController.createReport);

export default router;
