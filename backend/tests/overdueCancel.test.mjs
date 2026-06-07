import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import AssignmentModel from "../models/Assignment.js";
import TransactionModel from "../models/Transaction.js";
import UserModel from "../models/User.js";
import AssignmentController from "../controllers/assignmentController.js";

const databaseUrl = process.env.DATABASE_URL || "";

const connect = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(databaseUrl, { dbName: "aski-db" });
    return true;
  }
  return false;
};

const setup = async (seed, amount) => {
  const student = await UserModel.create({
    name: `Overdue Student ${seed}`,
    email: `overdue-student-${seed}@example.com`,
    password: "Password123!",
    roles: ["user"],
    wallet: { escrowBalance: amount, availableBalance: 0 },
  });
  const tutor = await UserModel.create({
    name: `Overdue Tutor ${seed}`,
    email: `overdue-tutor-${seed}@example.com`,
    password: "Password123!",
    roles: ["tutor"],
  });
  const assignment = await AssignmentModel.create({
    title: `Overdue Assignment ${seed}`,
    description: "Overdue cancellation idempotency test",
    subject: "Testing",
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    student: student._id,
    assignedTutor: tutor._id,
    status: "overdue",
    paymentStatus: "paid",
    paymentAmount: amount,
    budget: amount,
    overdueMarkedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    gracePeriodEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
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

const makeRes = () => {
  const res = { statusCode: 200, body: null };
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

const callCancel = (assignmentId, studentId) => {
  const req = {
    params: { id: assignmentId.toString() },
    user: { _id: studentId },
    app: { get: () => null },
  };
  const res = makeRes();
  return AssignmentController.cancelOverdueAssignment(req, res).then(() => res);
};

test(
  "concurrent cancel-overdue refunds the student exactly once (atomic + idempotent)",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 1500;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, assignment } = await setup(seed, amount);
      ids = { student: student._id, tutor: tutor._id, assignment: assignment._id };

      const [a, b] = await Promise.all([
        callCancel(assignment._id, student._id),
        callCancel(assignment._id, student._id),
      ]);

      const okCount = [a, b].filter((r) => r.statusCode === 200).length;
      assert.equal(okCount, 1, "exactly one cancel should succeed");

      const [freshStudent, freshAssignment, refundTxns] = await Promise.all([
        UserModel.findById(student._id).lean(),
        AssignmentModel.findById(assignment._id).lean(),
        TransactionModel.find({
          type: "refund",
          "relatedTo.model": "Assignment",
          "relatedTo.id": assignment._id,
        }).lean(),
      ]);

      assert.equal(Number(freshStudent.wallet?.escrowBalance || 0), 0, "escrow debited exactly once");
      assert.equal(
        Number(freshStudent.wallet?.availableBalance || 0),
        amount,
        "student credited exactly once (no double refund)"
      );
      assert.equal(freshAssignment.status, "cancelled");
      assert.equal(freshAssignment.paymentStatus, "refunded");
      assert.equal(refundTxns.length, 1, "exactly one refund ledger entry");
      assert.equal(Number(refundTxns[0].amount), amount);
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "cancel-overdue does not over-debit when escrow is missing (guarded debit aborts)",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const amount = 1200;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, assignment } = await setup(seed, amount);
      ids = { student: student._id, tutor: tutor._id, assignment: assignment._id };

      await UserModel.updateOne(
        { _id: student._id },
        { $set: { "wallet.escrowBalance": 0 } }
      );

      const res = await callCancel(assignment._id, student._id);
      assert.equal(res.statusCode, 500, "underfunded escrow must abort, not fabricate money");

      const freshStudent = await UserModel.findById(student._id).lean();
      assert.equal(
        Number(freshStudent.wallet?.escrowBalance || 0),
        0,
        "escrow must not go negative"
      );
      assert.equal(
        Number(freshStudent.wallet?.availableBalance || 0),
        0,
        "no refund credited when escrow was insufficient"
      );

      const freshAssignment = await AssignmentModel.findById(assignment._id).lean();
      assert.equal(freshAssignment.status, "overdue", "assignment must not be cancelled on abort");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);
