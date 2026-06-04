import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import SessionModel from "../models/Session.js";
import UserModel from "../models/User.js";
import TransactionModel from "../models/Transaction.js";
import {
  __verifyAndApplySessionPaymentForTest,
  __releaseSessionEscrowForTest,
  __refundSessionEscrowForTest,
} from "../controllers/sessionPaymentController.js";

const databaseUrl = process.env.DATABASE_URL || "";

const zeroFeeSettings = {
  findOne: () => ({
    session: () => ({ lean: async () => ({ platformFeeRate: 0, minTransactionFee: 0 }) }),
  }),
};

const connect = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(databaseUrl, { dbName: "aski-db" });
    return true;
  }
  return false;
};

const makeParticipants = async (seed, { escrowBalance = 0 } = {}) => {
  const student = await UserModel.create({
    name: `Session Student ${seed}`,
    email: `session-student-${seed}@example.com`,
    password: "Password123!",
    roles: ["user"],
    wallet: { escrowBalance },
  });
  const tutor = await UserModel.create({
    name: `Session Tutor ${seed}`,
    email: `session-tutor-${seed}@example.com`,
    password: "Password123!",
    roles: ["tutor"],
  });
  return { student, tutor };
};

const makeSession = (student, tutor, { price, status = "pending_payment", paymentStatus = "pending" }) =>
  SessionModel.create({
    tutor: tutor._id,
    student: student._id,
    subject: "Testing",
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
    duration: 60,
    slot: "10:00-11:00",
    price,
    billingType: "hourly",
    status,
    paymentStatus,
  });

const cleanup = async (ids) => {
  if (ids.session) {
    await TransactionModel.deleteMany({ "relatedTo.model": "Session", "relatedTo.id": ids.session });
    await SessionModel.deleteOne({ _id: ids.session });
  }
  if (ids.student) await UserModel.deleteOne({ _id: ids.student });
  if (ids.tutor) await UserModel.deleteOne({ _id: ids.tutor });
};

const mockVerify = (sessionId, amount, status = "COMPLETED") => async (invoiceId) => ({
  status,
  amount,
  transaction_id: `TXN-${invoiceId}`,
  payment_method: "bkash",
  metadata: { sessionId: String(sessionId), type: "session" },
});

test(
  "parallel session payment funds escrow exactly once and confirms the session",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 900;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor } = await makeParticipants(seed);
      const session = await makeSession(student, tutor, { price: amount });
      ids = { student: student._id, tutor: tutor._id, session: session._id };

      const invoiceId = `INV-SES-${seed}`;
      const call = () =>
        __verifyAndApplySessionPaymentForTest({
          invoiceId,
          source: "test",
          deps: { verifyPaymentFn: mockVerify(session._id, amount) },
        });

      const results = await Promise.all([call(), call()]);
      const transitions = results.filter((r) => r.didTransitionToPaid).length;
      assert.equal(transitions, 1, "exactly one call should fund/confirm");

      const [freshStudent, freshSession, escrowTxns] = await Promise.all([
        UserModel.findById(student._id).lean(),
        SessionModel.findById(session._id).lean(),
        TransactionModel.find({ type: "escrow_hold", "relatedTo.model": "Session", "relatedTo.id": session._id }).lean(),
      ]);
      assert.equal(Number(freshStudent.wallet?.escrowBalance || 0), amount, "escrow funded once");
      assert.equal(freshSession.status, "scheduled");
      assert.equal(freshSession.paymentStatus, "paid");
      assert.equal(escrowTxns.length, 1, "one escrow_hold ledger entry");
      assert.equal(escrowTxns[0].status, "completed");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "a non-completed gateway status funds no escrow and leaves the session pending",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 500;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor } = await makeParticipants(seed);
      const session = await makeSession(student, tutor, { price: amount });
      ids = { student: student._id, tutor: tutor._id, session: session._id };

      const result = await __verifyAndApplySessionPaymentForTest({
        invoiceId: `INV-PEND-${seed}`,
        source: "test",
        deps: { verifyPaymentFn: mockVerify(session._id, amount, "PENDING") },
      });
      assert.equal(result.didTransitionToPaid, false);

      const [freshStudent, freshSession] = await Promise.all([
        UserModel.findById(student._id).lean(),
        SessionModel.findById(session._id).lean(),
      ]);
      assert.equal(Number(freshStudent.wallet?.escrowBalance || 0), 0, "no escrow before payment");
      assert.equal(freshSession.status, "pending_payment");
      assert.equal(freshSession.paymentStatus, "pending");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "session completion releases escrow to the tutor exactly once",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 700;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor } = await makeParticipants(seed, { escrowBalance: amount });
      const session = await makeSession(student, tutor, { price: amount, status: "scheduled", paymentStatus: "paid" });
      ids = { student: student._id, tutor: tutor._id, session: session._id };

      const call = () => __releaseSessionEscrowForTest({ sessionId: session._id, deps: { PlatformSettingsModel: zeroFeeSettings } });
      const results = await Promise.all([call(), call()]);
      assert.equal(results.filter((r) => r.didComplete).length, 1, "release happens once");

      const [freshStudent, freshTutor, freshSession] = await Promise.all([
        UserModel.findById(student._id).lean(),
        UserModel.findById(tutor._id).lean(),
        SessionModel.findById(session._id).lean(),
      ]);
      assert.equal(Number(freshStudent.wallet?.escrowBalance || 0), 0, "escrow debited once");
      assert.equal(Number(freshTutor.wallet?.availableBalance || 0), amount, "tutor credited once");
      assert.equal(freshSession.status, "completed");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "cancelling a paid session refunds escrow to the student; unpaid cancels with no money moved",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 600;
    let connectedHere = false;
    let paidIds = {};
    let unpaidIds = {};
    try {
      connectedHere = await connect();

      const paid = await makeParticipants(`${seed}-p`, { escrowBalance: amount });
      const paidSession = await makeSession(paid.student, paid.tutor, { price: amount, status: "scheduled", paymentStatus: "paid" });
      paidIds = { student: paid.student._id, tutor: paid.tutor._id, session: paidSession._id };

      const refund = await __refundSessionEscrowForTest({ sessionId: paidSession._id });
      assert.equal(refund.didCancel, true);
      assert.equal(refund.refunded, true);
      const [refStudent, refSession] = await Promise.all([
        UserModel.findById(paid.student._id).lean(),
        SessionModel.findById(paidSession._id).lean(),
      ]);
      assert.equal(Number(refStudent.wallet?.escrowBalance || 0), 0, "escrow released on refund");
      assert.equal(Number(refStudent.wallet?.availableBalance || 0), amount, "amount refunded to wallet");
      assert.equal(refSession.status, "cancelled");
      assert.equal(refSession.paymentStatus, "refunded");

      const unpaid = await makeParticipants(`${seed}-u`);
      const unpaidSession = await makeSession(unpaid.student, unpaid.tutor, { price: amount });
      unpaidIds = { student: unpaid.student._id, tutor: unpaid.tutor._id, session: unpaidSession._id };
      const cancel = await __refundSessionEscrowForTest({ sessionId: unpaidSession._id });
      assert.equal(cancel.didCancel, true);
      assert.equal(cancel.refunded, false, "no refund for an unpaid session");
      const freshUnpaidStudent = await UserModel.findById(unpaid.student._id).lean();
      assert.equal(Number(freshUnpaidStudent.wallet?.availableBalance || 0), 0, "no money moved for unpaid cancel");
    } finally {
      await cleanup(paidIds);
      await cleanup(unpaidIds);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);
