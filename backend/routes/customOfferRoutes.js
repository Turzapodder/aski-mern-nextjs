import express from "express";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";
import CustomOfferController from "../controllers/customOfferController.js";

const router = express.Router();

router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

router.get("/conversation/:chatId", CustomOfferController.getActiveOffer);
router.post("/", CustomOfferController.createOffer);
router.post("/:offerId/accept", CustomOfferController.acceptOffer);
router.post("/:offerId/decline", CustomOfferController.declineOffer);

export default router;
