import cron from 'node-cron';
import AssignmentModel from '../models/Assignment.js';
import NotificationModel from '../models/Notification.js';
import UserModel from '../models/User.js';
import logger from '../utils/logger.js';

/** Grace period (in hours) after the deadline before the student can cancel */
const GRACE_PERIOD_HOURS = 24;

/**
 * Statuses that should transition to "overdue" once the deadline passes.
 * Assignments in these statuses are considered actively being worked on
 * (or waiting for work to begin) and haven't been submitted/completed yet.
 */
const OVERDUE_ELIGIBLE_STATUSES = [
  'in_progress',
  'submission_pending',
  'revision_requested',
  'assigned',
  'proposal_accepted',
];

/**
 * Mark assignments whose deadline has passed as overdue.
 * Sends real-time notifications to both the student and tutor.
 */
const markOverdueAssignments = async (socketManager) => {
  try {
    const now = new Date();

    const overdueAssignments = await AssignmentModel.find({
      isActive: true,
      deadline: { $lt: now },
      status: { $in: OVERDUE_ELIGIBLE_STATUSES },
    })
      .populate('student', 'name email')
      .populate('assignedTutor', 'name email');

    if (overdueAssignments.length === 0) return;

    logger.info(
      `⏰ Overdue cron: found ${overdueAssignments.length} assignment(s) past deadline`
    );

    for (const assignment of overdueAssignments) {
      const gracePeriodEnd = new Date(
        assignment.deadline.getTime() + GRACE_PERIOD_HOURS * 60 * 60 * 1000
      );

      assignment.status = 'overdue';
      assignment.overdueMarkedAt = now;
      assignment.gracePeriodEndsAt = gracePeriodEnd;
      await assignment.save();

      // ── Notify Tutor ──────────────────────────────────────────────
      if (assignment.assignedTutor) {
        const tutorNotification = await NotificationModel.create({
          user: assignment.assignedTutor._id,
          type: 'assignment_overdue',
          title: 'Assignment overdue',
          message: `Your assignment "${assignment.title}" is past its deadline. Please submit your work as soon as possible to avoid cancellation.`,
          link: `/user/assignments/view-details/${assignment._id}`,
          data: { assignmentId: assignment._id },
        });

        if (socketManager) {
          socketManager.emitToUser(
            String(assignment.assignedTutor._id),
            'notification',
            { notification: tutorNotification }
          );
        }
      }

      // ── Notify Student ─────────────────────────────────────────────
      if (assignment.student) {
        const studentNotification = await NotificationModel.create({
          user: assignment.student._id,
          type: 'assignment_overdue',
          title: 'Assignment overdue',
          message: `Your assignment "${assignment.title}" is past its deadline. You can extend the deadline or cancel for a refund.`,
          link: `/user/assignments/view-details/${assignment._id}`,
          data: { assignmentId: assignment._id },
        });

        if (socketManager) {
          socketManager.emitToUser(
            String(assignment.student._id),
            'notification',
            { notification: studentNotification }
          );
        }
      }

      logger.info(
        `  → Marked assignment "${assignment.title}" (${assignment._id}) as overdue`
      );
    }
  } catch (error) {
    logger.error('⏰ Overdue cron error:', error);
  }
};

/**
 * Recalculate a tutor's on-time delivery rate.
 * Formula: (completedOnTime / totalCompleted) * 100
 */
export const recalculateTutorDeliveryRate = async (tutorId) => {
  try {
    const completedAssignments = await AssignmentModel.countDocuments({
      assignedTutor: tutorId,
      status: 'completed',
      isActive: true,
    });

    if (completedAssignments === 0) return;

    // Assignments completed where overdueMarkedAt was set (i.e. they were late)
    const lateCompletions = await AssignmentModel.countDocuments({
      assignedTutor: tutorId,
      status: 'completed',
      isActive: true,
      overdueMarkedAt: { $ne: null },
    });

    const onTimeRate = Math.round(
      ((completedAssignments - lateCompletions) / completedAssignments) * 100
    );

    await UserModel.updateOne(
      { _id: tutorId },
      { $set: { 'publicStats.onTimeDeliveryRate': onTimeRate } }
    );

    logger.info(
      `📊 Updated tutor ${tutorId} on-time delivery rate: ${onTimeRate}%`
    );
  } catch (error) {
    logger.error(`📊 Error recalculating delivery rate for ${tutorId}:`, error);
  }
};

/**
 * Start the overdue assignment cron job.
 * Runs every 15 minutes.
 */
export const startOverdueCron = (socketManager) => {
  // Run every 15 minutes: "*/15 * * * *"
  cron.schedule('*/15 * * * *', () => {
    markOverdueAssignments(socketManager);
  });

  logger.info('⏰ Overdue assignment cron job started (every 15 minutes)');

  // Also run once immediately on startup after a short delay
  setTimeout(() => {
    markOverdueAssignments(socketManager);
  }, 10000);
};
