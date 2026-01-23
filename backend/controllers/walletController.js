import crypto from "crypto";
import UserModel from "../models/User.js";
import TransactionModel from "../models/Transaction.js";
import logger from "../utils/logger.js";

const REQUIRED_BANK_FIELDS = [
  "accountName",
  "accountNumber",
  "bankName",
  "branchName",
  "routingNumber",
];

const sanitizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

class WalletController {
  static requestWithdrawal = async (req, res) => {
    try {
      const user = req.user;

      if (!user?.roles?.includes("tutor")) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          code: "FORBIDDEN",
        });
      }

      const { amount, bankDetails } = req.body || {};
      const parsedAmount = Number(amount);

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Amount must be greater than 0",
          code: "INVALID_AMOUNT",
        });
      }

      if (parsedAmount < 100) {
        return res.status(400).json({
          success: false,
          error: "Minimum withdrawal is 100 BDT",
          code: "MIN_WITHDRAWAL",
        });
      }

      if (!bankDetails || typeof bankDetails !== "object") {
        return res.status(400).json({
          success: false,
          error: "Bank details are required",
          code: "INVALID_BANK_DETAILS",
        });
      }

      const sanitizedBankDetails = REQUIRED_BANK_FIELDS.reduce((acc, field) => {
        acc[field] = sanitizeText(bankDetails[field]);
        return acc;
      }, {});

      const missingField = REQUIRED_BANK_FIELDS.find(
        (field) => !sanitizedBankDetails[field]
      );

      if (missingField) {
        return res.status(400).json({
          success: false,
          error: `Bank detail ${missingField} is required`,
          code: "INVALID_BANK_DETAILS",
        });
      }

      const walletSnapshot = await UserModel.findById(user._id).select(
        "wallet.availableBalance wallet.withdrawalHistory"
      );

      const availableBalance = walletSnapshot?.wallet?.availableBalance ?? 0;

      if (parsedAmount > availableBalance) {
        return res.status(400).json({
          success: false,
          error: "Amount cannot exceed available balance",
          code: "INSUFFICIENT_BALANCE",
        });
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const withdrawalsToday = (walletSnapshot?.wallet?.withdrawalHistory || [])
        .filter((entry) => entry?.requestedAt)
        .filter(
          (entry) =>
            entry.requestedAt >= startOfDay && entry.requestedAt <= endOfDay
        ).length;

      if (withdrawalsToday >= 3) {
        return res.status(429).json({
          success: false,
          error: "Maximum 3 withdrawals per day allowed",
          code: "WITHDRAWAL_LIMIT",
        });
      }

      const transactionId = crypto.randomUUID
        ? crypto.randomUUID()
        : crypto.randomBytes(16).toString("hex");

      const withdrawalEntry = {
        amount: parsedAmount,
        status: "PENDING",
        requestedAt: new Date(),
        transactionId,
      };

      const session = await UserModel.startSession();
      let updated;

      try {
        await session.withTransaction(async () => {
          updated = await UserModel.findOneAndUpdate(
            {
              _id: user._id,
              "wallet.availableBalance": { $gte: parsedAmount },
            },
            {
              $inc: { "wallet.availableBalance": -parsedAmount },
              $push: { "wallet.withdrawalHistory": withdrawalEntry },
              $set: { "wallet.bankDetails": sanitizedBankDetails },
            },
            { new: true, session }
          ).lean();

          if (!updated) {
            throw new Error("WITHDRAWAL_FAILED");
          }

          await TransactionModel.create(
            [
              {
                userId: user._id,
                type: "withdrawal",
                amount: parsedAmount,
                status: "pending",
                gatewayId: transactionId,
                relatedTo: { model: "User", id: user._id },
                metadata: {
                  bankName: sanitizedBankDetails.bankName,
                  accountLast4: sanitizedBankDetails.accountNumber.slice(-4),
                },
              },
            ],
            { session }
          );
        });
      } catch (error) {
        const message =
          error.message === "WITHDRAWAL_FAILED"
            ? "Unable to process withdrawal"
            : "Unable to submit withdrawal";
        return res.status(400).json({
          success: false,
          error: message,
          code: "WITHDRAWAL_FAILED",
        });
      } finally {
        session.endSession();
      }

      logger.info("Withdrawal request submitted", {
        userId: user._id,
        amount: parsedAmount,
        transactionId,
      });

      return res.status(200).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        data: { transactionId },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Unable to submit withdrawal",
        code: "SERVER_ERROR",
      });
    }
  };
}

export default WalletController;
