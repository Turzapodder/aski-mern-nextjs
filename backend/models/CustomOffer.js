import mongoose from "mongoose";

const customOfferSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    proposedBudget: {
      type: Number,
      required: true,
      min: 1,
    },
    proposedDeadline: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

customOfferSchema.index({ conversation: 1, status: 1 });
customOfferSchema.index({ assignment: 1 });
customOfferSchema.index({ tutor: 1 });
customOfferSchema.index({ student: 1 });
customOfferSchema.index({ expiresAt: 1 });

const CustomOfferModel = mongoose.model("CustomOffer", customOfferSchema);

export default CustomOfferModel;
