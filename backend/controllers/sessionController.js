import SessionModel from "../models/Session.js";
import UserModel from "../models/User.js";
import ChatModel from "../models/Chat.js";
import TransactionModel from "../models/Transaction.js";
import mongoose from "mongoose";
import { initiateSessionCheckout } from "./sessionPaymentController.js";

const isTutorApproved = (tutor) => {
  if (!tutor) return false;
  if (typeof tutor.accountStatus === "string") {
    return tutor.accountStatus.trim().toUpperCase() === "APPROVED";
  }
  const approvedOnboarding = ["approved", "completed"].includes(
    tutor.onboardingStatus
  );
  const activeStatus = ["active", "approved"].includes(tutor.status);
  return approvedOnboarding && activeStatus;
};

class SessionController {
  static getUpcomingSessions = async (req, res) => {
    try {
      const userId = req.user._id;
      const now = new Date();

      const sessions = await SessionModel.find({
        $or: [{ tutor: userId }, { student: userId }],
      })
        .select("tutor student scheduledTime duration subject status")
        .populate("tutor", "name")
        .populate("student", "name")
        .sort({ scheduledTime: 1 })
        .lean();

      const data = sessions.map((session) => ({
        id: session._id,
        tutorId: session.tutor?._id,
        studentId: session.student?._id,
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

  static bookSession = async (req, res) => {
    try {
      const studentId = req.user._id;
      const { tutorId, date, slot, subject } = req.body;

      if (!tutorId || !mongoose.Types.ObjectId.isValid(tutorId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid tutor ID",
          code: "INVALID_TUTOR_ID",
        });
      }

      if (studentId.toString() === tutorId.toString()) {
        return res.status(400).json({
          success: false,
          error: "You cannot book an appointment with yourself",
          code: "SELF_BOOKING_PROHIBITED",
        });
      }

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          error: "Valid date parameter in YYYY-MM-DD format is required",
          code: "INVALID_DATE",
        });
      }

      if (!slot || !/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.test(slot)) {
        return res.status(400).json({
          success: false,
          error: "Valid slot format (HH:MM-HH:MM) is required",
          code: "INVALID_SLOT",
        });
      }

      if (!subject || typeof subject !== "string" || !subject.trim()) {
        return res.status(400).json({
          success: false,
          error: "Subject description is required",
          code: "SUBJECT_REQUIRED",
        });
      }

      const match = slot.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
      const sh = Number(match[1]);
      const sm = Number(match[2]);
      const eh = Number(match[3]);
      const em = Number(match[4]);

      const scheduledTime = new Date(date);
      scheduledTime.setHours(sh, sm, 0, 0);

      if (scheduledTime < new Date()) {
        return res.status(400).json({
          success: false,
          error: "You cannot book an appointment for a past date or time slot",
          code: "PAST_SLOT_BOOKING_PROHIBITED",
        });
      }

      const endTime = new Date(date);
      endTime.setHours(eh, em, 0, 0);

      const duration = (endTime - scheduledTime) / (60 * 1000);
      if (duration <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid slot time range",
          code: "INVALID_SLOT_RANGE",
        });
      }

      // Check if tutor exists and is approved
      const tutor = await UserModel.findOne({ _id: tutorId, roles: "tutor" })
        .select("tutorProfile status onboardingStatus name")
        .lean();

      if (!tutor || !isTutorApproved(tutor)) {
        return res.status(404).json({
          success: false,
          error: "Tutor not found or inactive",
          code: "TUTOR_NOT_FOUND",
        });
      }

      const tutorProfile = tutor.tutorProfile || {};
      const {
        availableDays = [],
        availableTimeSlots = [],
        offdays = [],
        hourlyRate = 0,
        halfHourlyRate = hourlyRate / 2,
      } = tutorProfile;

      // Validate date is not offday
      if (offdays.includes(date)) {
        return res.status(400).json({
          success: false,
          error: "Tutor is away/off on this date",
          code: "TUTOR_AWAY",
        });
      }

      // Validate weekday availability
      const weekdayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayOfWeek = weekdayNames[scheduledTime.getDay()];

      if (!availableDays.includes(dayOfWeek)) {
        return res.status(400).json({
          success: false,
          error: "Tutor does not offer sessions on this day",
          code: "DAY_NOT_AVAILABLE",
        });
      }

      // Validate slot is configured by tutor
      const daySlotsEntry = availableTimeSlots.find(
        (entry) =>
          entry &&
          typeof entry.day === "string" &&
          entry.day.trim() === dayOfWeek
      );
      const configuredSlots =
        daySlotsEntry && Array.isArray(daySlotsEntry.slots)
          ? daySlotsEntry.slots
          : [];

      if (!configuredSlots.includes(slot)) {
        return res.status(400).json({
          success: false,
          error: "Tutor is not available during this time slot",
          code: "SLOT_NOT_AVAILABLE",
        });
      }

      // Check if slot already booked
      const existingSession = await SessionModel.findOne({
        tutor: tutorId,
        slot: slot,
        scheduledTime: scheduledTime,
        status: { $ne: "cancelled" },
      });

      if (existingSession) {
        return res.status(400).json({
          success: false,
          error: "This slot has already been booked by another student",
          code: "SLOT_ALREADY_BOOKED",
        });
      }

      const billingType = duration <= 30 ? "half_hourly" : "hourly";
      const price = duration <= 30 ? (halfHourlyRate || hourlyRate / 2) : hourlyRate;

      if (!price || price <= 0) {
        return res.status(400).json({
          success: false,
          error: "This tutor has not configured a valid rate for this slot",
          code: "INVALID_PRICE",
        });
      }

      const student = await UserModel.findById(studentId).select("name");
      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Student account not found",
          code: "STUDENT_NOT_FOUND",
        });
      }

      let chat = await ChatModel.findOne({
        type: "direct",
        "participants.user": { $all: [studentId, tutorId] },
        isActive: true,
      });

      if (chat) {
        chat.lastActivity = new Date();
      } else {
        chat = new ChatModel({
          name: `${student.name} & ${tutor.name}`,
          type: "direct",
          participants: [
            { user: studentId, role: "member" },
            { user: tutorId, role: "member" },
          ],
          createdBy: studentId,
          isActive: true,
          lastActivity: new Date(),
        });
      }

      const newSession = new SessionModel({
        tutor: tutorId,
        student: studentId,
        subject,
        scheduledTime,
        endTime,
        duration,
        slot,
        price,
        billingType,
        chat: chat._id,
        status: "pending_payment",
        paymentStatus: "pending",
      });

      chat.session = newSession._id;
      await chat.save();
      await newSession.save();

      let checkout;
      try {
        checkout = await initiateSessionCheckout(newSession, req);
      } catch (checkoutError) {
        await SessionModel.deleteOne({ _id: newSession._id });
        return res.status(502).json({
          success: false,
          error: checkoutError?.message || "Unable to initialize payment",
          code: "CHECKOUT_FAILED",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Session reserved. Complete payment to confirm.",
        data: {
          sessionId: newSession._id,
          chatId: chat._id,
          price,
          scheduledTime,
          slot,
          checkoutUrl: checkout.checkoutUrl,
          invoiceId: checkout.invoiceId,
          currency: checkout.currency,
          paymentStatus: "pending",
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to complete booking",
        code: "SERVER_ERROR",
      });
    }
  };

  static modifySession = async (req, res) => {
    try {
      const studentId = req.user._id;
      const { id } = req.params;
      const { date, slot } = req.body;

      const session = await SessionModel.findOne({ _id: id, student: studentId });
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, error: "Valid date parameter in YYYY-MM-DD format is required" });
      }

      if (!slot || !/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.test(slot)) {
        return res.status(400).json({ success: false, error: "Valid slot format (HH:MM-HH:MM) is required" });
      }

      const match = slot.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
      const sh = Number(match[1]);
      const sm = Number(match[2]);
      const eh = Number(match[3]);
      const em = Number(match[4]);

      const scheduledTime = new Date(date);
      scheduledTime.setHours(sh, sm, 0, 0);

      if (scheduledTime < new Date()) {
        return res.status(400).json({ success: false, error: "You cannot book an appointment for a past date or time slot" });
      }

      const endTime = new Date(date);
      endTime.setHours(eh, em, 0, 0);

      const duration = (endTime - scheduledTime) / (60 * 1000);
      if (duration <= 0) {
        return res.status(400).json({ success: false, error: "Invalid slot time range" });
      }

      const tutorId = session.tutor;
      const tutor = await UserModel.findOne({ _id: tutorId, roles: "tutor" }).select("tutorProfile status onboardingStatus name").lean();

      if (!tutor || !isTutorApproved(tutor)) {
        return res.status(404).json({ success: false, error: "Tutor not found or inactive" });
      }

      const tutorProfile = tutor.tutorProfile || {};
      const { availableDays = [], availableTimeSlots = [], offdays = [] } = tutorProfile;

      if (offdays.includes(date)) {
        return res.status(400).json({ success: false, error: "Tutor is away/off on this date" });
      }

      const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = weekdayNames[scheduledTime.getDay()];

      if (!availableDays.includes(dayOfWeek)) {
        return res.status(400).json({ success: false, error: "Tutor does not offer sessions on this day" });
      }

      const daySlotsEntry = availableTimeSlots.find((entry) => entry && typeof entry.day === "string" && entry.day.trim() === dayOfWeek);
      const configuredSlots = daySlotsEntry && Array.isArray(daySlotsEntry.slots) ? daySlotsEntry.slots : [];

      if (!configuredSlots.includes(slot)) {
        return res.status(400).json({ success: false, error: "Tutor is not available during this time slot" });
      }

      const existingSession = await SessionModel.findOne({
        _id: { $ne: id },
        tutor: tutorId,
        slot: slot,
        scheduledTime: scheduledTime,
        status: { $ne: "cancelled" },
      });

      if (existingSession) {
        return res.status(400).json({ success: false, error: "This slot has already been booked by another student" });
      }

      session.scheduledTime = scheduledTime;
      session.endTime = endTime;
      session.slot = slot;
      session.duration = duration;
      
      await session.save();

      if (session.chat) {
        await ChatModel.updateOne({ _id: session.chat }, { $set: { isLockedUntil: scheduledTime } });
      }

      return res.status(200).json({
        success: true,
        message: "Session modified successfully!",
        data: { sessionId: session._id, scheduledTime, slot },
      });
    } catch (error) {
      console.error("Modify session error:", error);
      return res.status(500).json({ success: false, error: "Unable to modify session" });
    }
  };
}

export default SessionController;
