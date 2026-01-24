import NotificationModel from "../models/Notification.js";
import mongoose from "mongoose";

class NotificationController {
  static getMyNotifications = async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      const numericLimit = Math.min(parseInt(limit, 10) || 20, 50);
      const skip = (parseInt(page, 10) - 1) * numericLimit;

      const [notifications, unreadCount, total] = await Promise.all([
        NotificationModel.find({ user: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(numericLimit)
          .lean(),
        NotificationModel.countDocuments({ user: userId, isRead: false }),
        NotificationModel.countDocuments({ user: userId }),
      ]);

      res.status(200).json({
        status: "success",
        data: {
          notifications,
          unreadCount,
          pagination: {
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(total / numericLimit),
            totalItems: total,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to fetch notifications",
        error: error.message,
      });
    }
  };

  static markAsRead = async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid notification ID",
        });
      }

      const notification = await NotificationModel.findOneAndUpdate(
        { _id: id, user: userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          status: "failed",
          message: "Notification not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: notification,
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to update notification",
        error: error.message,
      });
    }
  };

  static markAllRead = async (req, res) => {
    try {
      const userId = req.user._id;
      await NotificationModel.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
      );

      res.status(200).json({
        status: "success",
        message: "Notifications marked as read",
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to update notifications",
        error: error.message,
      });
    }
  };
}

export default NotificationController;
