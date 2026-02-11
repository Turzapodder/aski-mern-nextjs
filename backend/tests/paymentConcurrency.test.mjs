import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import AssignmentModel from "../models/Assignment.js";
import TransactionModel from "../models/Transaction.js";
import UserModel from "../models/User.js";
import { __verifyAndApplyAssignmentPaymentForTest } from "../controllers/assignmentController.js";

const databaseUrl = process.env.DATABASE_URL || "";

test(
  "parallel verify calls only increment escrow once",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async (t) => {
    const uniqueSeed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const invoiceId = `INV-PAR-${uniqueSeed}`;
    const paymentAmount = 1200;

    let student;
    let assignment;
    let verifyCallCount = 0;
    let connectedHere = false;

    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(databaseUrl, { dbName: "aski-db" });
        connectedHere = true;
      }

      const helloInfo = await mongoose.connection.db.admin().command({ hello: 1 });
      const supportsTransactions = Boolean(helloInfo?.setName || helloInfo?.msg === "isdbgrid");
      if (!supportsTransactions) {
        t.skip("MongoDB deployment does not support transactions required by payment verification");
      }

      student = await UserModel.create({
        name: `Concurrency Student ${uniqueSeed}`,
        email: `concurrency-student-${uniqueSeed}@example.com`,
        password: "Password123!",
        roles: ["user"],
      });

      assignment = await AssignmentModel.create({
        title: `Concurrency Assignment ${uniqueSeed}`,
        description: "Integration test for concurrent payment verification",
        subject: "Testing",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        student: student._id,
        status: "proposal_accepted",
        paymentStatus: "pending",
        paymentAmount,
        budget: paymentAmount,
        estimatedCost: paymentAmount,
      });

      await TransactionModel.create({
        userId: student._id,
        type: "escrow_hold",
        amount: paymentAmount,
        status: "pending",
        gatewayId: invoiceId,
        relatedTo: { model: "Assignment", id: assignment._id },
        metadata: { provider: "uddoktapay", invoiceId },
      });

      const mockVerifyPaymentFn = async (incomingInvoiceId) => {
        verifyCallCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 25));
        return {
          status: "COMPLETED",
          amount: paymentAmount,
          transaction_id: `TXN-${incomingInvoiceId}`,
          payment_method: "bkash",
          metadata: {
            assignmentId: String(assignment._id),
          },
        };
      };

      const commonDeps = {
        verifyPaymentFn: mockVerifyPaymentFn,
        emitPaymentNotificationFn: async () => {},
      };

      const [firstResult, secondResult] = await Promise.all([
        __verifyAndApplyAssignmentPaymentForTest({
          invoiceId,
          source: "test_parallel_1",
          deps: commonDeps,
        }),
        __verifyAndApplyAssignmentPaymentForTest({
          invoiceId,
          source: "test_parallel_2",
          deps: commonDeps,
        }),
      ]);

      const paidTransitionCount = [firstResult, secondResult].filter(
        (result) => result.didTransitionToPaid
      ).length;
      assert.equal(paidTransitionCount, 1, "Exactly one verify call should perform paid transition");
      assert.equal(verifyCallCount, 2, "Both verify calls should hit mocked gateway verification");

      const [freshStudent, freshAssignment, escrowTransactions] = await Promise.all([
        UserModel.findById(student._id).lean(),
        AssignmentModel.findById(assignment._id).lean(),
        TransactionModel.find({
          type: "escrow_hold",
          "relatedTo.model": "Assignment",
          "relatedTo.id": assignment._id,
        }).lean(),
      ]);

      assert.ok(freshStudent, "Student should still exist");
      assert.ok(freshAssignment, "Assignment should still exist");
      assert.equal(
        Number(freshStudent.wallet?.escrowBalance || 0),
        paymentAmount,
        "Escrow balance should increase exactly once"
      );
      assert.equal(freshAssignment.paymentStatus, "paid");
      assert.equal(freshAssignment.status, "in_progress");
      assert.equal(freshAssignment.paymentGateway?.invoiceId, invoiceId);
      assert.equal(escrowTransactions.length, 1, "Should keep one escrow_hold transaction");
      assert.equal(escrowTransactions[0].status, "completed");
      assert.equal(Number(escrowTransactions[0].amount), paymentAmount);
    } finally {
      if (assignment?._id) {
        await TransactionModel.deleteMany({
          "relatedTo.model": "Assignment",
          "relatedTo.id": assignment._id,
        });
        await AssignmentModel.deleteOne({ _id: assignment._id });
      }
      if (student?._id) {
        await UserModel.deleteOne({ _id: student._id });
      }
      if (connectedHere && mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }
);
