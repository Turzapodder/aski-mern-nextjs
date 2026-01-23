import UserModel from "../models/User.js";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOT_REGEX = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/;

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

const parseTimeSlot = (slot) => {
  const match = slot.match(TIME_SLOT_REGEX);
  if (!match) return null;
  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4]);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return null;
  }

  if (
    startHour > 23 ||
    startMinute > 59 ||
    endHour > 23 ||
    endMinute > 59
  ) {
    return null;
  }

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  if (end <= start) return null;

  return { start, end };
};

const validateAvailability = (availableDays, availableTimeSlots) => {
  if (!Array.isArray(availableDays)) {
    return "availableDays must be an array of weekday names";
  }

  const normalizedDays = availableDays.map((day) =>
    typeof day === "string" ? day.trim() : ""
  );

  for (const day of normalizedDays) {
    if (!WEEKDAYS.includes(day)) {
      return `Invalid day name: ${day}`;
    }
  }

  if (!Array.isArray(availableTimeSlots)) {
    return "availableTimeSlots must be an array of day/slot objects";
  }

  const daySlotMap = new Map();

  for (const entry of availableTimeSlots) {
    if (!entry || typeof entry !== "object") {
      return "Each availableTimeSlots entry must be an object";
    }

    const day = typeof entry.day === "string" ? entry.day.trim() : "";
    const slots = Array.isArray(entry.slots) ? entry.slots : [];

    if (!WEEKDAYS.includes(day)) {
      return `Invalid day name in time slots: ${day}`;
    }

    if (slots.length > 10) {
      return `Maximum 10 slots per day allowed for ${day}`;
    }

    const parsedSlots = slots.map((slot) => {
      if (typeof slot !== "string") return null;
      const trimmed = slot.trim();
      const parsed = parseTimeSlot(trimmed);
      if (!parsed) {
        return { error: `Invalid time slot format for ${day}: ${trimmed}` };
      }
      return { ...parsed, raw: trimmed };
    });

    for (const parsed of parsedSlots) {
      if (!parsed) {
        return `Invalid time slot format for ${day}`;
      }
      if (parsed.error) {
        return parsed.error;
      }
    }

    const ranges = parsedSlots
      .filter((slot) => slot && !slot.error)
      .map((slot) => ({ start: slot.start, end: slot.end }))
      .sort((a, b) => a.start - b.start);

    for (let i = 1; i < ranges.length; i += 1) {
      if (ranges[i].start < ranges[i - 1].end) {
        return `Time slots overlap for ${day}`;
      }
    }

    daySlotMap.set(day, slots.map((slot) => slot.trim()));
  }

  for (const day of normalizedDays) {
    if (!daySlotMap.has(day)) {
      daySlotMap.set(day, []);
    }
  }

  return null;
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
