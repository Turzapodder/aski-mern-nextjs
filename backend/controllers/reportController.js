import mongoose from "mongoose";
import ReportModel from "../models/Report.js";
import AssignmentModel from "../models/Assignment.js";
import UserModel from "../models/User.js";
import AdminLogModel from "../models/AdminLog.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isRoleAllowed = (roles, role) =>
  Array.isArray(roles) && roles.includes(role);

const getAllowedReporterTypes = (roles) => {
  const types = [];
  if (isRoleAllowed(roles, "student") || isRoleAllowed(roles, "user")) {
    types.push("user");
  }
  if (isRoleAllowed(roles, "tutor")) {
    types.push("tutor");
  }
  return types;
};

const getAllowedReportedTypes = (reporterType) => {
  if (reporterType === "user") return ["assignment", "tutorProfile"];
  if (reporterType === "tutor") return ["assignment", "userProfile"];
  return [];
};

class ReportController {
  static createReport = async (req, res) => {
    try {
      const userId = req.user._id;
      const roles = req.user.roles || [];
      const {
        reporterType: reporterTypeRaw,
        reportedType,
        reportedId,
        reason,
        comments,
      } = req.body || {};

      const allowedReporterTypes = getAllowedReporterTypes(roles);
      if (allowedReporterTypes.length === 0) {
        return res.status(403).json({
          status: "failed",
          message: "Reporter role is not permitted",
        });
      }

      const reporterType = allowedReporterTypes.includes(reporterTypeRaw)
        ? reporterTypeRaw
        : allowedReporterTypes[0];

      const allowedReportedTypes = getAllowedReportedTypes(reporterType);
      if (!allowedReportedTypes.includes(reportedType)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid reported type for this reporter",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(reportedId)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid reported entity ID",
        });
      }

      const sanitizedReason = sanitizeText(reason);
      if (!sanitizedReason) {
        return res.status(400).json({
          status: "failed",
          message: "Report reason is required",
        });
      }

      let reportedEntity = null;
      if (reportedType === "assignment") {
        reportedEntity = await AssignmentModel.findById(reportedId).select("_id");
      } else {
        reportedEntity = await UserModel.findById(reportedId).select("_id roles");
        if (reportedEntity) {
          const expectedRoles =
            reportedType === "tutorProfile" ? ["tutor"] : ["student", "user"];
          const hasRole = expectedRoles.some((role) =>
            reportedEntity.roles?.includes(role)
          );
          if (!hasRole) {
            return res.status(400).json({
              status: "failed",
              message: "Reported profile type does not match user role",
            });
          }
        }
      }

      if (!reportedEntity) {
        return res.status(404).json({
          status: "failed",
          message: "Reported entity not found",
        });
      }

      const report = await ReportModel.create({
        reporterId: userId,
        reporterType,
        reportedId,
        reportedType,
        reason: sanitizedReason,
        comments: sanitizeText(comments),
        status: "pending",
      });

      return res.status(201).json({
        status: "success",
        message: "Report submitted successfully",
        data: report,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to submit report",
      });
    }
  };

  static getReports = async (req, res) => {
    try {
      const page = parseNumber(req.query.page, 1);
      const limit = parseNumber(req.query.limit, 20);
      const reportedType = req.query.type;
      const status = req.query.status;
      const reporterType = req.query.reporterType;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

      const filter = {};
      if (reportedType && reportedType !== "all") {
        filter.reportedType = reportedType;
      }
      if (status && status !== "all") {
        filter.status = status;
      }
      if (reporterType && reporterType !== "all") {
        filter.reporterType = reporterType;
      }
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }

      const skip = (page - 1) * limit;

      const reports = await ReportModel.find(filter)
        .populate("reporterId", "name email roles profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const assignmentIds = reports
        .filter((report) => report.reportedType === "assignment")
        .map((report) => report.reportedId);
      const profileIds = reports
        .filter((report) => report.reportedType !== "assignment")
        .map((report) => report.reportedId);

      const [assignments, profiles] = await Promise.all([
        AssignmentModel.find({ _id: { $in: assignmentIds } })
          .select("title subject status estimatedCost budget")
          .lean(),
        UserModel.find({ _id: { $in: profileIds } })
          .select("name email roles profileImage status")
          .lean(),
      ]);

      const assignmentMap = new Map(assignments.map((item) => [String(item._id), item]));
      const profileMap = new Map(profiles.map((item) => [String(item._id), item]));

      const data = reports.map((report) => ({
        ...report,
        reportedEntity:
          report.reportedType === "assignment"
            ? assignmentMap.get(String(report.reportedId)) || null
            : profileMap.get(String(report.reportedId)) || null,
      }));

      const total = await ReportModel.countDocuments(filter);

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
        message: "Unable to fetch reports",
      });
    }
  };

  static takeAction = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { action, note } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(reportId)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid report ID",
        });
      }

      const report = await ReportModel.findById(reportId);
      if (!report) {
        return res.status(404).json({
          status: "failed",
          message: "Report not found",
        });
      }

      const actionType = action || "";
      const normalizedAction = actionType.toLowerCase();

      if (
        !["delete_content", "block_user", "dismiss", "mark_reviewed"].includes(
          normalizedAction
        )
      ) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid action",
        });
      }

      if (normalizedAction === "delete_content") {
        if (report.reportedType === "assignment") {
          await AssignmentModel.findByIdAndUpdate(report.reportedId, {
            isActive: false,
            status: "cancelled",
          });
        } else {
          await UserModel.findByIdAndUpdate(report.reportedId, {
            status: "suspended",
          });
        }
        report.status = "actioned";
        report.adminAction = "delete_content";
      }

      if (normalizedAction === "block_user") {
        await UserModel.findByIdAndUpdate(report.reportedId, {
          status: "suspended",
        });
        report.status = "actioned";
        report.adminAction = "block_user";
      }

      if (normalizedAction === "dismiss") {
        report.status = "reviewed";
        report.adminAction = "dismissed";
      }

      if (normalizedAction === "mark_reviewed") {
        report.status = "reviewed";
        report.adminAction = "reviewed";
      }

      report.reviewedAt = new Date();
      if (note) {
        report.comments = sanitizeText(note);
      }

      await report.save();

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "REPORT_ACTION",
        targetId: report._id,
        targetType: "Report",
        metadata: {
          action: report.adminAction,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Report updated successfully",
        data: report,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to process report",
      });
    }
  };
}

export default ReportController;
