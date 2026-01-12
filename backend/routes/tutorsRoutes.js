import express from "express";
import TutorsController from "../controllers/tutorsController.js";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public endpoints
router.get("/", TutorsController.listTutors);
router.get("/profile/:identifier", TutorsController.getPublicTutorProfile);

// Protected endpoints
router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

router.patch("/me/availability", TutorsController.updateAvailability);
router.patch("/me/settings", TutorsController.updateSettings);

export default router;
