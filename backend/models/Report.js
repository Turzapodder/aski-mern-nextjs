import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reporterType: {
      type: String,
      enum: ["user", "tutor"],
      required: true,
    },
    reportedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reportedType: {
      type: String,
      enum: ["assignment", "tutorProfile", "userProfile"],
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "actioned"],
      default: "pending",
    },
    reviewedAt: {
      type: Date,
    },
    adminAction: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ reportedId: 1 });
reportSchema.index({ reportedType: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

const ReportModel = mongoose.model("Report", reportSchema);

export default ReportModel;
