import { isRejectedWithValue, isFulfilled, Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

/**
 * Endpoints that should NOT trigger toasts (silent operations).
 * Queries and background fetches are excluded by default since the middleware
 * only fires for fulfilled/rejected mutations.
 */
const SILENT_ENDPOINTS = new Set([
  // Auth endpoints that handle their own UI (success message in component)
  "getMe",
  "getUser",
  // Background operations
  "convertFormToAssignment",
  "generateSessionId",
  "getLatestSubmissionStatusByAssignments",
  // Chat - sending messages is silent (message appears in chat)
  "sendMessage",
  "sendFileMessage",
  "markMessageAsRead",
  // Notifications - silent background ops
  "markNotificationRead",
  "markAllRead",
]);

/**
 * Map endpoint names to friendly success messages.
 * If an endpoint isn't listed here, we fall back to the server's `message` field.
 */
const SUCCESS_MESSAGES: Record<string, string> = {
  // Auth
  loginUser: "Login successful",
  createUser: "Account created successfully",
  verifyEmail: "Email verified successfully",
  logoutUser: "Logged out successfully",
  resetPasswordLink: "Password reset link sent to your email",
  resetPassword: "Password reset successfully",
  changePassword: "Password changed successfully",
  updateUser: "Profile updated",

  // Assignments
  createAssignment: "Assignment created",
  updateAssignment: "Assignment updated",
  deleteAssignment: "Assignment deleted",
  submitAssignmentSolution: "Solution submitted",
  assignTutor: "Tutor assigned",
  submitFeedback: "Feedback submitted",
  processPayment: "Payment initiated",
  requestRevision: "Revision requested",

  // Proposals
  createProposal: "Proposal sent",
  updateProposal: "Proposal updated",
  acceptProposal: "Proposal accepted",
  rejectProposal: "Proposal rejected",
  withdrawProposal: "Proposal withdrawn",
  deleteProposal: "Proposal deleted",

  // Submissions
  markSubmissionUnderReview: "Submission marked as under review",

  // Student
  saveStudentForm: "Form saved",

  // Profile
  updateProfile: "Profile updated",
  uploadFiles: "Files uploaded",

  // Custom offers
  createOffer: "Offer sent",
  acceptOffer: "Offer accepted",
  declineOffer: "Offer declined",

  // Reports
  createReport: "Report submitted",

  // Chat
  createChat: "Chat created",
  editMessage: "Message updated",
  deleteMessage: "Message deleted",
  leaveChat: "Chat removed",

  // Quiz
  generateQuiz: "Quiz generated",
};

/**
 * RTK Query middleware that automatically shows Sonner toasts
 * for mutation successes and failures.
 */
export const rtkToastMiddleware: Middleware = () => (next) => (action: any) => {
  // Handle successful mutations
  if (isFulfilled(action)) {
    const endpointName = action.meta?.arg?.endpointName;
    if (!endpointName || SILENT_ENDPOINTS.has(endpointName)) {
      return next(action);
    }

    // Only toast mutations (not queries)
    const type = action.meta?.arg?.type;
    if (type !== "mutation") {
      return next(action);
    }

    const serverMessage = action.payload?.message;
    const friendlyMessage = SUCCESS_MESSAGES[endpointName] || serverMessage;

    if (friendlyMessage) {
      toast.success(friendlyMessage);
    }
  }

  // Handle failed mutations
  if (isRejectedWithValue(action)) {
    const endpointName = action.meta?.arg?.endpointName;
    if (!endpointName || SILENT_ENDPOINTS.has(endpointName)) {
      return next(action);
    }

    const type = action.meta?.arg?.type;
    if (type !== "mutation") {
      return next(action);
    }

    const errorData = action.payload as any;
    const errorMessage =
      errorData?.data?.message ||
      errorData?.error ||
      "Something went wrong. Please try again.";

    toast.error(errorMessage);
  }

  return next(action);
};
