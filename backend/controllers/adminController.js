
import mongoose from "mongoose";
import UserModel from "../models/User.js";
import AssignmentModel from "../models/Assignment.js";
import TutorApplicationModel from "../models/TutorApplication.js";
import MessageModel from "../models/Message.js";
import ProposalModel from "../models/Proposal.js";
import ChatModel from "../models/Chat.js";
import AdminLogModel from "../models/AdminLog.js";
import TransactionModel from "../models/Transaction.js";
import PlatformSettingsModel from "../models/PlatformSettings.js";

const DASHBOARD_CACHE_TTL = 5 * 60 * 1000;
const dashboardCache = {
  data: null,
  expiresAt: 0,
};

const toDateKey = (date) => date.toISOString().slice(0, 10);

const toMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const toMonthLabel = (date) =>
  `${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;

const buildDateSeries = (days) => {
  const series = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    series.push(toDateKey(date));
  }
  return series;
};

const buildMonthSeries = (months) => {
  const series = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    series.push(new Date(today.getFullYear(), today.getMonth() - i, 1));
  }
  return series;
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

class AdminController {
  static getDashboardStats = async (req, res) => {
    try {
      const now = Date.now();
      if (dashboardCache.data && dashboardCache.expiresAt > now) {
        return res.status(200).json({
          status: "success",
          data: dashboardCache.data,
        });
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const signupsStart = new Date();
      signupsStart.setDate(signupsStart.getDate() - 29);
      signupsStart.setHours(0, 0, 0, 0);

      const revenueStart = new Date();
      revenueStart.setMonth(revenueStart.getMonth() - 5);
      revenueStart.setDate(1);
      revenueStart.setHours(0, 0, 0, 0);

      const [
        platformRevenueAgg,
        escrowAgg,
        totalStudents,
        totalTutors,
        newThisMonth,
        pendingTutorVerifications,
        pendingWithdrawalsAgg,
        pendingDisputes,
        activeAssignments,
        signupAgg,
        revenueAgg,
      ] = await Promise.all([
        TransactionModel.aggregate([
          { $match: { type: "platform_fee", status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        UserModel.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$wallet.escrowBalance" },
            },
          },
        ]),
        UserModel.countDocuments({ roles: "student" }),
        UserModel.countDocuments({ roles: "tutor" }),
        UserModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
        UserModel.countDocuments({ onboardingStatus: "under_review" }),
        UserModel.aggregate([
          { $unwind: "$wallet.withdrawalHistory" },
          { $match: { "wallet.withdrawalHistory.status": "PENDING" } },
          { $count: "total" },
        ]),
        AssignmentModel.countDocuments({ status: "disputed" }),
        AssignmentModel.countDocuments({
          status: { $in: ["pending", "assigned", "submitted"] },
        }),
        UserModel.aggregate([
          { $match: { createdAt: { $gte: signupsStart } } },
          {
            $project: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              isStudent: { $in: ["student", "$roles"] },
              isTutor: { $in: ["tutor", "$roles"] },
            },
          },
          {
            $group: {
              _id: "$date",
              students: { $sum: { $cond: ["$isStudent", 1, 0] } },
              tutors: { $sum: { $cond: ["$isTutor", 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        TransactionModel.aggregate([
          {
            $match: {
              type: "platform_fee",
              status: "completed",
              createdAt: { $gte: revenueStart },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$createdAt" },
              },
              total: { $sum: "$amount" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      const platformRevenue =
        platformRevenueAgg?.[0]?.total &&
        Number.isFinite(platformRevenueAgg[0].total)
          ? platformRevenueAgg[0].total
          : 0;
      const escrowBalance =
        escrowAgg?.[0]?.total && Number.isFinite(escrowAgg[0].total)
          ? escrowAgg[0].total
          : 0;
      const pendingWithdrawals =
        pendingWithdrawalsAgg?.[0]?.total &&
        Number.isFinite(pendingWithdrawalsAgg[0].total)
          ? pendingWithdrawalsAgg[0].total
          : 0;

      const signupSeries = buildDateSeries(30);
      const signupMap = new Map(signupAgg.map((item) => [item._id, item]));
      const signupChart = signupSeries.map((dateKey) => ({
        date: dateKey,
        students: signupMap.get(dateKey)?.students || 0,
        tutors: signupMap.get(dateKey)?.tutors || 0,
      }));

      const monthSeries = buildMonthSeries(6);
      const revenueMap = new Map(revenueAgg.map((item) => [item._id, item.total]));
      const revenueChart = monthSeries.map((date) => {
        const key = toMonthKey(date);
        return {
          month: toMonthLabel(date),
          amount: revenueMap.get(key) || 0,
        };
      });

      const data = {
        revenue: {
          total: platformRevenue,
          escrow: escrowBalance,
          available: platformRevenue - escrowBalance,
        },
        users: {
          totalStudents,
          totalTutors,
          newThisMonth,
        },
        pending: {
          tutorVerifications: pendingTutorVerifications,
          withdrawals: pendingWithdrawals,
          disputes: pendingDisputes,
        },
        assignments: {
          active: activeAssignments,
        },
        charts: {
          signups: signupChart,
          revenue: revenueChart,
        },
      };

      dashboardCache.data = data;
      dashboardCache.expiresAt = now + DASHBOARD_CACHE_TTL;

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch dashboard stats",
      });
    }
  };

  static getUsers = async (req, res) => {
    try {
      const page = parseNumber(req.query.page, 1);
      const limit = parseNumber(req.query.limit, 20);
      const role = req.query.role;
      const status = req.query.status;
      const sortByRaw = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
      const search = req.query.search;

      const allowedSort = new Set([
        "createdAt",
        "name",
        "email",
        "status",
        "lastLogin",
      ]);
      const sortBy = allowedSort.has(sortByRaw) ? sortByRaw : "createdAt";

      const filter = {};
      if (role && role !== "all") {
        filter.roles = role;
      }
      if (status && status !== "all") {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ];
      }

      const skip = (page - 1) * limit;

      const users = await UserModel.find(filter)
        .select("name email roles status createdAt registrationDate wallet")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();

      const userIds = users.map((user) => user._id);
      const spendAgg = await AssignmentModel.aggregate([
        {
          $match: {
            student: { $in: userIds },
            paymentStatus: "paid",
            paymentAmount: { $gt: 0 },
          },
        },
        { $group: { _id: "$student", totalSpent: { $sum: "$paymentAmount" } } },
      ]);

      const spendMap = new Map(
        spendAgg.map((item) => [String(item._id), item.totalSpent])
      );

      const data = users.map((user) => {
        const isTutor = Array.isArray(user.roles) && user.roles.includes("tutor");
        const totalSpent = isTutor
          ? user.wallet?.totalEarnings || 0
          : spendMap.get(String(user._id)) || 0;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          joinDate: user.registrationDate || user.createdAt,
          totalSpent,
          status: user.status,
        };
      });

      const total = await UserModel.countDocuments(filter);

      return res.status(200).json({
        status: "success",
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch users",
      });
    }
  };

  static getUserDetails = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      const user = await UserModel.findById(id).lean();
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      const assignmentsQuery = { student: id };
      const assignments = await AssignmentModel.find(assignmentsQuery)
        .select(
          "title status paymentStatus paymentAmount createdAt updatedAt assignedTutor"
        )
        .populate("assignedTutor", "name email profileImage")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const adminLogs = await AdminLogModel.find({ targetId: id })
        .populate("adminId", "name email")
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

      return res.status(200).json({
        status: "success",
        data: {
          user,
          wallet: user.wallet || {},
          assignments,
          recentActivity: adminLogs,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch user details",
      });
    }
  };

  static banUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { status: "banned", suspendedUntil: null },
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "BAN_USER",
        targetId: user._id,
        targetType: "User",
        metadata: {
          reason: reason || "No reason provided",
        },
      });

      return res.status(200).json({
        status: "success",
        message: "User banned successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to ban user",
      });
    }
  };

  static unbanUser = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { status: "active", suspendedUntil: null },
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "UNBAN_USER",
        targetId: user._id,
        targetType: "User",
      });

      return res.status(200).json({
        status: "success",
        message: "User unbanned successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to unban user",
      });
    }
  };

  static getAdmins = async (req, res) => {
    try {
      const admins = await UserModel.find({ roles: "admin" })
        .select("name email adminRole adminPrivileges lastLogin status")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        status: "success",
        data: admins,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch admins",
      });
    }
  };

  static addAdmin = async (req, res) => {
    try {
      const { userId, email, role } = req.body || {};

      const query = {};
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query._id = userId;
      } else if (email) {
        query.email = email.toLowerCase();
      } else {
        return res.status(400).json({
          status: "failed",
          message: "Provide a valid userId or email",
        });
      }

      const roleValue = role || "admin";
      if (!["super_admin", "admin", "moderator"].includes(roleValue)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid admin role",
        });
      }

      const privilegeMap = {
        super_admin: {
          canManageUsers: true,
          canManagePayments: true,
          canViewAnalytics: true,
        },
        admin: {
          canManageUsers: true,
          canManagePayments: true,
          canViewAnalytics: true,
        },
        moderator: {
          canManageUsers: true,
          canManagePayments: false,
          canViewAnalytics: false,
        },
      };

      const updated = await UserModel.findOneAndUpdate(
        query,
        {
          $addToSet: { roles: "admin" },
          adminRole: roleValue,
          adminPrivileges: privilegeMap[roleValue],
        },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "PROMOTE_ADMIN",
        targetId: updated._id,
        targetType: "User",
        metadata: {
          role: roleValue,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Admin role granted",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to add admin",
      });
    }
  };

  static updateAdminRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      if (!["super_admin", "admin", "moderator"].includes(role)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid admin role",
        });
      }

      const privilegeMap = {
        super_admin: {
          canManageUsers: true,
          canManagePayments: true,
          canViewAnalytics: true,
        },
        admin: {
          canManageUsers: true,
          canManagePayments: true,
          canViewAnalytics: true,
        },
        moderator: {
          canManageUsers: true,
          canManagePayments: false,
          canViewAnalytics: false,
        },
      };

      const updated = await UserModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { roles: "admin" },
          adminRole: role,
          adminPrivileges: privilegeMap[role],
        },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "UPDATE_ADMIN_ROLE",
        targetId: updated._id,
        targetType: "User",
        metadata: {
          role,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Admin role updated",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to update admin role",
      });
    }
  };

  static revokeAdmin = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      const updated = await UserModel.findByIdAndUpdate(
        id,
        {
          $pull: { roles: "admin" },
          $unset: { adminRole: "", adminPrivileges: "" },
        },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "REVOKE_ADMIN",
        targetId: updated._id,
        targetType: "User",
      });

      return res.status(200).json({
        status: "success",
        message: "Admin access revoked",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to revoke admin",
      });
    }
  };

  static getPendingTutors = async (req, res) => {
    try {
      const applications = await TutorApplicationModel.find({
        applicationStatus: "under_review",
      })
        .populate("user", "name email profileImage onboardingStatus roles")
        .populate("quizResult")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        status: "success",
        data: applications,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch pending tutors",
      });
    }
  };

  static getActiveTutors = async (req, res) => {
    try {
      const tutors = await UserModel.find({
        roles: "tutor",
        onboardingStatus: { $in: ["approved", "completed"] },
        status: "active",
      })
        .select("name email profileImage tutorProfile publicStats status wallet")
        .sort({ "publicStats.averageRating": -1 })
        .lean();

      return res.status(200).json({
        status: "success",
        data: tutors,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch active tutors",
      });
    }
  };

  static verifyTutor = async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { roles: "tutor" },
          onboardingStatus: "approved",
          "tutorProfile.verificationStatus": "Verified",
        },
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await TutorApplicationModel.updateMany(
        { user: id },
        {
          $set: {
            applicationStatus: "approved",
            reviewNotes: reviewNotes || undefined,
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            approvedAt: new Date(),
          },
        }
      );

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "APPROVE_TUTOR",
        targetId: user._id,
        targetType: "User",
        metadata: {
          reviewNotes: reviewNotes || "",
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Tutor verified successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to verify tutor",
      });
    }
  };

  static rejectTutor = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        {
          onboardingStatus: "rejected",
          "tutorProfile.verificationStatus": "Rejected",
        },
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await TutorApplicationModel.updateMany(
        { user: id },
        {
          $set: {
            applicationStatus: "rejected",
            reviewNotes: reason || undefined,
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
          },
        }
      );

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "REJECT_TUTOR",
        targetId: user._id,
        targetType: "User",
        metadata: {
          reason: reason || "No reason provided",
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Tutor rejected successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to reject tutor",
      });
    }
  };

  static demoteTutor = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID",
        });
      }

      const activeAssignments = await AssignmentModel.countDocuments({
        assignedTutor: id,
        status: { $in: ["assigned", "submitted"] },
      });

      if (activeAssignments > 0) {
        return res.status(400).json({
          status: "failed",
          message: "Tutor has active assignments",
        });
      }

      const hasPendingWithdrawals = await UserModel.findOne({
        _id: id,
        "wallet.withdrawalHistory.status": "PENDING",
      }).lean();

      if (hasPendingWithdrawals) {
        return res.status(400).json({
          status: "failed",
          message: "Tutor has pending withdrawal requests",
        });
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        {
          $pull: { roles: "tutor" },
          onboardingStatus: "incomplete",
          "tutorProfile.verificationStatus": "Rejected",
        },
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "DEMOTE_TUTOR",
        targetId: user._id,
        targetType: "User",
        metadata: {
          reason: reason || "No reason provided",
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Tutor demoted successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to demote tutor",
      });
    }
  };

  static getAssignments = async (req, res) => {
    try {
      const page = parseNumber(req.query.page, 1);
      const limit = parseNumber(req.query.limit, 20);
      const status = req.query.status;
      const subject = req.query.subject;
      const minBudget = parseNumber(req.query.minBudget, null);
      const maxBudget = parseNumber(req.query.maxBudget, null);
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

      const filter = { isActive: true };
      if (status && status !== "all") {
        filter.status = status;
      }
      if (subject) {
        filter.subject = new RegExp(subject, "i");
      }
      if (Number.isFinite(minBudget) || Number.isFinite(maxBudget)) {
        const range = {};
        if (Number.isFinite(minBudget)) {
          range.$gte = minBudget;
        }
        if (Number.isFinite(maxBudget)) {
          range.$lte = maxBudget;
        }
        filter.$and = [
          ...(filter.$and || []),
          {
            $or: [
              { budget: range },
              { budget: { $exists: false }, estimatedCost: range },
            ],
          },
        ];
      }
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = startDate;
        }
        if (endDate) {
          filter.createdAt.$lte = endDate;
        }
      }

      const skip = (page - 1) * limit;

      const assignments = await AssignmentModel.find(filter)
        .populate("student", "name email profileImage")
        .populate("assignedTutor", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AssignmentModel.countDocuments(filter);

      return res.status(200).json({
        status: "success",
        data: assignments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch assignments",
      });
    }
  };

  static getAssignmentDetails = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const assignment = await AssignmentModel.findById(id)
        .populate("student", "name email profileImage")
        .populate("assignedTutor", "name email profileImage")
        .lean();

      if (!assignment) {
        return res.status(404).json({
          status: "failed",
          message: "Assignment not found",
        });
      }

      let chatId = assignment.chatId ? assignment.chatId.toString() : null;

      if (!chatId) {
        const proposalChat = await ProposalModel.findOne({
          assignment: id,
          conversation: { $ne: null },
        })
          .sort({ createdAt: -1 })
          .select("conversation")
          .lean();
        if (proposalChat?.conversation) {
          chatId = proposalChat.conversation.toString();
        }
      }

      let chat = null;
      if (chatId) {
        chat = await ChatModel.findOne({ _id: chatId, isActive: true })
          .populate("participants.user", "name email profileImage roles")
          .lean();
      }

      if (!chat) {
        chat = await ChatModel.findOne({ assignment: id, isActive: true })
          .sort({ lastActivity: -1 })
          .populate("participants.user", "name email profileImage roles")
          .lean();
        if (chat?._id) {
          chatId = chat._id.toString();
        }
      }

      const [messages, proposals] = await Promise.all([
        chatId
          ? MessageModel.find({ chat: chatId, isDeleted: { $ne: true } })
              .populate("sender", "name email profileImage")
              .sort({ createdAt: 1 })
              .lean()
          : [],
        ProposalModel.find({ assignment: id })
          .populate("tutor", "name email profileImage")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      return res.status(200).json({
        status: "success",
        data: {
          assignment,
          chat,
          chatHistory: messages,
          proposals,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch assignment details",
      });
    }
  };

  static updateAssignment = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        subject,
        status,
        budget,
        deadline,
        priority,
        tags
      } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const update = {};
      if (typeof title === "string") update.title = title.trim();
      if (typeof description === "string") update.description = description.trim();
      if (typeof subject === "string") update.subject = subject.trim();
      if (typeof status === "string") update.status = status;
      if (typeof priority === "string") update.priority = priority;
      if (Array.isArray(tags)) update.tags = tags;
      if (deadline) update.deadline = new Date(deadline);

      if (budget !== undefined) {
        const parsedBudget = Number(budget);
        if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
          return res.status(400).json({
            status: "failed",
            message: "Budget must be a positive number",
          });
        }
        update.budget = parsedBudget;
        update.estimatedCost = parsedBudget;
      }

      const updated = await AssignmentModel.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true, runValidators: true }
      )
        .populate("student", "name email profileImage")
        .populate("assignedTutor", "name email profileImage")
        .lean();

      if (!updated) {
        return res.status(404).json({
          status: "failed",
          message: "Assignment not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "UPDATE_ASSIGNMENT",
        targetId: updated._id,
        targetType: "Assignment",
        metadata: {
          fields: Object.keys(update),
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Assignment updated successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to update assignment",
      });
    }
  };

  static deleteAssignment = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const assignment = await AssignmentModel.findById(id);
      if (!assignment) {
        return res.status(404).json({
          status: "failed",
          message: "Assignment not found",
        });
      }

      assignment.isActive = false;
      assignment.status = "cancelled";
      await assignment.save();

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "DELETE_ASSIGNMENT",
        targetId: assignment._id,
        targetType: "Assignment",
        metadata: {
          reason: reason || "No reason provided",
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Assignment deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to delete assignment",
      });
    }
  };

  static forceCancelAssignment = async (req, res) => {
    const session = await mongoose.startSession();
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      let updatedAssignment;

      await session.withTransaction(async () => {
        const assignment = await AssignmentModel.findById(id).session(session);
        if (!assignment) {
          throw new Error("Assignment not found");
        }

        const escrowAmount = parseNumber(
          assignment.paymentAmount ?? assignment.estimatedCost ?? 0,
          0
        );

        if (escrowAmount > 0) {
          await UserModel.updateOne(
            { _id: assignment.student, "wallet.escrowBalance": { $gte: escrowAmount } },
            {
              $inc: {
                "wallet.escrowBalance": -escrowAmount,
                "wallet.availableBalance": escrowAmount,
              },
            },
            { session }
          );

          await TransactionModel.create(
            [
              {
                userId: assignment.student,
                type: "refund",
                amount: escrowAmount,
                status: "completed",
                relatedTo: { model: "Assignment", id: assignment._id },
                metadata: { reason: "Force cancel" },
              },
            ],
            { session }
          );
        }

        assignment.status = "cancelled";
        assignment.paymentStatus = "refunded";
        updatedAssignment = await assignment.save({ session });

        await AdminLogModel.create(
          [
            {
              adminId: req.user._id,
              actionType: "FORCE_CANCEL_ASSIGNMENT",
              targetId: assignment._id,
              targetType: "Assignment",
              metadata: {
                reason: reason || "No reason provided",
              },
            },
          ],
          { session }
        );
      });

      return res.status(200).json({
        status: "success",
        message: "Assignment cancelled successfully",
        data: updatedAssignment,
      });
    } catch (error) {
      const message =
        error.message === "Assignment not found"
          ? "Assignment not found"
          : "Unable to force cancel assignment";
      return res.status(error.message === "Assignment not found" ? 404 : 500).json({
        status: "failed",
        message,
      });
    } finally {
      session.endSession();
    }
  };

  static getTransactions = async (req, res) => {
    try {
      const page = parseNumber(req.query.page, 1);
      const limit = parseNumber(req.query.limit, 20);
      const type = req.query.type;
      const status = req.query.status;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

      const filter = {};
      if (type && type !== "all") {
        filter.type = type;
      }
      if (status && status !== "all") {
        filter.status = status;
      }
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = startDate;
        }
        if (endDate) {
          filter.createdAt.$lte = endDate;
        }
      }

      const skip = (page - 1) * limit;

      const transactions = await TransactionModel.find(filter)
        .populate("userId", "name email roles")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await TransactionModel.countDocuments(filter);

      return res.status(200).json({
        status: "success",
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch transactions",
      });
    }
  };

  static getFinanceSummary = async (req, res) => {
    try {
      const [platformRevenueAgg, escrowAgg, payoutsAgg, pendingWithdrawalsAgg] =
        await Promise.all([
          TransactionModel.aggregate([
            { $match: { type: "platform_fee", status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          UserModel.aggregate([
            { $group: { _id: null, total: { $sum: "$wallet.escrowBalance" } } },
          ]),
          TransactionModel.aggregate([
            { $match: { type: "withdrawal", status: "completed" } },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                totalCount: { $sum: 1 },
              },
            },
          ]),
          UserModel.aggregate([
            { $unwind: "$wallet.withdrawalHistory" },
            { $match: { "wallet.withdrawalHistory.status": "PENDING" } },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$wallet.withdrawalHistory.amount" },
                totalCount: { $sum: 1 },
              },
            },
          ]),
        ]);

      return res.status(200).json({
        status: "success",
        data: {
          platformRevenue: platformRevenueAgg?.[0]?.total || 0,
          escrowBalance: escrowAgg?.[0]?.total || 0,
          payouts: {
            totalAmount: payoutsAgg?.[0]?.totalAmount || 0,
            totalCount: payoutsAgg?.[0]?.totalCount || 0,
          },
          pendingWithdrawals: {
            totalAmount: pendingWithdrawalsAgg?.[0]?.totalAmount || 0,
            totalCount: pendingWithdrawalsAgg?.[0]?.totalCount || 0,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch finance summary",
      });
    }
  };

  static getWithdrawalRequests = async (req, res) => {
    try {
      const page = parseNumber(req.query.page, 1);
      const limit = parseNumber(req.query.limit, 20);
      const skip = (page - 1) * limit;

      const pipeline = [
        { $unwind: "$wallet.withdrawalHistory" },
        { $match: { "wallet.withdrawalHistory.status": "PENDING" } },
        {
          $project: {
            userId: "$_id",
            name: "$name",
            email: "$email",
            availableBalance: "$wallet.availableBalance",
            bankDetails: "$wallet.bankDetails",
            withdrawal: "$wallet.withdrawalHistory",
          },
        },
        { $sort: { "withdrawal.requestedAt": -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      const data = await UserModel.aggregate(pipeline);

      const totalAgg = await UserModel.aggregate([
        { $unwind: "$wallet.withdrawalHistory" },
        { $match: { "wallet.withdrawalHistory.status": "PENDING" } },
        { $count: "total" },
      ]);

      const total = totalAgg?.[0]?.total || 0;

      return res.status(200).json({
        status: "success",
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch withdrawal requests",
      });
    }
  };

  static processWithdrawal = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await UserModel.findOne({
        "wallet.withdrawalHistory.transactionId": id,
      }).lean();

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "Withdrawal request not found",
        });
      }

      const entry = user.wallet?.withdrawalHistory?.find(
        (item) => item.transactionId === id
      );

      if (!entry) {
        return res.status(404).json({
          status: "failed",
          message: "Withdrawal request not found",
        });
      }

      if (entry.status !== "PENDING") {
        return res.status(400).json({
          status: "failed",
          message: "Withdrawal has already been processed",
        });
      }

      const updated = await UserModel.findOneAndUpdate(
        {
          _id: user._id,
          "wallet.withdrawalHistory.transactionId": id,
          "wallet.withdrawalHistory.status": "PENDING",
        },
        {
          $set: {
            "wallet.withdrawalHistory.$.status": "COMPLETED",
            "wallet.withdrawalHistory.$.completedAt": new Date(),
          },
        },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to process withdrawal",
        });
      }

      const existingTransaction = await TransactionModel.findOne({
        gatewayId: entry.transactionId,
        type: "withdrawal",
      }).lean();

      if (existingTransaction) {
        await TransactionModel.updateOne(
          { _id: existingTransaction._id },
          {
            $set: {
              status: "completed",
              "metadata.processedBy": req.user._id,
            },
          }
        );
      } else {
        await TransactionModel.create({
          userId: user._id,
          type: "withdrawal",
          amount: entry.amount || 0,
          status: "completed",
          gatewayId: entry.transactionId,
          relatedTo: { model: "User", id: user._id },
          metadata: {
            processedBy: req.user._id,
          },
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "PROCESS_WITHDRAWAL",
        targetId: user._id,
        targetType: "User",
        metadata: {
          transactionId: entry.transactionId,
          amount: entry.amount,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Withdrawal processed successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to process withdrawal",
      });
    }
  };

  static getDisputes = async (req, res) => {
    try {
      const disputes = await AssignmentModel.find({ status: "disputed" })
        .populate("student", "name email profileImage")
        .populate("assignedTutor", "name email profileImage")
        .sort({ updatedAt: -1 })
        .lean();

      return res.status(200).json({
        status: "success",
        data: disputes,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch disputes",
      });
    }
  };

  static getRecentActivity = async (req, res) => {
    try {
      const limit = parseNumber(req.query.limit, 10);
      const safeLimit = Math.max(1, Math.min(limit, 50));

      const logs = await AdminLogModel.find()
        .populate("adminId", "name email")
        .sort({ timestamp: -1 })
        .limit(safeLimit)
        .lean();

      return res.status(200).json({
        status: "success",
        data: logs,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch admin activity",
      });
    }
  };

  static getDisputeDetails = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const assignment = await AssignmentModel.findById(id)
        .populate("student", "name email profileImage")
        .populate("assignedTutor", "name email profileImage")
        .lean();

      if (!assignment) {
        return res.status(404).json({
          status: "failed",
          message: "Assignment not found",
        });
      }

      const messages = assignment.chatId
        ? await MessageModel.find({ chat: assignment.chatId })
            .populate("sender", "name email profileImage")
            .sort({ createdAt: 1 })
            .lean()
        : [];

      const escrowAmount = parseNumber(
        assignment.paymentAmount ?? assignment.estimatedCost ?? 0,
        0
      );

      return res.status(200).json({
        status: "success",
        data: {
          assignment,
          chatHistory: messages,
          files: {
            attachments: assignment.attachments || [],
            submissions: assignment.submissionDetails?.submissionFiles || [],
          },
          escrowAmount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch dispute details",
      });
    }
  };

  static resolveDispute = async (req, res) => {
    const session = await mongoose.startSession();
    try {
      const { id } = req.params;
      const { resolutionType, studentPercent, reason } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const resolution = resolutionType || "";
      if (!["refund", "release", "split"].includes(resolution)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid resolution type",
        });
      }

      let responsePayload;

      await session.withTransaction(async () => {
        const assignment = await AssignmentModel.findOne({
          _id: id,
          status: "disputed",
        }).session(session);

        if (!assignment) {
          throw new Error("Dispute not found or already resolved");
        }

        const escrowAmount = parseNumber(
          assignment.paymentAmount ?? assignment.estimatedCost ?? 0,
          0
        );

        if (escrowAmount <= 0) {
          throw new Error("Escrow amount is not available");
        }

        const student = await UserModel.findById(assignment.student).session(
          session
        );
        const tutor = assignment.assignedTutor
          ? await UserModel.findById(assignment.assignedTutor).session(session)
          : null;

        if (!student || !tutor) {
          throw new Error("Assignment participants not found");
        }

        const studentEscrow = student.wallet?.escrowBalance || 0;
        if (studentEscrow < escrowAmount) {
          throw new Error("Insufficient escrow balance");
        }

        const settings = await PlatformSettingsModel.findOne()
          .session(session)
          .lean();
        const platformFeeRate = parseNumber(
          settings?.platformFeeRate,
          parseNumber(process.env.PLATFORM_FEE_RATE, 0)
        );
        const minTransactionFee = parseNumber(settings?.minTransactionFee, 0);
        let platformFee = 0;
        let studentAmount = 0;
        let tutorAmount = 0;
        let tutorNet = 0;

        if (resolution === "refund") {
          studentAmount = escrowAmount;
        } else if (resolution === "release") {
          tutorAmount = escrowAmount;
          platformFee = Math.max(0, tutorAmount * platformFeeRate);
          if (platformFee > 0 && minTransactionFee > 0) {
            platformFee = Math.max(platformFee, minTransactionFee);
          }
          tutorNet = Math.max(0, tutorAmount - platformFee);
        } else if (resolution === "split") {
          const percent = parseNumber(studentPercent, 50);
          if (percent < 0 || percent > 100) {
            throw new Error("Invalid split percentage");
          }
          studentAmount = Number((escrowAmount * (percent / 100)).toFixed(2));
          tutorAmount = Number((escrowAmount - studentAmount).toFixed(2));
          platformFee = Math.max(0, tutorAmount * platformFeeRate);
          if (platformFee > 0 && minTransactionFee > 0) {
            platformFee = Math.max(platformFee, minTransactionFee);
          }
          tutorNet = Math.max(0, tutorAmount - platformFee);
        }

        const studentUpdates = {
          "wallet.escrowBalance": -escrowAmount,
          "wallet.availableBalance": studentAmount,
        };

        await UserModel.updateOne(
          { _id: student._id, "wallet.escrowBalance": { $gte: escrowAmount } },
          { $inc: studentUpdates },
          { session }
        );

        if (tutorNet > 0) {
          await UserModel.updateOne(
            { _id: tutor._id },
            {
              $inc: {
                "wallet.availableBalance": tutorNet,
                "wallet.totalEarnings": tutorNet,
              },
            },
            { session }
          );
        }

        const transactions = [];
        if (studentAmount > 0) {
          transactions.push({
            userId: student._id,
            type: "refund",
            amount: studentAmount,
            status: "completed",
            relatedTo: { model: "Assignment", id: assignment._id },
            metadata: {
              resolution,
            },
          });
        }
        if (tutorNet > 0) {
          transactions.push({
            userId: tutor._id,
            type: "escrow_release",
            amount: tutorNet,
            status: "completed",
            relatedTo: { model: "Assignment", id: assignment._id },
            metadata: {
              resolution,
            },
          });
        }
        if (platformFee > 0) {
          transactions.push({
            userId: tutor._id,
            type: "platform_fee",
            amount: platformFee,
            status: "completed",
            relatedTo: { model: "Assignment", id: assignment._id },
            metadata: {
              resolution,
              note: "Platform fee deducted from tutor payout",
            },
          });
        }

        if (transactions.length > 0) {
          await TransactionModel.create(transactions, { session });
        }

        assignment.status = "resolved";
        assignment.paymentStatus = resolution === "refund" ? "refunded" : "paid";
        await assignment.save({ session });

        const actionMap = {
          refund: "RESOLVE_DISPUTE_REFUND",
          release: "RESOLVE_DISPUTE_RELEASE",
          split: "RESOLVE_DISPUTE_SPLIT",
        };

        await AdminLogModel.create(
          [
            {
              adminId: req.user._id,
              actionType: actionMap[resolution],
              targetId: assignment._id,
              targetType: "Assignment",
              metadata: {
                resolution,
                escrowAmount,
                studentAmount,
                tutorAmount: tutorNet,
                platformFee,
                reason: reason || "",
              },
            },
          ],
          { session }
        );

        responsePayload = {
          assignmentId: assignment._id,
          resolution,
          escrowAmount,
          studentAmount,
          tutorAmount: tutorNet,
          platformFee,
        };
      });

      return res.status(200).json({
        status: "success",
        message: "Dispute resolved successfully",
        data: responsePayload,
      });
    } catch (error) {
      const message =
        error.message === "Dispute not found or already resolved"
          ? error.message
          : error.message || "Unable to resolve dispute";
      const statusCode =
        message === "Dispute not found or already resolved" ? 404 : 500;
      return res.status(statusCode).json({
        status: "failed",
        message,
      });
    } finally {
      session.endSession();
    }
  };
}

export default AdminController;
