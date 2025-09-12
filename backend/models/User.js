import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Existing fields
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    is_verified: { type: Boolean, default: false },
    roles: { type: [String], enum: ["user", "tutor", "admin"], default: ["user"] },
  
    // New fields based on your provided structure
    avatar: { type: String }, // URL for user's avatar
    registrationDate: { type: Date, default: Date.now }, // Date of registration
    lastLogin: { type: Date }, // Last login timestamp
    lastSeen: { type: Date, default: Date.now }, // Last activity timestamp
    isActive: { type: Boolean, default: true }, // Online/offline status
    
    // Student-specific fields
    institution: { type: String }, // Only for students
    class: { type: String }, // Only for students
    age: { type: Number }, // Only for students
    onboardingStatus: { type: String, enum: ["pending", "completed"], default: "pending" }, // Only for students
    
    // Tutor-specific fields
    subjects: { type: [String], default: [] }, // Subjects the tutor teaches
    bio: { type: String }, // Tutor biography
    experience: { type: Number }, // Years of experience
    hourlyRate: { type: Number }, // Hourly rate for tutoring
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
    status: { type: String, enum: ["active", "suspended", "banned"], default: "active" },
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