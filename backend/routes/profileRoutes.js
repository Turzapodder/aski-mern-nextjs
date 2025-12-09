import express from "express";
import { uploadProfile } from "../config/s3Config.js";
import path from "path";
import fs from "fs";
import ProfileController from "../controllers/profileController.js";
import AccessTokenAutoRefresh from "../middlewares/setAuthHeader.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const router = express.Router();

// Local multer configuration removed in favor of S3

// Middleware stack for protected routes
const protectedRoutes = [AccessTokenAutoRefresh, checkUserAuth];

/**
 * Public Routes
 */

/**
 * GET /api/profile/tutor/:tutorId
 * Get public tutor profile (viewable by anyone)
 */
router.get("/tutor/public/:tutorId", ProfileController.getTutorPublicProfile);

/**
 * GET /api/profile/tutors/verified
 * Get all verified tutors with filtering
 * Query params: page, limit, subject, city
 */
router.get("/tutors/verified", ProfileController.getVerifiedTutors);

/**
 * Protected Routes
 */

/**
 * GET /api/profile/:userId
 * Get user profile (owner or admin only)
 */
router.get(
  "/:userId",
  protectedRoutes,
  async (req, res, next) => {
    const { userId } = req.params;
    const requestingUserId = req.user._id.toString();

    // Allow access if user is viewing their own profile or is admin
    if (userId !== requestingUserId && !req.user.roles.includes("admin")) {
      return res.status(403).json({
        status: "failed",
        message: "Unauthorized access",
      });
    }

    next();
  },
  ProfileController.getProfile
);

/**
 * PUT /api/profile/:userId
 * Update user profile
 */
router.put(
  "/:userId",
  protectedRoutes,
  async (req, res, next) => {
    const { userId } = req.params;
    const requestingUserId = req.user._id.toString();

    if (userId !== requestingUserId && !req.user.roles.includes("admin")) {
      return res.status(403).json({
        status: "failed",
        message: "Unauthorized access",
      });
    }

    next();
  },
  ProfileController.updateProfile
);

/**
 * POST /api/profile/:userId/upload
 * Upload profile files (images and documents)
 */
router.post(
  "/:userId/upload",
  protectedRoutes,
  uploadProfile.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res, next) => {
    const { userId } = req.params;
    const requestingUserId = req.user._id.toString();

    if (userId !== requestingUserId && !req.user.roles.includes("admin")) {
      return res.status(403).json({
        status: "failed",
        message: "Unauthorized access",
      });
    }

    next();
  },
  ProfileController.uploadFiles
);

/**
 * GET /api/profile/:userId/completion
 * Get profile completion percentage
 */
router.get(
  "/:userId/completion",
  protectedRoutes,
  ProfileController.getProfileCompletion
);

/**
 * Admin Routes
 */

/**
 * PUT /api/profile/admin/:userId/verify
 * Admin: Verify tutor profile
 */
router.put(
  "/admin/:userId/verify",
  [AccessTokenAutoRefresh, checkUserAuth],
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { verificationStatus, reason } = req.body;

      if (!["Verified", "Rejected", "Pending"].includes(verificationStatus)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid verification status",
        });
      }

      const updated = await UserModel.findByIdAndUpdate(
        userId,
        {
          "tutorProfile.verificationStatus": verificationStatus,
          onboardingStatus:
            verificationStatus === "Verified" ? "approved" : "rejected",
        },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: `Profile ${verificationStatus.toLowerCase()} successfully`,
        user: updated,
      });
    } catch (error) {
      console.error("Tutor verification error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to verify tutor",
      });
    }
  }
);

/**
 * Error handler middleware for file upload errors
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "FILE_TOO_LARGE") {
      return res.status(400).json({
        status: "failed",
        message: "File size exceeds 10MB limit",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        status: "failed",
        message: "Maximum 5 files allowed",
      });
    }
  }

  if (error && error.message) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }

  next(error);
});

export default router;
