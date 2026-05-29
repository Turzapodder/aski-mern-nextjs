import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
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
    subject: { type: String, trim: true, required: true },
    scheduledTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, min: 1, required: true },
    slot: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    billingType: {
      type: String,
      enum: ["hourly", "half_hourly"],
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

sessionSchema.index({ tutor: 1, scheduledTime: 1 });
sessionSchema.index({ student: 1, scheduledTime: 1 });
sessionSchema.index({ scheduledTime: 1 });

const SessionModel = mongoose.model("Session", sessionSchema);

export default SessionModel;
