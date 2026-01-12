import SessionModel from "../models/Session.js";

class SessionController {
  static getUpcomingSessions = async (req, res) => {
    try {
      const userId = req.user._id;
      const now = new Date();

      const sessions = await SessionModel.find({
        scheduledTime: { $gt: now },
        $or: [{ tutor: userId }, { student: userId }],
      })
        .select("tutor student scheduledTime duration subject status")
        .populate("tutor", "name")
        .populate("student", "name")
        .sort({ scheduledTime: 1 })
        .lean();

      const data = sessions.map((session) => ({
        id: session._id,
        tutorName: session.tutor?.name || "",
        studentName: session.student?.name || "",
        scheduledTime: session.scheduledTime,
        duration: session.duration,
        subject: session.subject,
        status: session.status,
      }));

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Unable to fetch sessions",
        code: "SERVER_ERROR",
      });
    }
  };
}

export default SessionController;
