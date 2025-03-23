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
    // Student-specific fields
    university: { type: String }, // Only for students
  
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


const UserModel = mongoose.model("user", userSchema)

export default UserModel