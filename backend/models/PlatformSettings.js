import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    platformFeeRate: { type: Number, default: 0.1, min: 0, max: 1 },
    minTransactionFee: { type: Number, default: 0, min: 0 },
    announcement: {
      message: { type: String, trim: true },
      expiresAt: { type: Date },
      isActive: { type: Boolean, default: false },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      scheduledFor: { type: Date },
      message: { type: String, trim: true },
    },
    registration: {
      disabled: { type: Boolean, default: false },
      reason: { type: String, trim: true },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const PlatformSettingsModel = mongoose.model(
  "platformSettings",
  platformSettingsSchema
);

export default PlatformSettingsModel;
