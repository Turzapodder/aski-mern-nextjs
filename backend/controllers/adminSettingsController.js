import PlatformSettingsModel from "../models/PlatformSettings.js";
import AdminLogModel from "../models/AdminLog.js";

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const ensureSettings = async () => {
  const existing = await PlatformSettingsModel.findOne().lean();
  if (existing) return existing;
  const created = await PlatformSettingsModel.create({});
  return created.toObject();
};

class AdminSettingsController {
  static getSettings = async (req, res) => {
    try {
      const settings = await ensureSettings();
      return res.status(200).json({
        status: "success",
        data: settings,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to load settings",
      });
    }
  };

  static updateSettings = async (req, res) => {
    try {
      const {
        platformFeeRate,
        minTransactionFee,
        announcement,
        maintenance,
        registration,
      } = req.body || {};

      const update = {};

      if (platformFeeRate !== undefined) {
        const parsed = parseNumber(platformFeeRate, NaN);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
          return res.status(400).json({
            status: "failed",
            message: "Platform fee rate must be between 0 and 1",
          });
        }
        update.platformFeeRate = parsed;
      }

      if (minTransactionFee !== undefined) {
        const parsed = parseNumber(minTransactionFee, NaN);
        if (!Number.isFinite(parsed) || parsed < 0) {
          return res.status(400).json({
            status: "failed",
            message: "Minimum transaction fee must be 0 or higher",
          });
        }
        update.minTransactionFee = parsed;
      }

      if (announcement && typeof announcement === "object") {
        if ("message" in announcement) {
          const message = sanitizeText(announcement.message);
          update["announcement.message"] = message || undefined;
        }
        if ("expiresAt" in announcement) {
          update["announcement.expiresAt"] = announcement.expiresAt
            ? new Date(announcement.expiresAt)
            : undefined;
        }
        if ("isActive" in announcement) {
          update["announcement.isActive"] = Boolean(announcement.isActive);
        }
      }

      if (maintenance && typeof maintenance === "object") {
        if ("enabled" in maintenance) {
          update["maintenance.enabled"] = Boolean(maintenance.enabled);
        }
        if ("scheduledFor" in maintenance) {
          update["maintenance.scheduledFor"] = maintenance.scheduledFor
            ? new Date(maintenance.scheduledFor)
            : undefined;
        }
        if ("message" in maintenance) {
          update["maintenance.message"] = sanitizeText(maintenance.message);
        }
      }

      if (registration && typeof registration === "object") {
        if ("disabled" in registration) {
          update["registration.disabled"] = Boolean(registration.disabled);
        }
        if ("reason" in registration) {
          update["registration.reason"] = sanitizeText(registration.reason);
        }
      }

      update.updatedBy = req.user._id;

      const settings = await PlatformSettingsModel.findOneAndUpdate(
        {},
        { $set: update },
        { new: true, upsert: true }
      ).lean();

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "UPDATE_SETTINGS",
        targetId: settings?._id,
        targetType: "PlatformSettings",
        metadata: {
          platformFeeRate: settings?.platformFeeRate,
          minTransactionFee: settings?.minTransactionFee,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Settings updated successfully",
        data: settings,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to update settings",
      });
    }
  };
}

export default AdminSettingsController;
