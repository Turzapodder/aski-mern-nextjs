import express from "express";
import SessionController from "../controllers/sessionController.js";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const router = express.Router();

router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

router.get("/upcoming", SessionController.getUpcomingSessions);

export default router;
