import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import AssignmentModel from "../models/Assignment.js";
import UserModel from "../models/User.js";
import AssignmentController from "../controllers/assignmentController.js";

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
  "assignTutor denies non-owner and allows owner/admin",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const userIds = [];
    let assignmentId;
    let connectedHere = false;

    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(databaseUrl, { dbName: "aski-db" });
        connectedHere = true;
      }

      const student = await UserModel.create({
        name: `Assign Owner ${seed}`,
        email: `assign-owner-${seed}@example.com`,
        password: "Password123!",
        roles: ["user"],
      });
      const attacker = await UserModel.create({
        name: `Assign Attacker ${seed}`,
        email: `assign-attacker-${seed}@example.com`,
        password: "Password123!",
        roles: ["tutor"],
      });
      const tutor = await UserModel.create({
        name: `Assign Tutor ${seed}`,
        email: `assign-tutor-${seed}@example.com`,
        password: "Password123!",
        roles: ["tutor"],
      });
      const admin = await UserModel.create({
        name: `Assign Admin ${seed}`,
        email: `assign-admin-${seed}@example.com`,
        password: "Password123!",
        roles: ["user", "admin"],
      });
      userIds.push(student._id, attacker._id, tutor._id, admin._id);

      const assignment = await AssignmentModel.create({
        title: `Assign Auth ${seed}`,
        description: "IDOR guard integration test",
        subject: "Testing",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        student: student._id,
        status: "created",
      });
      assignmentId = assignment._id;

      const callAssign = async (actor) => {
        const req = {
          params: { id: String(assignmentId) },
          body: { tutorId: String(tutor._id) },
          user: { _id: actor._id, roles: actor.roles },
        };
        const res = makeRes();
        await AssignmentController.assignTutor(req, res);
        return res;
      };

      const attackerRes = await callAssign(attacker);
      assert.equal(attackerRes.statusCode, 403, "non-owner tutor must be denied");
      let fresh = await AssignmentModel.findById(assignmentId).lean();
      assert.equal(fresh.assignedTutor, null, "assignment must stay unassigned after denied attempt");
      assert.equal(fresh.status, "created", "status must be unchanged after denied attempt");

      const ownerRes = await callAssign(student);
      assert.equal(ownerRes.statusCode, 200, "owner must be allowed");
      fresh = await AssignmentModel.findById(assignmentId).lean();
      assert.equal(String(fresh.assignedTutor), String(tutor._id));
      assert.equal(fresh.status, "proposal_accepted");

      await AssignmentModel.updateOne(
        { _id: assignmentId },
        { $set: { assignedTutor: null, status: "created" } }
      );

      const adminRes = await callAssign(admin);
      assert.equal(adminRes.statusCode, 200, "admin must be allowed");
      fresh = await AssignmentModel.findById(assignmentId).lean();
      assert.equal(String(fresh.assignedTutor), String(tutor._id));

      const missingRes = await (async () => {
        const req = {
          params: { id: String(new mongoose.Types.ObjectId()) },
          body: { tutorId: String(tutor._id) },
          user: { _id: admin._id, roles: admin.roles },
        };
        const res = makeRes();
        await AssignmentController.assignTutor(req, res);
        return res;
      })();
      assert.equal(missingRes.statusCode, 404, "missing assignment must 404 before mutation");
    } finally {
      if (assignmentId) await AssignmentModel.deleteOne({ _id: assignmentId });
      for (const uId of userIds) await UserModel.deleteOne({ _id: uId });
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);
