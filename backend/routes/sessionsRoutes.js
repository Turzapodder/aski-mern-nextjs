import express from "express";
import SessionController from "../controllers/sessionController.js";
import SessionPaymentController from "../controllers/sessionPaymentController.js";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public payment routes (gateway callbacks/webhooks)
if (process.env.NODE_ENV !== "production") {
  router.get("/payment/mock", SessionPaymentController.handleSessionMockGateway);
  router.get("/payment/mock-complete", SessionPaymentController.handleSessionMockComplete);
}
router.get("/payment/callback", SessionPaymentController.handleSessionPaymentCallback);
router.get("/payment/cancel", SessionPaymentController.handleSessionPaymentCancel);
router.post("/payment/webhook", SessionPaymentController.handleSessionPaymentWebhook);
router.get("/payment/verify", SessionPaymentController.verifySessionPayment);

router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

router.get("/upcoming", SessionController.getUpcomingSessions);
router.post("/book", SessionController.bookSession);
router.post("/:id/complete", SessionPaymentController.completeSession);
router.post("/:id/cancel", SessionPaymentController.cancelSession);
router.put("/:id", SessionController.modifySession);

export default router;
