import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        "BAN_USER",
        "UNBAN_USER",
        "APPROVE_TUTOR",
        "REJECT_TUTOR",
        "DEMOTE_TUTOR",
        "DELETE_ASSIGNMENT",
        "FORCE_CANCEL_ASSIGNMENT",
        "PROCESS_WITHDRAWAL",
        "RESOLVE_DISPUTE_REFUND",
        "RESOLVE_DISPUTE_RELEASE",
        "RESOLVE_DISPUTE_SPLIT",
      ],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    targetType: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

adminLogSchema.index({ adminId: 1, timestamp: -1 });
adminLogSchema.index({ targetId: 1 });

const AdminLogModel = mongoose.model("adminLog", adminLogSchema);

export default AdminLogModel;
