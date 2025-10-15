import TutorApplicationModel from "../models/TutorApplication.js";
import QuizResultModel from "../models/QuizResult.js";
import UserModel from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/tutor-documents");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only images and PDF files are allowed."),
      false
    );
  }
};

export const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

class TutorController {
  // Submit tutor application
  static submitApplication = async (req, res) => {
    try {
      const userId = req.user._id;
      console.log("submitApplication userId::", userId, "Req body::", req.body);
      console.log("Request timestamp:", new Date().toISOString());

      // Parse JSON strings from FormData
      let personalInfo, academicInfo, quizSummary;

      try {
        personalInfo =
          typeof req.body.personalInfo === "string"
            ? JSON.parse(req.body.personalInfo)
            : req.body.personalInfo;

        academicInfo =
          typeof req.body.academicInfo === "string"
            ? JSON.parse(req.body.academicInfo)
            : req.body.academicInfo;

        quizSummary =
          typeof req.body.quizSummary === "string"
            ? JSON.parse(req.body.quizSummary)
            : req.body.quizSummary;

        console.log(
          "Parsed data - Subject:",
          academicInfo?.subject,
          "User:",
          userId
        );
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        return res.status(400).json({
          status: "failed",
          message: "Invalid JSON format in request data",
        });
      }

      // Validate required fields
      if (!personalInfo || !academicInfo || !quizSummary) {
        console.log("Missing required fields:", {
          personalInfo: !!personalInfo,
          academicInfo: !!academicInfo,
          quizSummary: !!quizSummary,
        });
        return res.status(400).json({
          status: "failed",
          message:
            "Missing required fields: personalInfo, academicInfo, and quizSummary are required",
        });
      }

      // Check if user already has a pending application for the same subject
      const existingApplication = await TutorApplicationModel.findOne({
        user: userId,
        "academicInfo.subject": academicInfo.subject,
        applicationStatus: { $in: ["pending", "under_review"] },
      });

      if (existingApplication) {
        console.log("Duplicate application attempt blocked:", {
          userId: userId.toString(),
          subject: academicInfo.subject,
          existingStatus: existingApplication.applicationStatus,
          existingId: existingApplication._id.toString(),
        });
        return res.status(400).json({
          status: "failed",
          message: `You already have a ${existingApplication.applicationStatus} application for ${academicInfo.subject}. Please wait for the current application to be processed.`,
          existingApplication: {
            id: existingApplication._id,
            status: existingApplication.applicationStatus,
            submittedAt: existingApplication.createdAt,
          },
        });
      }

      console.log(
        "No existing application found, proceeding with submission..."
      );

      // Save quiz result first
      let quizResultId = null;
      if (quizSummary) {
        // Validate and clean quiz summary data
        const {
          totalQuestions = 0,
          correctAnswers = 0,
          score = 0,
          timeSpent = 0,
          topicPerformance = {},
          answeredQuestions = 0,
        } = quizSummary;

        // Convert to numbers safely
        const validTotalQuestions = Number(totalQuestions) || 0;
        const validScore = Number(score) || 0;
        const validCorrectAnswers = Number(correctAnswers) || validScore;
        const validIncorrectAnswers = validTotalQuestions - validScore;
        const validTimeSpent = Number(timeSpent) || 0;

        // Calculate percentage safely
        const percentage =
          validTotalQuestions > 0
            ? Math.round((validScore / validTotalQuestions) * 100)
            : 0;

        // Ensure we have required subject and topics
        if (!academicInfo?.subject || !academicInfo?.topics?.length) {
          return res.status(400).json({
            status: "failed",
            message: "Academic subject and topics are required for quiz result",
          });
        }

        // Process topic performance
        const processedTopicPerformance = {};
        if (topicPerformance && typeof topicPerformance === "object") {
          Object.keys(topicPerformance).forEach((topic) => {
            const perf = topicPerformance[topic];
            if (perf && typeof perf === "object") {
              const total = Number(perf.total) || 0;
              const correct = Number(perf.correct) || 0;
              processedTopicPerformance[topic] = {
                total,
                correct,
                percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
              };
            }
          });
        }

        const quizResult = new QuizResultModel({
          user: userId,
          subject: academicInfo.subject,
          topics: Array.isArray(academicInfo.topics)
            ? academicInfo.topics
            : [academicInfo.subject],
          totalQuestions: validTotalQuestions,
          correctAnswers: validCorrectAnswers,
          incorrectAnswers: validIncorrectAnswers,
          score: validScore,
          percentage: percentage,
          timeSpent: validTimeSpent,
          topicPerformance: processedTopicPerformance,
          answers: Array.isArray(quizSummary.answers)
            ? quizSummary.answers
            : [],
          quizType: "onboarding",
        });

        try {
          await quizResult.save();
          quizResultId = quizResult._id;
          console.log("Quiz result saved successfully:", quizResultId);
        } catch (quizError) {
          console.error("Quiz result save error:", quizError);
          return res.status(500).json({
            status: "failed",
            message: "Failed to save quiz result",
          });
        }
      }

      // Process uploaded files
      const documents = {};
      if (req.files) {
        const files = req.files;

        if (files.certificate && files.certificate[0]) {
          const cert = files.certificate[0];
          documents.certificate = {
            filename: cert.filename,
            originalName: cert.originalname,
            mimetype: cert.mimetype,
            size: cert.size,
            url: `/uploads/tutor-documents/${cert.filename}`,
          };
        }

        if (files.profilePicture && files.profilePicture[0]) {
          const profile = files.profilePicture[0];
          documents.profilePicture = {
            filename: profile.filename,
            originalName: profile.originalname,
            mimetype: profile.mimetype,
            size: profile.size,
            url: `/uploads/tutor-documents/${profile.filename}`,
          };
        }
      }

      // Create tutor application
      const application = new TutorApplicationModel({
        user: userId,
        personalInfo: {
          name: personalInfo.name,
          email: personalInfo.email,
          phoneNumber: personalInfo.phoneNumber,
          university: personalInfo.university,
          degree: personalInfo.degree,
          gpa: personalInfo.gpa,
          country: personalInfo.country,
        },
        academicInfo: {
          subject: academicInfo.subject,
          topics: Array.isArray(academicInfo.topics) ? academicInfo.topics : [],
        },
        documents,
        quizResult: quizResultId,
        applicationStatus: "pending",
      });

      try {
        await application.save();
        console.log("Application saved successfully:", application._id);
      } catch (appError) {
        console.error("Application save error:", appError);
        // If application save fails but quiz result was saved, we should handle cleanup
        if (quizResultId) {
          await QuizResultModel.findByIdAndDelete(quizResultId);
        }
        return res.status(500).json({
          status: "failed",
          message: "Failed to save application",
        });
      }

      // Update user's onboarding status
      try {
        await UserModel.findByIdAndUpdate(userId, {
          onboardingStatus: "under_review",
        });
        console.log("User onboarding status updated");
      } catch (userUpdateError) {
        console.error("User update error:", userUpdateError);
        // This is not critical, so we don't fail the request
      }

      res.status(201).json({
        status: "success",
        message: "Application submitted successfully",
        application: application._id,
        data: {
          applicationId: application._id,
          quizResultId: quizResultId,
          status: application.applicationStatus,
        },
      });
    } catch (error) {
      console.error("Submit application error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to submit application",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

  // Get tutor application status
  static getApplicationStatus = async (req, res) => {
    try {
      const userId = req.user._id;

      const application = await TutorApplicationModel.findOne({ user: userId })
        .populate("quizResult")
        .populate("user", "name email onboardingStatus")
        .sort({ createdAt: -1 });

      if (!application) {
        return res.status(404).json({
          status: "failed",
          message: "No application found",
        });
      }

      res.status(200).json({
        status: "success",
        application,
      });
    } catch (error) {
      console.error("Get application status error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to fetch application status",
      });
    }
  };

  // Get all tutor applications (admin only)
  static getAllApplications = async (req, res) => {
    try {
      const { page = 1, limit = 20, status, subject } = req.query;

      let query = {};
      if (status) {
        query.applicationStatus = status;
      }
      if (subject) {
        query["academicInfo.subject"] = subject;
      }

      const applications = await TutorApplicationModel.find(query)
        .populate("user", "name email")
        .populate("quizResult")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await TutorApplicationModel.countDocuments(query);

      res.status(200).json({
        status: "success",
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get all applications error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to fetch applications",
      });
    }
  };

  // Review tutor application (admin only)
  static reviewApplication = async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, reviewNotes } = req.body;
      const reviewerId = req.user._id;

      if (!["approved", "rejected", "under_review"].includes(status)) {
        return res.status(400).json({
          status: "failed",
          message:
            "Invalid status. Must be approved, rejected, or under_review",
        });
      }

      const application = await TutorApplicationModel.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          status: "failed",
          message: "Application not found",
        });
      }

      // Update application
      application.applicationStatus = status;
      application.reviewNotes = reviewNotes;
      application.reviewedBy = reviewerId;
      application.reviewedAt = new Date();

      if (status === "approved") {
        application.approvedAt = new Date();

        // Update user role and onboarding status
        await UserModel.findByIdAndUpdate(application.user, {
          $addToSet: { roles: "tutor" },
          onboardingStatus: "completed",
        });
      } else if (status === "rejected") {
        // Reset user onboarding status if rejected
        await UserModel.findByIdAndUpdate(application.user, {
          onboardingStatus: "incomplete",
        });
      }

      await application.save();

      res.status(200).json({
        status: "success",
        message: "Application reviewed successfully",
        application,
      });
    } catch (error) {
      console.error("Review application error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to review application",
      });
    }
  };

  // Check if user can apply for a subject
  static canApplyForSubject = async (req, res) => {
    try {
      const userId = req.user._id;
      const { subject } = req.params;

      const existingApplication = await TutorApplicationModel.findOne({
        user: userId,
        "academicInfo.subject": subject,
        applicationStatus: { $in: ["pending", "under_review"] },
      });

      const canApply = !existingApplication;
      let message = "You can apply for this subject";

      if (!canApply) {
        message = `You already have a ${existingApplication.applicationStatus} application for ${subject}`;
      }

      res.status(200).json({
        status: "success",
        canApply,
        message,
        existingApplication: existingApplication
          ? {
              id: existingApplication._id,
              status: existingApplication.applicationStatus,
              createdAt: existingApplication.createdAt,
            }
          : null,
      });
    } catch (error) {
      console.error("Check can apply error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to check application status",
      });
    }
  };
}

export default TutorController;
