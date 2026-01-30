import UserModel from "../models/User.js";
import { validateAvailability } from "../utils/tutorAvailability.js";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isHexObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);

const sanitizeText = (value) => {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .trim();
};

const isTutorApproved = (tutor) => {
  if (!tutor) return false;
  if (typeof tutor.accountStatus === "string") {
    return tutor.accountStatus.trim().toUpperCase() === "APPROVED";
  }
  const approvedOnboarding = ["approved", "completed"].includes(
    tutor.onboardingStatus
  );
  const activeStatus = ["active", "approved"].includes(tutor.status);
  return approvedOnboarding && activeStatus;
};

const buildPublicTutor = (tutor) => ({
  _id: tutor._id,
  name: tutor.name,
  profileImage: tutor.profileImage || "",
  about: tutor.about || "",
  city: tutor.city || "",
  country: tutor.country || "",
  languages: tutor.languages || [],
  tutorProfile: tutor.tutorProfile || {},
  publicStats: tutor.publicStats || {},
  joinedDate:
    tutor.publicStats?.joinedDate ||
    tutor.registrationDate ||
    tutor.createdAt ||
    null,
});

class TutorsController {
  static getPublicTutorProfile = async (req, res) => {
    try {
      const { identifier } = req.params;

      if (!identifier || typeof identifier !== "string") {
        return res.status(400).json({
          success: false,
          error: "Tutor identifier is required",
          code: "INVALID_IDENTIFIER",
        });
      }

      const trimmedIdentifier = identifier.trim();
      const isObjectId = isHexObjectId(trimmedIdentifier);

      const baseQuery = {
        roles: "tutor",
      };

      if (isObjectId) {
        baseQuery._id = trimmedIdentifier;
      } else {
        baseQuery.$or = [
          {
            username: new RegExp(
              `^${escapeRegex(trimmedIdentifier)}$`,
              "i"
            ),
          },
          {
            name: new RegExp(
              `^${escapeRegex(trimmedIdentifier)}$`,
              "i"
            ),
          },
        ];
      }

      const tutor = await UserModel.findOne(baseQuery)
        .select(
          [
            "name",
            "profileImage",
            "about",
            "city",
            "country",
            "languages",
            "tutorProfile",
            "publicStats",
            "registrationDate",
            "createdAt",
            "onboardingStatus",
            "status",
            "accountStatus",
          ].join(" ")
        )
        .lean();

      if (!tutor || !isTutorApproved(tutor)) {
        return res.status(404).json({
          success: false,
          error: "Tutor not found",
          code: "TUTOR_NOT_FOUND",
        });
      }

      return res.status(200).json({
        success: true,
        data: { tutor: buildPublicTutor(tutor) },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Unable to fetch tutor profile",
        code: "SERVER_ERROR",
      });
    }
  };

  static listTutors = async (req, res) => {
    try {
      const { subject, minRating, maxRate, skills, availability } = req.query;

      const query = {
        roles: "tutor",
        onboardingStatus: { $in: ["approved", "completed"] },
        status: { $in: ["active", "approved"] },
      };

      if (subject) {
        query["tutorProfile.expertiseSubjects"] = new RegExp(
          `^${escapeRegex(subject)}$`,
          "i"
        );
      }

      if (minRating) {
        const parsedMinRating = Number(minRating);
        if (!Number.isNaN(parsedMinRating)) {
          query["publicStats.averageRating"] = { $gte: parsedMinRating };
        }
      }

      if (maxRate) {
        const parsedMaxRate = Number(maxRate);
        if (!Number.isNaN(parsedMaxRate)) {
          query["tutorProfile.hourlyRate"] = { $lte: parsedMaxRate };
        }
      }

      if (skills) {
        const skillsList = String(skills)
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

        if (skillsList.length > 0) {
          query["tutorProfile.skills"] = {
            $all: skillsList.map(
              (skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")
            ),
          };
        }
      }

      if (availability) {
        const days = String(availability)
          .split(",")
          .map((day) => day.trim())
          .filter(Boolean);
        if (days.length > 0) {
          query["tutorProfile.availableDays"] = {
            $all: days.map(
              (day) => new RegExp(`^${escapeRegex(day)}$`, "i")
            ),
          };
        }
      }

      const tutors = await UserModel.find(query)
        .select(
          [
            "name",
            "profileImage",
            "about",
            "tutorProfile.bio",
            "tutorProfile.hourlyRate",
            "tutorProfile.skills",
            "tutorProfile.expertiseSubjects",
            "publicStats",
          ].join(" ")
        )
        .sort({ "publicStats.averageRating": -1 })
        .limit(20)
        .lean();

      const total = await UserModel.countDocuments(query);

      const formattedTutors = tutors.map((tutor) => ({
        id: tutor._id,
        name: tutor.name,
        avatar: tutor.profileImage,
        bio: tutor.tutorProfile?.bio || tutor.about || "",
        publicStats: tutor.publicStats || {},
        hourlyRate: tutor.tutorProfile?.hourlyRate || 0,
        skills: tutor.tutorProfile?.skills || [],
        subjects: tutor.tutorProfile?.expertiseSubjects || [],
      }));

      return res.status(200).json({
        success: true,
        data: formattedTutors,
        pagination: {
          page: 1,
          limit: 20,
          total,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Unable to fetch tutors",
        code: "SERVER_ERROR",
      });
    }
  };

  static updateAvailability = async (req, res) => {
    try {
      const user = req.user;

      if (!user?.roles?.includes("tutor")) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          code: "FORBIDDEN",
        });
      }

      const { availableDays, availableTimeSlots } = req.body || {};

      const validationError = validateAvailability(
        availableDays,
        availableTimeSlots
      );

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError,
          code: "INVALID_AVAILABILITY",
        });
      }

      const updated = await UserModel.findByIdAndUpdate(
        user._id,
        {
          "tutorProfile.availableDays": availableDays,
          "tutorProfile.availableTimeSlots": availableTimeSlots,
        },
        { new: true, runValidators: true }
      )
        .select("tutorProfile.availableDays tutorProfile.availableTimeSlots")
        .lean();

      return res.status(200).json({
        success: true,
        data: {
          availableDays: updated?.tutorProfile?.availableDays || [],
          availableTimeSlots: updated?.tutorProfile?.availableTimeSlots || [],
        },
        message: "Availability updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Unable to update availability",
        code: "SERVER_ERROR",
      });
    }
  };

  static updateSettings = async (req, res) => {
    try {
      const user = req.user;

      if (!user?.roles?.includes("tutor")) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          code: "FORBIDDEN",
        });
      }

      const { bio, hourlyRate, skills, languages, subjects } = req.body || {};
      const update = {};

      if (bio !== undefined) {
        const sanitizedBio = sanitizeText(bio);
        if (sanitizedBio.length > 1000) {
          return res.status(400).json({
            success: false,
            error: "Bio must be 1000 characters or less",
            code: "INVALID_BIO",
          });
        }
        update["tutorProfile.bio"] = sanitizedBio;
        update.about = sanitizedBio;
      }

      if (hourlyRate !== undefined) {
        const parsedRate = Number(hourlyRate);
        if (
          Number.isNaN(parsedRate) ||
          parsedRate < 50 ||
          parsedRate > 10000
        ) {
          return res.status(400).json({
            success: false,
            error: "Hourly rate must be between 50 and 10000",
            code: "INVALID_RATE",
          });
        }
        update["tutorProfile.hourlyRate"] = parsedRate;
      }

      if (skills !== undefined) {
        if (!Array.isArray(skills)) {
          return res.status(400).json({
            success: false,
            error: "Skills must be an array",
            code: "INVALID_SKILLS",
          });
        }

        const sanitizedSkills = skills
          .map((skill) => sanitizeText(skill))
          .filter(Boolean);

        if (sanitizedSkills.length > 15) {
          return res.status(400).json({
            success: false,
            error: "Skills cannot exceed 15 items",
            code: "INVALID_SKILLS",
          });
        }

        update["tutorProfile.skills"] = sanitizedSkills;
      }

      if (languages !== undefined) {
        if (!Array.isArray(languages)) {
          return res.status(400).json({
            success: false,
            error: "Languages must be an array",
            code: "INVALID_LANGUAGES",
          });
        }

        update.languages = languages
          .map((language) => sanitizeText(language))
          .filter(Boolean);
      }

      if (subjects !== undefined) {
        if (!Array.isArray(subjects)) {
          return res.status(400).json({
            success: false,
            error: "Subjects must be an array",
            code: "INVALID_SUBJECTS",
          });
        }

        update["tutorProfile.expertiseSubjects"] = subjects
          .map((subjectName) => sanitizeText(subjectName))
          .filter(Boolean);
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid fields provided for update",
          code: "NO_FIELDS",
        });
      }

      const updated = await UserModel.findByIdAndUpdate(user._id, update, {
        new: true,
        runValidators: true,
      })
        .select("about languages tutorProfile.hourlyRate tutorProfile.skills tutorProfile.expertiseSubjects tutorProfile.bio")
        .lean();

      return res.status(200).json({
        success: true,
        data: {
          bio: updated?.tutorProfile?.bio || updated?.about || "",
          hourlyRate: updated?.tutorProfile?.hourlyRate || 0,
          skills: updated?.tutorProfile?.skills || [],
          languages: updated?.languages || [],
          subjects: updated?.tutorProfile?.expertiseSubjects || [],
        },
        message: "Settings updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Unable to update settings",
        code: "SERVER_ERROR",
      });
    }
  };
}

export default TutorsController;
