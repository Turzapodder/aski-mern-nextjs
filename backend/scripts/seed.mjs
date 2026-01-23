import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UserModel from "../models/User.js";
import AssignmentModel from "../models/Assignment.js";
import SessionModel from "../models/Session.js";

const DATABASE_URL = process.env.DATABASE_URL;
const DB_NAME = process.env.DB_NAME || "aski-db";
const SALT_ROUNDS = Number(process.env.SALT) || 10;

const SEED_EMAILS = [
  "admin@aski.com",
  "student1@example.com",
  "tutor_pending@example.com",
  "tutor_approved@example.com",
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const connect = async () => {
  if (!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in .env");
  }
  await mongoose.connect(DATABASE_URL, { dbName: DB_NAME });
};

const resetSeedData = async () => {
  await Promise.all([
    UserModel.deleteMany({ email: { $in: SEED_EMAILS } }),
    AssignmentModel.deleteMany({ title: /^Seed:/ }),
    SessionModel.deleteMany({ subject: /^Seed:/ }),
  ]);
};

const ensureUser = async ({ email, payload }) => {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    await UserModel.updateOne({ _id: existing._id }, { $set: payload });
    return UserModel.findById(existing._id).lean();
  }
  return UserModel.create(payload);
};

const run = async () => {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("--reset");

  await connect();

  if (shouldReset) {
    await resetSeedData();
  }

  const passwordHash = await bcrypt.hash("Password123!", SALT_ROUNDS);

  const admin = await ensureUser({
    email: "admin@aski.com",
    payload: {
      name: "Seed Admin",
      email: "admin@aski.com",
      password: passwordHash,
      roles: ["user", "admin"],
      adminRole: "super_admin",
      adminPrivileges: {
        canManageUsers: true,
        canManagePayments: true,
        canViewAnalytics: true,
      },
      status: "active",
      onboardingStatus: "completed",
      is_verified: true,
    },
  });

  const student = await ensureUser({
    email: "student1@example.com",
    payload: {
      name: "Seed Student",
      email: "student1@example.com",
      password: passwordHash,
      roles: ["user", "student"],
      status: "active",
      onboardingStatus: "completed",
      is_verified: true,
      publicStats: {
        totalProjects: 1,
        completedProjects: 0,
        averageRating: 0,
        totalReviews: 0,
        responseTime: 0,
        successRate: 0,
        joinedDate: new Date(),
      },
      wallet: {
        availableBalance: 0,
        escrowBalance: 0,
        totalEarnings: 0,
        currency: "BDT",
      },
    },
  });

  const tutorPending = await ensureUser({
    email: "tutor_pending@example.com",
    payload: {
      name: "Seed Tutor Pending",
      email: "tutor_pending@example.com",
      password: passwordHash,
      roles: ["user", "tutor"],
      status: "active",
      onboardingStatus: "pending",
      is_verified: true,
      tutorProfile: {
        hourlyRate: 300,
        skills: ["Algebra", "Geometry"],
        expertiseSubjects: ["Math"],
        bio: "Tutor pending approval.",
      },
      publicStats: {
        totalProjects: 0,
        completedProjects: 0,
        averageRating: 4.2,
        totalReviews: 3,
        responseTime: 12,
        successRate: 80,
        joinedDate: new Date(),
      },
      wallet: {
        availableBalance: 2000,
        escrowBalance: 500,
        totalEarnings: 3000,
        currency: "BDT",
      },
    },
  });

  const tutorApproved = await ensureUser({
    email: "tutor_approved@example.com",
    payload: {
      name: "Seed Tutor Approved",
      email: "tutor_approved@example.com",
      password: passwordHash,
      roles: ["user", "tutor"],
      status: "active",
      onboardingStatus: "approved",
      is_verified: true,
      tutorProfile: {
        hourlyRate: 500,
        skills: ["Physics", "Calculus"],
        expertiseSubjects: ["Physics", "Math"],
        availableDays: ["Sunday", "Monday"],
        availableTimeSlots: [
          { day: "Sunday", slots: ["09:00-11:00", "14:00-16:00"] },
          { day: "Monday", slots: ["10:00-12:00"] },
        ],
        bio: "Seed tutor bio.",
      },
      publicStats: {
        totalProjects: 5,
        completedProjects: 4,
        averageRating: 4.8,
        totalReviews: 12,
        responseTime: 4,
        successRate: 92,
        joinedDate: new Date(),
      },
      wallet: {
        availableBalance: 5000,
        escrowBalance: 1000,
        totalEarnings: 12000,
        currency: "BDT",
        withdrawalHistory: [
          {
            amount: 800,
            status: "COMPLETED",
            requestedAt: daysFromNow(-10),
            completedAt: daysFromNow(-8),
            transactionId: "seed-completed-1",
          },
          {
            amount: 500,
            status: "PENDING",
            requestedAt: daysFromNow(-1),
            transactionId: "seed-pending-1",
          },
        ],
      },
    },
  });

  const existingDraft = await AssignmentModel.findOne({
    title: "Seed: Draft Assignment",
  }).lean();
  if (!existingDraft) {
    await AssignmentModel.create({
      title: "Seed: Draft Assignment",
      description: "Seed draft assignment for testing.",
      subject: "General",
      topics: ["Overview"],
      deadline: daysFromNow(10),
      estimatedCost: 0,
      priority: "medium",
      student: student._id,
      status: "draft",
      tags: ["seed"],
    });
  }

  const existingAssigned = await AssignmentModel.findOne({
    title: "Seed: In Progress Assignment",
  }).lean();
  if (!existingAssigned) {
    await AssignmentModel.create({
      title: "Seed: In Progress Assignment",
      description: "Seed assignment for calendar and tutor dashboard.",
      subject: "Math",
      topics: ["Algebra"],
      deadline: daysFromNow(5),
      estimatedCost: 800,
      priority: "high",
      student: student._id,
      assignedTutor: tutorApproved._id,
      status: "assigned",
      tags: ["seed", "calendar"],
    });
  }

  const existingSession = await SessionModel.findOne({
    subject: "Seed: Math Session",
  }).lean();
  if (!existingSession) {
    await SessionModel.create({
      tutor: tutorApproved._id,
      student: student._id,
      subject: "Seed: Math Session",
      scheduledTime: daysFromNow(2),
      duration: 60,
      status: "scheduled",
    });
  }

  const indexes = await UserModel.collection.indexes();
  const ratingIndex = indexes.find((index) =>
    Object.prototype.hasOwnProperty.call(index.key, "publicStats.averageRating")
  );

  console.log("Seed complete");
  console.log({
    adminId: String(admin._id),
    studentId: String(student._id),
    tutorPendingId: String(tutorPending._id),
    tutorApprovedId: String(tutorApproved._id),
    ratingIndexFound: Boolean(ratingIndex),
  });

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message || error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error("Disconnect failed:", disconnectError.message || disconnectError);
  }
  process.exit(1);
});
