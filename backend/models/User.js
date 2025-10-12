import mongoose from "mongoose";

const SocialLinksSchema = new mongoose.Schema({
    facebook: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    website: { type: String },
}, { _id: false });

const StudentProfileSchema = new mongoose.Schema({
    institutionName: { type: String },
    institutionType: { type: String, enum: ["College", "University", "High School", "Other"] },
    department: { type: String },
    degree: { type: String },
    yearOfStudy: { type: String },
    studentID: { type: String },
    cgpa: { type: String },
    interests: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    guardianContact: { type: String },
    documents: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String
    }]
}, { _id: false });

const TutorProfileSchema = new mongoose.Schema({
    professionalTitle: { type: String },
    qualification: { type: String },
    expertiseSubjects: { type: [String], default: [] },
    experienceYears: { type: Number },
    currentInstitution: { type: String },
    availableDays: { type: [String], default: [] },
    availableTimeSlots: { type: [String], default: [] },
    hourlyRate: { type: Number },
    teachingMode: { type: String, enum: ["Online", "Offline", "Hybrid"] },
    achievements: { type: String },
    documents: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String
    }],
    verificationStatus: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" }
}, { _id: false });

const userSchema = new mongoose.Schema({
    // Existing fields
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    is_verified: { type: Boolean, default: false },
    roles: { type: [String], enum: ["user", "tutor", "admin"], default: ["user"] },
  
    // New fields based on your provided structure
    // Common Profile fields
    avatar: { type: String }, // Legacy avatar URL
    profileImage: { type: String }, // Prefer this in new UI
    fullName: { type: String },
    phone: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dateOfBirth: { type: Date },
    country: { type: String },
    city: { type: String },
    address: { type: String },
    about: { type: String },
    socialLinks: { type: SocialLinksSchema, default: {} },
    languages: { type: [String], default: [] },
    profileStatus: { type: Boolean, default: false },

    // Legacy activity fields
    registrationDate: { type: Date, default: Date.now }, // Date of registration
    lastLogin: { type: Date }, // Last login timestamp
    lastSeen: { type: Date, default: Date.now }, // Last activity timestamp
    isActive: { type: Boolean, default: true }, // Online/offline status
    
    // Student profile subdocument
    studentProfile: { type: StudentProfileSchema, default: {} },
    onboardingStatus: { type: String, enum: ["pending", "completed", "incomplete", "under_review", "approved", "rejected"], default: "pending" },
    
    // Tutor profile subdocument (keeping legacy fields for compatibility)
    tutorProfile: { type: TutorProfileSchema, default: {} },
    subjects: { type: [String], default: [] }, // Legacy: subjects the tutor teaches
    bio: { type: String }, // Legacy tutor biography
    experience: { type: Number }, // Legacy years of experience
    hourlyRate: { type: Number }, // Legacy hourly rate
    availability: {
        monday: { type: [String], default: [] },
        tuesday: { type: [String], default: [] },
        wednesday: { type: [String], default: [] },
        thursday: { type: [String], default: [] },
        friday: { type: [String], default: [] },
        saturday: { type: [String], default: [] },
        sunday: { type: [String], default: [] }
    },
    
    // Admin-specific fields (only if role = 'admin')
    adminPrivileges: {
        canManageUsers: { type: Boolean, default: false },
        canManagePayments: { type: Boolean, default: false },
        canViewAnalytics: { type: Boolean, default: false },
    },
  
    // Status control for admins
    status: { type: String, enum: ["active", "suspended", "banned", "pending", "under_review", "approved", "rejected"], default: "active" },
    suspendedUntil: { type: Date },
});

// Update lastSeen on any user activity
userSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastSeen = new Date();
    }
    next();
});


const UserModel = mongoose.model("user", userSchema)

export default UserModel