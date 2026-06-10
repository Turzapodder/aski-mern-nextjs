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

      if (parsedAmount < 500) {
        return res.status(400).json({
          success: false,
          error: "Minimum withdrawal is 500 BDT",
          code: "MIN_WITHDRAWAL",
        });
      }

      if (!bankDetails || typeof bankDetails !== "object") {
        return res.status(400).json({
          success: false,
          error: "Payout details are required",
          code: "INVALID_BANK_DETAILS",
        });
      }

      const paymentMethod = bankDetails.paymentMethod || "bank";
      if (!["bank", "mobile_banking", "card"].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          error: "Invalid payout method selection",
          code: "INVALID_PAYMENT_METHOD",
        });
      }

      const sanitizedBankDetails = {
        paymentMethod,
      };

      if (paymentMethod === "bank") {
        const requiredBankFields = [
          "accountName",
          "accountNumber",
          "bankName",
          "branchName",
          "routingNumber",
        ];
        for (const field of requiredBankFields) {
          sanitizedBankDetails[field] = sanitizeText(bankDetails[field]);
          if (!sanitizedBankDetails[field]) {
            return res.status(400).json({
              success: false,
              error: `Bank detail ${field} is required`,
              code: "INVALID_BANK_DETAILS",
            });
          }
        }
      } else if (paymentMethod === "mobile_banking") {
        const requiredMobileFields = ["provider", "mobileNumber", "accountType"];
        for (const field of requiredMobileFields) {
          sanitizedBankDetails[field] = sanitizeText(bankDetails[field]);
          if (!sanitizedBankDetails[field]) {
            return res.status(400).json({
              success: false,
              error: `Mobile banking detail ${field} is required`,
              code: "INVALID_BANK_DETAILS",
            });
          }
        }
      } else if (paymentMethod === "card") {
        const requiredCardFields = ["cardholderName", "cardNumber", "cardType"];
        for (const field of requiredCardFields) {
          sanitizedBankDetails[field] = sanitizeText(bankDetails[field]);
          if (!sanitizedBankDetails[field]) {
            return res.status(400).json({
              success: false,
              error: `Card detail ${field} is required`,
              code: "INVALID_BANK_DETAILS",
            });
          }
        }
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

          let displayName = "";
          let last4 = "";

          if (sanitizedBankDetails.paymentMethod === "bank") {
            displayName = sanitizedBankDetails.bankName;
            last4 = sanitizedBankDetails.accountNumber.slice(-4);
          } else if (sanitizedBankDetails.paymentMethod === "mobile_banking") {
            displayName = sanitizedBankDetails.provider;
            last4 = sanitizedBankDetails.mobileNumber.slice(-4);
          } else if (sanitizedBankDetails.paymentMethod === "card") {
            displayName = sanitizedBankDetails.cardType;
            last4 = sanitizedBankDetails.cardNumber.slice(-4);
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
                  bankName: displayName,
                  accountLast4: last4,
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

  static getWalletOverview = async (req, res) => {
    try {
      const user = req.user;
      
      const dbUser = await UserModel.findById(user._id).select("wallet roles");
      if (!dbUser) {
        return res.status(404).json({
          success: false,
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Fetch dynamic transactions list
      const transactions = await TransactionModel.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(50);

      // Group weekly cashflow data based on actual transactions
      const dailyEarnings = Array(7).fill(0);
      const dailyDeposits = Array(7).fill(0);
      const dailyWithdrawals = Array(7).fill(0);

      const daysOfWeek = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        daysOfWeek.push(d.toLocaleDateString("en-US", { weekday: "short" }));
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      const recentTx = await TransactionModel.find({
        userId: user._id,
        createdAt: { $gte: oneWeekAgo },
        status: "completed",
      });

      recentTx.forEach((tx) => {
        const txDate = new Date(tx.createdAt);
        const diffTime = Math.abs(now - txDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
        const index = 6 - diffDays;
        
        if (index >= 0 && index < 7) {
          if (tx.type === "escrow_release" || tx.type === "deposit") {
            dailyEarnings[index] += tx.amount;
          }
          if (tx.type === "deposit") {
            dailyDeposits[index] += tx.amount;
          }
          if (tx.type === "withdrawal") {
            dailyWithdrawals[index] += tx.amount;
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          wallet: dbUser.wallet || {
            availableBalance: 0,
            escrowBalance: 0,
            totalEarnings: 0,
            withdrawalHistory: [],
            bankDetails: {},
          },
          transactions: transactions.map((t) => ({
            id: t._id,
            type: t.type,
            typeLabel: t.typeLabel,
            amount: t.amount,
            status: t.status.toUpperCase(),
            createdAt: t.createdAt,
            transactionId: t.gatewayId || t._id,
          })),
          weeklyCashflow: {
            labels: daysOfWeek,
            earnings: dailyEarnings,
            deposits: dailyDeposits,
            withdrawals: dailyWithdrawals,
          },
        },
      });
    } catch (error) {
      logger.error("Error fetching wallet overview:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to retrieve wallet data",
        code: "SERVER_ERROR",
      });
    }
  };
}

export default WalletController;
