import UserModel from "../models/User.js";
import TutorApplicationModel from "../models/TutorApplication.js";
import mongoose from "mongoose";

class ProfileController {
  static getProfile = async (req, res) => {
    try {
      const { userId } = req.params;

      // Aggregation pipeline for efficient data retrieval
      const userProfile = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            gender: 1,
            dateOfBirth: 1,
            country: 1,
            city: 1,
            address: 1,
            about: 1,
            languages: 1,
            profileImage: 1,
            profileStatus: 1,
            roles: 1,
            is_verified: 1,
            registrationDate: 1,
            lastLogin: 1,
            studentProfile: {
              $cond: [{ $in: ["student", "$roles"] }, "$studentProfile", null],
            },
            tutorProfile: {
              $cond: [{ $in: ["tutor", "$roles"] }, "$tutorProfile", null],
            },
            onboardingStatus: 1,
            status: 1,
          },
        },
      ]);

      if (!userProfile || userProfile.length === 0) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      const user = userProfile[0];
      const isTutor = user.roles.includes("tutor");

      // Fetch latest tutor application if exists
      let tutorApplication = null;
      if (isTutor) {
        tutorApplication = await TutorApplicationModel.findOne({
          user: userId,
        })
          .sort({ createdAt: -1 })
          .lean();
      }

      res.status(200).json({
        status: "success",
        user,
        meta: {
          roles: user.roles,
          prefill: tutorApplication
            ? {
                personalInfo: tutorApplication.personalInfo,
                academicInfo: tutorApplication.academicInfo,
                documents: tutorApplication.documents,
                applicationStatus: tutorApplication.applicationStatus,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("getProfile error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to fetch profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

  /**
   * Update user profile with validation
   * Handles both common and role-specific fields
   */
  static updateProfile = async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        // Common profile
        profileImage,
        name,
        phone,
        gender,
        dateOfBirth,
        country,
        city,
        address,
        about,
        languages,
        profileStatus,
        // Student
        studentProfile,
        // Tutor
        tutorProfile,
      } = req.body;

      // Validate ObjectId
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID format",
        });
      }

      // Validate required common fields
      if (name && name.trim().length < 2) {
        return res.status(400).json({
          status: "failed",
          message: "Name must be at least 2 characters long",
        });
      }

      // Build update object with only provided fields
      const update = {};

      if (profileImage !== undefined) update.profileImage = profileImage;
      if (name !== undefined) update.name = name.trim();
      if (phone !== undefined) update.phone = phone.trim();
      if (gender !== undefined) update.gender = gender;
      if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth;
      if (country !== undefined) update.country = country.trim();
      if (city !== undefined) update.city = city.trim();
      if (address !== undefined) update.address = address.trim();
      if (about !== undefined) update.about = about.trim();
      if (languages !== undefined) {
        update.languages = Array.isArray(languages)
          ? languages.filter((l) => l.trim()).map((l) => l.trim())
          : [];
      }
      if (profileStatus !== undefined) update.profileStatus = profileStatus;

      // Handle role-specific updates
      if (studentProfile) {
        // Validate student profile
        const validatedStudent =
          ProfileController.validateStudentProfile(studentProfile);
        update.studentProfile = validatedStudent;
      }

      if (tutorProfile) {
        // Validate tutor profile
        const validatedTutor =
          ProfileController.validateTutorProfile(tutorProfile);
        update.tutorProfile = validatedTutor;
      }

      // Update user document
      const updated = await UserModel.findByIdAndUpdate(userId, update, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        user: updated,
      });
    } catch (error) {
      console.error("updateProfile error:", error);

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({
          status: "failed",
          message: `Validation error: ${messages}`,
        });
      }

      res.status(500).json({
        status: "failed",
        message: "Unable to update profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

  /**
   * Validate student profile data
   */
  static validateStudentProfile = (data) => {
    return {
      institutionName: data.institutionName?.trim() || undefined,
      institutionType: data.institutionType || undefined,
      department: data.department?.trim() || undefined,
      degree: data.degree?.trim() || undefined,
      yearOfStudy: data.yearOfStudy?.trim() || undefined,
      studentID: data.studentID?.trim() || undefined,
      cgpa: data.cgpa?.trim() || undefined,
      interests: Array.isArray(data.interests)
        ? data.interests.filter((i) => i.trim()).map((i) => i.trim())
        : [],
      skills: Array.isArray(data.skills)
        ? data.skills.filter((s) => s.trim()).map((s) => s.trim())
        : [],
      guardianContact: data.guardianContact?.trim() || undefined,
      documents: data.documents || [],
    };
  };

  /**
   * Validate tutor profile data
   */
  static validateTutorProfile = (data) => {
    return {
      professionalTitle: data.professionalTitle?.trim() || undefined,
      qualification: data.qualification?.trim() || undefined,
      expertiseSubjects: Array.isArray(data.expertiseSubjects)
        ? data.expertiseSubjects.filter((s) => s.trim()).map((s) => s.trim())
        : [],
      experienceYears: data.experienceYears
        ? Math.max(0, parseInt(data.experienceYears))
        : undefined,
      currentInstitution: data.currentInstitution?.trim() || undefined,
      availableDays: Array.isArray(data.availableDays)
        ? data.availableDays.filter((d) => d.trim()).map((d) => d.trim())
        : [],
      availableTimeSlots: Array.isArray(data.availableTimeSlots)
        ? data.availableTimeSlots.filter((t) => t.trim()).map((t) => t.trim())
        : [],
      hourlyRate: data.hourlyRate
        ? Math.max(0, parseInt(data.hourlyRate))
        : undefined,
      teachingMode: data.teachingMode || undefined,
      achievements: data.achievements?.trim() || undefined,
      documents: data.documents || [],
      verificationStatus: data.verificationStatus || "Pending",
    };
  };

  /**
   * Upload profile files (images and documents)
   * FIXED: Now automatically updates user profile with uploaded files
   */
  static uploadFiles = async (req, res) => {
    try {
      const { userId } = req.params;
      const files = req.files || {};

      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID format",
        });
      }

      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      const response = {};
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const updateData = {};

      // Process profile image
      if (files.profileImage && files.profileImage[0]) {
        const file = files.profileImage[0];
        const imageUrl = `${baseUrl}/uploads/user-documents/${file.filename}`;

        response.profileImage = {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: imageUrl,
          absoluteUrl: `${baseUrl}${imageUrl}`,
        };

        // Update user's profileImage in database
        updateData.profileImage = imageUrl;
      }

      // Process documents
      if (files.documents && files.documents.length > 0) {
        response.documents = files.documents.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/user-documents/${file.filename}`,
          absoluteUrl: `${baseUrl}/uploads/user-documents/${file.filename}`,
        }));

        // Determine which profile to update (tutor or student)
        const role =
          req.body.role || (user.roles.includes("tutor") ? "tutor" : "student");

        if (role === "tutor" && user.roles.includes("tutor")) {
          // Append to existing tutor documents
          const existingDocs = user.tutorProfile?.documents || [];
          updateData["tutorProfile.documents"] = [
            ...existingDocs,
            ...response.documents,
          ];
        } else if (role === "student" && user.roles.includes("user")) {
          // Append to existing student documents
          const existingDocs = user.studentProfile?.documents || [];
          updateData["studentProfile.documents"] = [
            ...existingDocs,
            ...response.documents,
          ];
        }
      }

      // Update user profile with uploaded files
      if (Object.keys(updateData).length > 0) {
        await UserModel.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true }
        );
      }

      res.status(200).json({
        status: "success",
        message: "Files uploaded successfully",
        files: response,
      });
    } catch (error) {
      console.error("uploadFiles error:", error);
      res.status(500).json({
        status: "failed",
        message: "File upload failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

  /**
   * Get public tutor profile (for client viewing)
   */
  static getTutorPublicProfile = async (req, res) => {
    try {
      const { tutorId } = req.params;

      if (!tutorId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid tutor ID format",
        });
      }

      const tutor = await UserModel.findById(tutorId)
        .select({
          name: 1,
          profileImage: 1,
          about: 1,
          city: 1,
          country: 1,
          languages: 1,
          tutorProfile: 1,
          registrationDate: 1,
        })
        .lean();

      if (!tutor || !tutor.roles.includes("tutor")) {
        return res.status(404).json({
          status: "failed",
          message: "Tutor not found",
        });
      }

      res.status(200).json({
        status: "success",
        tutor,
      });
    } catch (error) {
      console.error("getTutorPublicProfile error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to fetch tutor profile",
      });
    }
  };

  /**
   * Get all verified tutors with optional filtering
   */
  static getVerifiedTutors = async (req, res) => {
    try {
      const { page = 1, limit = 10, subject, city } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const matchStage = {
        $match: {
          roles: "tutor",
          "tutorProfile.verificationStatus": "Verified",
        },
      };

      if (subject) {
        matchStage.$match["tutorProfile.expertiseSubjects"] = subject;
      }

      if (city) {
        matchStage.$match.city = { $regex: city, $options: "i" };
      }

      const tutors = await UserModel.aggregate([
        matchStage,
        {
          $project: {
            name: 1,
            profileImage: 1,
            city: 1,
            country: 1,
            about: 1,
            tutorProfile: {
              qualification: 1,
              expertiseSubjects: 1,
              experienceYears: 1,
              hourlyRate: 1,
              teachingMode: 1,
              verificationStatus: 1,
            },
          },
        },
        { $skip: skip },
        { $limit: parseInt(limit) },
      ]);

      const total = await UserModel.countDocuments({
        roles: "tutor",
        "tutorProfile.verificationStatus": "Verified",
        ...(subject && { "tutorProfile.expertiseSubjects": subject }),
        ...(city && { city: { $regex: city, $options: "i" } }),
      });

      res.status(200).json({
        status: "success",
        tutors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("getVerifiedTutors error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to fetch tutors",
      });
    }
  };

  /**
   * Calculate profile completion percentage
   */
  static getProfileCompletion = async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid user ID format",
        });
      }

      const user = await UserModel.findById(userId).lean();

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }

      const completion = ProfileController.calculateCompletion(user);

      res.status(200).json({
        status: "success",
        completion,
        profileStatus: user.profileStatus,
      });
    } catch (error) {
      console.error("getProfileCompletion error:", error);
      res.status(500).json({
        status: "failed",
        message: "Unable to calculate profile completion",
      });
    }
  };

  /**
   * Helper: Calculate profile completion percentage
   */
  static calculateCompletion = (user) => {
    let filled = 0;
    let total = 0;

    // Common fields
    const commonFields = [
      "name",
      "phone",
      "country",
      "city",
      "about",
      "profileImage",
    ];
    commonFields.forEach((field) => {
      total++;
      if (user[field]) filled++;
    });

    // Tutor-specific fields
    if (user.roles.includes("tutor") && user.tutorProfile) {
      const tutorFields = [
        "qualification",
        "experienceYears",
        "hourlyRate",
        "teachingMode",
      ];
      tutorFields.forEach((field) => {
        total++;
        if (
          user.tutorProfile[field] ||
          (Array.isArray(user.tutorProfile[field]) &&
            user.tutorProfile[field].length > 0)
        ) {
          filled++;
        }
      });

      if (user.tutorProfile.expertiseSubjects?.length > 0) {
        filled++;
      }
      total++;
    }

    // Student-specific fields
    if (user.roles.includes("student") && user.studentProfile) {
      const studentFields = ["institutionName", "degree", "yearOfStudy"];
      studentFields.forEach((field) => {
        total++;
        if (user.studentProfile[field]) filled++;
      });
    }

    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };
}

export default ProfileController;
