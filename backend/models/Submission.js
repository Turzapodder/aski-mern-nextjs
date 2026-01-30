import mongoose from "mongoose";

const submissionFileSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const submissionLinkSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    label: { type: String, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const submissionReviewSchema = new mongoose.Schema(
  {
    stars: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
    },
    reviewedAt: Date,
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    submissionFiles: [submissionFileSchema],
    submissionLinks: [submissionLinkSchema],
    submissionNotes: {
      type: String,
      trim: true,
    },
    revisionIndex: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "completed", "revision_requested"],
      default: "submitted",
    },
    review: submissionReviewSchema,
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, createdAt: -1 });

const SubmissionModel = mongoose.model("Submission", submissionSchema);

export default SubmissionModel;
