import UserModel from "../models/User.js";
import TutorApplicationModel from "../models/TutorApplication.js";
import multer from "multer";
import path from "path";
import fs from "fs";

class ProfileController {
  static getProfile = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId).lean();
      if (!user) {
        return res.status(404).json({ status: "failed", message: "User not found" });
      }

      // Detect role
      const roles = user.roles || ["user"]; 
      const isTutor = roles.includes("tutor");

      // Prefill from latest tutor application if exists and tutorProfile is sparse
      let tutorApplication = null;
      if (isTutor) {
        tutorApplication = await TutorApplicationModel.findOne({ user: user._id })
          .sort({ createdAt: -1 })
          .lean();
      }

      res.status(200).json({
        status: "success",
        user,
        meta: {
          roles,
          prefill: tutorApplication ? {
            personalInfo: tutorApplication.personalInfo,
            academicInfo: tutorApplication.academicInfo,
            documents: tutorApplication.documents,
            applicationStatus: tutorApplication.applicationStatus
          } : null
        }
      });
    } catch (error) {
      console.error("getProfile error:", error);
      res.status(500).json({ status: "failed", message: "Unable to fetch profile" });
    }
  };

  static updateProfile = async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        // Common profile
        profileImage,
        fullName,
        phone,
        gender,
        dateOfBirth,
        country,
        city,
        address,
        about,
        socialLinks,
        languages,
        profileStatus,
        // Student
        studentProfile,
        // Tutor
        tutorProfile
      } = req.body;

      const update = {};
      if (profileImage !== undefined) update.profileImage = profileImage;
      if (fullName !== undefined) update.fullName = fullName;
      if (phone !== undefined) update.phone = phone;
      if (gender !== undefined) update.gender = gender;
      if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth;
      if (country !== undefined) update.country = country;
      if (city !== undefined) update.city = city;
      if (address !== undefined) update.address = address;
      if (about !== undefined) update.about = about;
      if (socialLinks !== undefined) update.socialLinks = socialLinks;
      if (languages !== undefined) update.languages = languages;
      if (profileStatus !== undefined) update.profileStatus = profileStatus;

      if (studentProfile) {
        update.studentProfile = studentProfile;
      }
      if (tutorProfile) {
        update.tutorProfile = tutorProfile;
        // Maintain legacy fields for compatibility if provided
        if (tutorProfile.expertiseSubjects) update.subjects = tutorProfile.expertiseSubjects;
        if (typeof tutorProfile.hourlyRate === 'number') update.hourlyRate = tutorProfile.hourlyRate;
        if (typeof tutorProfile.experienceYears === 'number') update.experience = tutorProfile.experienceYears;
      }

      const updated = await UserModel.findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ status: "failed", message: "User not found" });
      }

      res.status(200).json({ status: "success", message: "Profile updated", user: updated });
    } catch (error) {
      console.error("updateProfile error:", error);
      res.status(500).json({ status: "failed", message: "Unable to update profile" });
    }
  };
}

export default ProfileController;

// Configure multer for user profile uploads
const ensureUploadDir = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (e) {
    console.error("Failed to ensure upload directory:", dirPath, e);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "backend", "uploads", "user-documents");
    ensureUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg", "image/png", "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"));
};

export const uploadProfileFiles = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });