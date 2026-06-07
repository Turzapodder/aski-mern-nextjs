import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import UserModel from "../models/User.js";
import TransactionModel from "../models/Transaction.js";
import AdminLogModel from "../models/AdminLog.js";
import AdminController from "../controllers/adminController.js";

const databaseUrl = process.env.DATABASE_URL || "";

const makeRes = () => {
  const res = { statusCode: 0, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

test(
  "rejectWithdrawal refunds the debited balance exactly once and is idempotent",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const adminId = new mongoose.Types.ObjectId();
    const txnId = `WTH-REJECT-${seed}`;
    const amount = 200;
    let connectedHere = false;
    let userId;

    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(databaseUrl, { dbName: "aski-db" });
        connectedHere = true;
      }

      const user = await UserModel.create({
        name: `Reject ${seed}`,
        email: `wth-reject-${seed}@example.com`,
        password: "Password123!",
        roles: ["tutor"],
        wallet: {
          availableBalance: 300,
          withdrawalHistory: [
            { amount, status: "PENDING", requestedAt: new Date(), transactionId: txnId },
          ],
        },
      });
      userId = user._id;
      await TransactionModel.create({
        userId: user._id,
        type: "withdrawal",
        amount,
        status: "pending",
        gatewayId: txnId,
        relatedTo: { model: "User", id: user._id },
      });

      const call = () => {
        const req = { params: { id: txnId }, body: { note: "declined" }, user: { _id: adminId } };
        const res = makeRes();
        return AdminController.rejectWithdrawal(req, res).then(() => res);
      };

      const first = await call();
      assert.equal(first.statusCode, 200, "reject should succeed");

      let fresh = await UserModel.findById(userId).lean();
      assert.equal(Number(fresh.wallet.availableBalance), 500, "balance refunded once (300 + 200)");
      const entry = fresh.wallet.withdrawalHistory.find((e) => e.transactionId === txnId);
      assert.equal(entry.status, "FAILED");
      const txn = await TransactionModel.findOne({ gatewayId: txnId, type: "withdrawal" }).lean();
      assert.equal(txn.status, "failed");

      const second = await call();
      assert.equal(second.statusCode, 400, "second reject must be blocked (already processed)");
      fresh = await UserModel.findById(userId).lean();
      assert.equal(Number(fresh.wallet.availableBalance), 500, "no double refund on replay");
    } finally {
      await TransactionModel.deleteMany({ gatewayId: txnId });
      if (userId) await UserModel.deleteOne({ _id: userId });
      await AdminLogModel.deleteMany({ adminId });
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);
