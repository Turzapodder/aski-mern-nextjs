import mongoose from "mongoose";
import SubmissionModel from "../models/Submission.js";

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseStatusList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
};

class SubmissionController {
  static listSubmissions = async (req, res) => {
    try {
      const {
        assignmentId,
        studentId,
        tutorId,
        status,
        page = 1,
        limit = 20,
      } = req.query;

      const userId = req.user._id;
      const roles = req.user.roles || [];
      const isAdmin = roles.includes("admin");
      const isTutor = roles.includes("tutor");
      const isStudent = roles.includes("student");

      const filter = {};
      const statusList = parseStatusList(status);
      if (statusList.length === 1) {
        filter.status = statusList[0];
      } else if (statusList.length > 1) {
        filter.status = { $in: statusList };
      }

      if (assignmentId) {
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
          return res.status(400).json({
            status: "failed",
            message: "Invalid assignment ID",
          });
        }
        filter.assignment = assignmentId;
      }

      if (isAdmin) {
        if (studentId) {
          if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
              status: "failed",
              message: "Invalid student ID",
            });
          }
          filter.student = studentId;
        }
        if (tutorId) {
          if (!mongoose.Types.ObjectId.isValid(tutorId)) {
            return res.status(400).json({
              status: "failed",
              message: "Invalid tutor ID",
            });
          }
          filter.tutor = tutorId;
        }
      } else if (isTutor && isStudent) {
        filter.$or = [{ tutor: userId }, { student: userId }];
      } else if (isTutor) {
        filter.tutor = userId;
      } else {
        filter.student = userId;
      }

      const pageNumber = Math.max(1, parseNumber(page, 1));
      const limitNumber = Math.min(100, Math.max(1, parseNumber(limit, 20)));
      const skip = (pageNumber - 1) * limitNumber;

      const submissions = await SubmissionModel.find(filter)
        .populate("student", "name email profileImage")
        .populate("tutor", "name email profileImage")
        .populate("assignment", "title status deadline")
        .sort({ createdAt: -1, submittedAt: -1 })
        .skip(skip)
        .limit(limitNumber);

      const total = await SubmissionModel.countDocuments(filter);

      return res.status(200).json({
        status: "success",
        data: submissions,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalItems: total,
          itemsPerPage: limitNumber,
        },
      });
    } catch (error) {
      console.error("List submissions error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch submissions",
      });
    }
  };

  static getSubmissionById = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const roles = req.user.roles || [];
      const isAdmin = roles.includes("admin");

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid submission ID",
        });
      }

      const submission = await SubmissionModel.findById(id)
        .populate("student", "name email profileImage")
        .populate("tutor", "name email profileImage")
        .populate("assignment", "title status deadline");

      if (!submission) {
        return res.status(404).json({
          status: "failed",
          message: "Submission not found",
        });
      }

      const isStudent = submission.student?._id?.toString() === userId.toString();
      const isTutor = submission.tutor?._id?.toString() === userId.toString();

      if (!isAdmin && !isStudent && !isTutor) {
        return res.status(403).json({
          status: "failed",
          message: "Access denied",
        });
      }

      return res.status(200).json({
        status: "success",
        data: submission,
      });
    } catch (error) {
      console.error("Get submission error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch submission",
      });
    }
  };

  static markUnderReview = async (req, res) => {
    try {
      const { assignmentId } = req.body || {};
      const userId = req.user._id;
      const roles = req.user.roles || [];
      const isAdmin = roles.includes("admin");

      if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const latestSubmission = await SubmissionModel.findOne({
        assignment: assignmentId,
      })
        .sort({ createdAt: -1, submittedAt: -1 })
        .populate("student", "name email profileImage")
        .populate("tutor", "name email profileImage");

      if (!latestSubmission) {
        return res.status(404).json({
          status: "failed",
          message: "Submission not found",
        });
      }

      const isStudent = latestSubmission.student?._id?.toString() === userId.toString();
      if (!isAdmin && !isStudent) {
        return res.status(403).json({
          status: "failed",
          message: "Only the student can mark submissions under review",
        });
      }

      if (latestSubmission.status === "submitted") {
        latestSubmission.status = "under_review";
        await latestSubmission.save();
      }

      return res.status(200).json({
        status: "success",
        data: latestSubmission,
      });
    } catch (error) {
      console.error("Mark under review error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to update submission status",
      });
    }
  };

  static getLatestStatusByAssignments = async (req, res) => {
    try {
      const { assignmentIds } = req.body || {};
      const userId = req.user._id;
      const roles = req.user.roles || [];
      const isAdmin = roles.includes("admin");
      const isTutor = roles.includes("tutor");
      const isStudent = roles.includes("student");

      if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
        return res.status(200).json({
          status: "success",
          data: {},
        });
      }

      const validIds = assignmentIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (validIds.length === 0) {
        return res.status(400).json({
          status: "failed",
          message: "No valid assignment IDs provided",
        });
      }

      const match = { assignment: { $in: validIds } };
      if (!isAdmin) {
        if (isTutor && isStudent) {
          match.$or = [{ tutor: userId }, { student: userId }];
        } else if (isTutor) {
          match.tutor = userId;
        } else {
          match.student = userId;
        }
      }

      const latestStatuses = await SubmissionModel.aggregate([
        { $match: match },
        { $sort: { submittedAt: -1, createdAt: -1, _id: -1 } },
        {
          $group: {
            _id: "$assignment",
            status: { $first: "$status" },
            submittedAt: { $first: "$submittedAt" },
            review: { $first: "$review" },
          },
        },
      ]);

      const data = latestStatuses.reduce((acc, entry) => {
        acc[entry._id.toString()] = {
          status: entry.status,
          submittedAt: entry.submittedAt,
          review: entry.review || undefined,
        };
        return acc;
      }, {});

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      console.error("Latest submission status error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch latest submission status",
      });
    }
  };
}

export default SubmissionController;
