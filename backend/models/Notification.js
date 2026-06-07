import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    link: {
      type: String,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Post-save hook to send email automatically when a notification is created
notificationSchema.post("save", async function (doc, next) {
  // Only send email for newly created notifications, not updates
  if (!this.$isNew) {
    return next();
  }
  
  try {
    const UserModel = mongoose.model("user");
    const user = await UserModel.findById(doc.user).select("email name").lean();
    if (user && user.email) {
      const sendNotificationEmail = (await import("../utils/sendNotificationEmail.js")).default;
      await sendNotificationEmail(
        user.email,
        user.name,
        doc.title,
        doc.message,
        doc.link
      );
    }
  } catch (error) {
    console.error("Failed to send notification email in post-save hook:", error);
  }
  next();
});

const NotificationModel = mongoose.model("notification", notificationSchema);

export default NotificationModel;
