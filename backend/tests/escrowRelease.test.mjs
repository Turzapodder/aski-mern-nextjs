import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import AssignmentModel from "../models/Assignment.js";
import TransactionModel from "../models/Transaction.js";
import UserModel from "../models/User.js";
import { __releaseEscrowForCompletionForTest } from "../controllers/assignmentController.js";

const databaseUrl = process.env.DATABASE_URL || "";

const zeroFeeSettings = {
  findOne: () => ({
    session: () => ({
      lean: async () => ({ platformFeeRate: 0, minTransactionFee: 0 }),
    }),
  }),
};

const setup = async (seed, { escrowBalance, amount, status = "submitted" }) => {
  const student = await UserModel.create({
    name: `Release Student ${seed}`,
    email: `release-student-${seed}@example.com`,
    password: "Password123!",
    roles: ["user"],
    wallet: { escrowBalance },
  });
  const tutor = await UserModel.create({
    name: `Release Tutor ${seed}`,
    email: `release-tutor-${seed}@example.com`,
    password: "Password123!",
    roles: ["tutor"],
  });
  const assignment = await AssignmentModel.create({
    title: `Release Assignment ${seed}`,
    description: "Escrow release integration test",
    subject: "Testing",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    student: student._id,
    assignedTutor: tutor._id,
    status,
    paymentStatus: "paid",
    paymentAmount: amount,
    budget: amount,
  });
  return { student, tutor, assignment };
};

const cleanup = async (ids) => {
  if (ids.assignment) {
    await TransactionModel.deleteMany({
      "relatedTo.model": "Assignment",
      "relatedTo.id": ids.assignment,
    });
    await AssignmentModel.deleteOne({ _id: ids.assignment });
  }
  if (ids.student) await UserModel.deleteOne({ _id: ids.student });
  if (ids.tutor) await UserModel.deleteOne({ _id: ids.tutor });
};

const connect = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(databaseUrl, { dbName: "aski-db" });
    return true;
  }
  return false;
};

test(
  "parallel completion releases escrow exactly once (atomic + idempotent)",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 1000;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, assignment } = await setup(seed, { escrowBalance: amount, amount });
      ids = { student: student._id, tutor: tutor._id, assignment: assignment._id };

      const call = () =>
        __releaseEscrowForCompletionForTest({
          assignmentId: assignment._id,
          ratingValue: 5,
          feedbackComments: "Great work",
          deps: { PlatformSettingsModel: zeroFeeSettings },
        });

      const results = await Promise.all([call(), call()]);
      const completedCount = results.filter((r) => r.didComplete).length;
      assert.equal(completedCount, 1, "exactly one call should perform the completion");

      const [freshStudent, freshTutor, freshAssignment, releaseTxns] = await Promise.all([
        UserModel.findById(student._id).lean(),
        UserModel.findById(tutor._id).lean(),
        AssignmentModel.findById(assignment._id).lean(),
        TransactionModel.find({
          type: "escrow_release",
          "relatedTo.model": "Assignment",
          "relatedTo.id": assignment._id,
        }).lean(),
      ]);

      assert.equal(Number(freshStudent.wallet?.escrowBalance || 0), 0, "escrow debited exactly once");
      assert.equal(Number(freshTutor.wallet?.availableBalance || 0), amount, "tutor credited exactly once");
      assert.equal(Number(freshTutor.wallet?.totalEarnings || 0), amount);
      assert.equal(freshAssignment.status, "completed");
      assert.equal(freshAssignment.feedback?.rating, 5);
      assert.equal(releaseTxns.length, 1, "exactly one escrow_release ledger entry");
      assert.equal(Number(releaseTxns[0].amount), amount);
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "completion aborts (no payout) when escrow is underfunded",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 1000;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, assignment } = await setup(seed, { escrowBalance: 0, amount });
      ids = { student: student._id, tutor: tutor._id, assignment: assignment._id };

      await assert.rejects(
        () =>
          __releaseEscrowForCompletionForTest({
            assignmentId: assignment._id,
            ratingValue: 4,
            feedbackComments: "",
            deps: { PlatformSettingsModel: zeroFeeSettings },
          }),
        /ESCROW_RELEASE_INSUFFICIENT_FUNDS/
      );

      const [freshTutor, freshAssignment] = await Promise.all([
        UserModel.findById(tutor._id).lean(),
        AssignmentModel.findById(assignment._id).lean(),
      ]);
      assert.equal(Number(freshTutor.wallet?.availableBalance || 0), 0, "tutor must not be credited on abort");
      assert.equal(freshAssignment.status, "submitted", "assignment must not be completed on abort");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "second sequential completion is a no-op (idempotent), no double credit",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 800;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, assignment } = await setup(seed, { escrowBalance: amount, amount });
      ids = { student: student._id, tutor: tutor._id, assignment: assignment._id };

      const first = await __releaseEscrowForCompletionForTest({
        assignmentId: assignment._id,
        ratingValue: 5,
        feedbackComments: "ok",
        deps: { PlatformSettingsModel: zeroFeeSettings },
      });
      const second = await __releaseEscrowForCompletionForTest({
        assignmentId: assignment._id,
        ratingValue: 1,
        feedbackComments: "retry",
        deps: { PlatformSettingsModel: zeroFeeSettings },
      });

      assert.equal(first.didComplete, true);
      assert.equal(second.didComplete, false, "second call must be a no-op");

      const freshTutor = await UserModel.findById(tutor._id).lean();
      assert.equal(Number(freshTutor.wallet?.availableBalance || 0), amount, "no double credit on replay");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);
