import express from "express";
import WalletController from "../controllers/walletController.js";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const router = express.Router();

router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

router.post("/withdraw", WalletController.requestWithdrawal);

export default router;
