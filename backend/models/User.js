import mongoose from "mongoose";

const StudentProfileSchema = new mongoose.Schema(
  {
    institutionName: { type: String, trim: true },
    institutionType: {
      type: String,
      enum: ["College", "University", "High School", "Other"],
    },
    department: { type: String, trim: true },
    degree: { type: String, trim: true },
    yearOfStudy: { type: String, trim: true },
    studentID: { type: String, trim: true },
    cgpa: { type: String, trim: true },
    interests: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    guardianContact: { type: String, trim: true },
    documents: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
  },
  { _id: false }
);

const TutorProfileSchema = new mongoose.Schema(
  {
    professionalTitle: { type: String, trim: true },
    qualification: { type: String, trim: true },
    expertiseSubjects: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, min: 0 },
    currentInstitution: { type: String, trim: true },
    availableDays: { type: [String], default: [] },
    availableTimeSlots: { type: [mongoose.Schema.Types.Mixed], default: [] },
    hourlyRate: { type: Number, min: 0 },
    teachingMode: { type: String, enum: ["Online", "Offline", "Hybrid"] },
    achievements: { type: String, trim: true },
    bio: { type: String, trim: true },
    documents: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    is_verified: { type: Boolean, default: false },

    // Roles
    roles: {
      type: [String],
      enum: ["user", "tutor", "student", "admin"],
      default: ["user"],
    },

    // Common Profile Fields
    name: { type: String, required: true, trim: true },
    profileImage: { type: String },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dateOfBirth: { type: Date },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    about: { type: String, trim: true },
    languages: { type: [String], default: [] },
    profileStatus: { type: Boolean, default: false },

    // Activity Tracking
    registrationDate: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    lastSeen: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },

    // Role-specific Profiles
    studentProfile: { type: StudentProfileSchema, default: {} },
    tutorProfile: { type: TutorProfileSchema, default: {} },

    // Wallet
    wallet: {
      availableBalance: { type: Number, default: 0, min: 0 },
      escrowBalance: { type: Number, default: 0, min: 0 },
      totalEarnings: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "BDT" },
      bankDetails: {
        accountName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        bankName: { type: String, trim: true },
        branchName: { type: String, trim: true },
        routingNumber: { type: String, trim: true },
      },
      withdrawalHistory: [
        {
          amount: { type: Number, min: 0 },
          status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
          },
          requestedAt: { type: Date },
          completedAt: { type: Date },
          transactionId: { type: String, trim: true },
        },
      ],
    },

    // Public stats
    publicStats: {
      totalProjects: { type: Number, default: 0, min: 0 },
      completedProjects: { type: Number, default: 0, min: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0, min: 0 },
      responseTime: { type: Number, default: 0, min: 0 },
      successRate: { type: Number, default: 0, min: 0, max: 100 },
      joinedDate: { type: Date, default: Date.now },
    },

    // Onboarding Status
    onboardingStatus: {
      type: String,
      enum: [
        "pending",
        "completed",
        "incomplete",
        "under_review",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    // Admin Control
    adminPrivileges: {
      canManageUsers: { type: Boolean, default: false },
      canManagePayments: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: [
        "active",
        "suspended",
        "banned",
        "pending",
        "under_review",
        "approved",
        "rejected",
      ],
      default: "active",
    },
    suspendedUntil: { type: Date },
  },
  { timestamps: true }
);

// Indexes for better query performance
userSchema.index({ roles: 1 });
userSchema.index({ status: 1 });
userSchema.index({ onboardingStatus: 1 });
userSchema.index({ "publicStats.averageRating": -1 });

// Middleware: Update lastSeen on any modification
userSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastSeen = new Date();
  }
  next();
});

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
