import express from "express";
import NotificationController from "../controllers/notificationController.js";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const router = express.Router();

const protectedRoutes = [AccessTokenAutoRefresh, checkUserAuth];

router.get("/", protectedRoutes, NotificationController.getMyNotifications);
router.patch("/read-all", protectedRoutes, NotificationController.markAllRead);
router.patch("/:id/read", protectedRoutes, NotificationController.markAsRead);

export default router;
