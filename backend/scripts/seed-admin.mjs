import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UserModel from "../models/User.js";
import AssignmentModel from "../models/Assignment.js";
import AdminLogModel from "../models/AdminLog.js";
import QuizQuestionModel from "../models/QuizQuestion.js";
import PlatformSettingsModel from "../models/PlatformSettings.js";
import TransactionModel from "../models/Transaction.js";

const DATABASE_URL = process.env.DATABASE_URL;
const DB_NAME = process.env.DB_NAME || "aski-db";
const SALT_ROUNDS = Number(process.env.SALT) || 10;

const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

const monthsAgo = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
};

const connect = async () => {
    if (!DATABASE_URL) throw new Error("Missing DATABASE_URL");
    await mongoose.connect(DATABASE_URL, { dbName: DB_NAME });
};

const run = async () => {
    await connect();
    console.log("Connected to DB. Starting admin seed...");

    // Password for all seed users
    const passwordHash = await bcrypt.hash("Password123!", SALT_ROUNDS);

    // 1. Ensure Admin
    const admin = await UserModel.findOneAndUpdate(
        { email: "admin@aski.com" },
        {
            name: "Super Admin",
            roles: ["user", "admin"],
            adminRole: "super_admin",
            status: "active",
            onboardingStatus: "completed",
            is_verified: true,
            password: passwordHash,
        },
        { upsert: true, new: true }
    );

    // 2. Platform Settings
    await PlatformSettingsModel.findOneAndUpdate(
        {},
        {
            platformFeeRate: 0.15,
            minTransactionFee: 10,
            announcement: {
                message: "System upgrade scheduled for next Sunday.",
                isActive: true,
                expiresAt: daysAgo(-7),
            },
            updatedBy: admin._id,
        },
        { upsert: true }
    );

    // 3. Quiz Questions
    await QuizQuestionModel.deleteMany({});
    await QuizQuestionModel.create([
        {
            question: "Which of these is a valid Newton's Law?",
            category: "Physics",
            difficulty: "Medium",
            options: ["Law of Gravity", "Law of Inertia", "Law of Relativity", "Law of Thermodynamics"],
            correctIndex: 1,
            isActive: true,
        },
        {
            question: "What is the derivative of sin(x)?",
            category: "Math",
            difficulty: "Easy",
            options: ["cos(x)", "-cos(x)", "tan(x)", "sec(x)"],
            correctIndex: 0,
            isActive: true,
        },
        {
            question: "In which year did the French Revolution start?",
            category: "History",
            difficulty: "Hard",
            options: ["1789", "1804", "1776", "1812"],
            correctIndex: 0,
            isActive: true,
        },
    ]);

    // 4. Create Students (10)
    const students = [];
    for (let i = 1; i <= 10; i++) {
        const s = await UserModel.findOneAndUpdate(
            { email: `student${i}@test.com` },
            {
                name: `Student ${i}`,
                roles: ["user", "student"],
                status: i === 10 ? "banned" : "active",
                is_verified: true,
                onboardingStatus: "completed",
                password: passwordHash,
                wallet: { availableBalance: 1000 * i },
            },
            { upsert: true, new: true }
        );
        students.push(s);
    }

    // 5. Create Tutors (10)
    const tutors = [];
    for (let i = 1; i <= 10; i++) {
        const t = await UserModel.findOneAndUpdate(
            { email: `tutor${i}@test.com` },
            {
                name: `Tutor ${i}`,
                roles: ["user", "tutor"],
                status: "active",
                is_verified: true,
                onboardingStatus: i <= 3 ? "pending" : "approved",
                password: passwordHash,
                tutorProfile: { expertiseSubjects: i % 2 === 0 ? ["Math"] : ["Physics"], bio: "Expert tutor." },
                wallet: {
                    availableBalance: 500 * i,
                    totalEarnings: 2000 * i,
                    escrowBalance: 200,
                },
            },
            { upsert: true, new: true }
        );
        tutors.push(t);
    }

    // 6. Assignments (Various states)
    await AssignmentModel.deleteMany({ tags: "admin-seed" });

    // Pending
    await AssignmentModel.create({
        title: "Pending Math Assignment",
        description: "Need help with integration.",
        subject: "Math",
        deadline: daysAgo(-7),
        student: students[0]._id,
        status: "pending",
        estimatedCost: 500,
        tags: ["admin-seed"],
    });

    // Assigned
    await AssignmentModel.create({
        title: "Ongoing Physics Project",
        description: "Lab report analysis.",
        subject: "Physics",
        deadline: daysAgo(-5),
        student: students[1]._id,
        assignedTutor: tutors[4]._id,
        status: "assigned",
        estimatedCost: 1200,
        tags: ["admin-seed"],
    });

    // Submitted
    await AssignmentModel.create({
        title: "Submitted Chemistry Quiz",
        description: "Periodic table study guide.",
        subject: "Chemistry",
        deadline: daysAgo(2),
        student: students[2]._id,
        assignedTutor: tutors[5]._id,
        status: "submitted",
        estimatedCost: 300,
        tags: ["admin-seed"],
    });

    // Disputed
    await AssignmentModel.create({
        title: "Disputed Calculus Homework",
        description: "Tutor didn't follow instructions.",
        subject: "Math",
        deadline: daysAgo(5),
        student: students[3]._id,
        assignedTutor: tutors[6]._id,
        status: "disputed",
        estimatedCost: 1000,
        tags: ["admin-seed"],
        updatedAt: daysAgo(1),
    });

    // 7. Transactions (History for Charts)
    await TransactionModel.deleteMany({ metadata: { source: "admin-seed" } });
    const transactionData = [];

    // Create history for last 6 months
    for (let m = 0; m < 6; m++) {
        const date = monthsAgo(m);
        for (let t = 0; t < 5; t++) {
            transactionData.push({
                userId: students[0]._id,
                type: "platform_fee",
                amount: 200 + Math.random() * 500,
                status: "completed",
                createdAt: date,
                metadata: { source: "admin-seed" },
            });
            transactionData.push({
                userId: tutors[5]._id,
                type: "escrow_release",
                amount: 1000 + Math.random() * 1000,
                status: "completed",
                createdAt: date,
                metadata: { source: "admin-seed" },
            });
        }
    }

    // Add some pending withdrawals
    for (let w = 0; w < 5; w++) {
        transactionData.push({
            userId: tutors[w]._id,
            type: "withdrawal",
            amount: 500 + w * 100,
            status: "pending",
            createdAt: daysAgo(w),
            metadata: { source: "admin-seed" },
        });
    }

    await TransactionModel.insertMany(transactionData);

    // 8. Admin Logs
    await AdminLogModel.deleteMany({});
    await AdminLogModel.create([
        {
            adminId: admin._id,
            actionType: "UPDATE_SETTINGS",
            targetType: "PlatformSettings",
            timestamp: daysAgo(1),
        },
        {
            adminId: admin._id,
            actionType: "APPROVE_TUTOR",
            targetId: tutors[4]._id,
            targetType: "User",
            timestamp: daysAgo(2),
        },
        {
            adminId: admin._id,
            actionType: "BAN_USER",
            targetId: students[9]._id,
            targetType: "User",
            timestamp: daysAgo(3),
        },
        {
            adminId: admin._id,
            actionType: "CREATE_QUIZ_QUESTION",
            targetType: "QuizQuestion",
            timestamp: daysAgo(0.5),
        },
    ]);

    console.log("Admin seed complete!");
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
