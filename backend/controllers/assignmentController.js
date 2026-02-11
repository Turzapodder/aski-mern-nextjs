import AssignmentModel from '../models/Assignment.js';
import SubmissionModel from '../models/Submission.js';
import UserModel from '../models/User.js';
import ProposalModel from '../models/Proposal.js';
import NotificationModel from '../models/Notification.js';
import TransactionModel from "../models/Transaction.js";
import PlatformSettingsModel from "../models/PlatformSettings.js";
import mongoose from 'mongoose';
import {
  createUddoktaCheckout,
  extractInvoiceIdFromValue,
  isSuccessfulCheckoutResponse,
  isUddoktaConfigured,
  isValidUddoktaWebhookRequest,
  normalizePaymentStatus,
  verifyUddoktaPayment,
} from "../utils/uddoktaPay.js";

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

const isLocalHostValue = (value = "") =>
  /(^https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(sanitizeText(value));

const getConfiguredPaymentCurrency = (preferredCurrency) => {
  const envCurrency = sanitizeText(
    process.env.UDDOKTAPAY_CURRENCY || process.env.PAYMENT_CURRENCY
  );
  const requested = sanitizeText(preferredCurrency);
  const candidate = (envCurrency || requested || "BDT").toUpperCase();
  return /^[A-Z]{3}$/.test(candidate) ? candidate : "BDT";
};

const getDefaultPlatformFeeRate = () => {
  const parsed = parseNumber(process.env.PLATFORM_FEE_RATE, NaN);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0;
};

const getDefaultMinTransactionFee = () => {
  const parsed = parseNumber(process.env.MIN_TRANSACTION_FEE, NaN);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const normalizeSubmissionLinks = (raw) => {
  if (!raw) return [];
  const rawLinks = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];

  return rawLinks
    .map((entry) => {
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        return { url: trimmed, label: "" };
      }
      if (entry && typeof entry === "object") {
        return {
          url: sanitizeText(entry.url),
          label: sanitizeText(entry.label),
        };
      }
      return null;
    })
    .filter((entry) => entry && isValidUrl(entry.url))
    .map((entry) => ({
      url: entry.url,
      label: entry.label || "",
      addedAt: new Date(),
    }));
};

const getFrontendBaseUrl = () => {
  const value = sanitizeText(process.env.FRONTEND_HOST || "");
  if (!value) return "http://localhost:3000";
  return value.replace(/\/+$/, "");
};

const getBackendBaseUrl = (req) => {
  const configured = sanitizeText(process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_HOST || "");
  const forwardedProto = sanitizeText(req.headers["x-forwarded-proto"]);
  const protocol = forwardedProto || req.protocol || "http";
  const host = sanitizeText(req.get("host"));
  const inferred = host ? `${protocol}://${host}` : "";

  // If env is left at localhost but request comes from a public host, use request host.
  if (configured) {
    if (isLocalHostValue(configured) && inferred && !isLocalHostValue(inferred)) {
      return inferred.replace(/\/+$/, "");
    }
    return configured.replace(/\/+$/, "");
  }

  return inferred ? inferred.replace(/\/+$/, "") : "http://localhost:8000";
};

const buildAssignmentRedirectUrl = ({ assignmentId, paymentState, invoiceId }) => {
  const frontendBaseUrl = getFrontendBaseUrl();
  const path = assignmentId
    ? `/user/assignments/view-details/${assignmentId}`
    : "/user/assignments";
  const url = new URL(`${frontendBaseUrl}${path}`);
  if (paymentState) {
    url.searchParams.set("payment", paymentState);
  }
  if (invoiceId) {
    url.searchParams.set("invoice_id", invoiceId);
  }
  return url.toString();
};

const sanitizePaymentSnapshot = (verifyData = {}) => ({
  status: sanitizeText(verifyData.status),
  amount: parseNumber(verifyData.amount, 0),
  fee: parseNumber(verifyData.fee, 0),
  chargedAmount: parseNumber(verifyData.charged_amount, 0),
  transactionId: sanitizeText(verifyData.transaction_id),
  paymentMethod: sanitizeText(verifyData.payment_method),
  senderNumber: sanitizeText(verifyData.sender_number),
  date: sanitizeText(verifyData.date),
});

const findAssignmentIdByInvoiceId = async (invoiceId) => {
  if (!invoiceId) return "";

  const assignmentByGateway = await AssignmentModel.findOne(
    { "paymentGateway.invoiceId": invoiceId },
    { _id: 1 }
  ).lean();

  if (assignmentByGateway?._id) {
    return String(assignmentByGateway._id);
  }

  const paymentTransaction = await TransactionModel.findOne({
    type: "escrow_hold",
    $or: [{ gatewayId: invoiceId }, { "metadata.invoiceId": invoiceId }],
  })
    .sort({ createdAt: -1 })
    .lean();

  if (
    paymentTransaction?.relatedTo?.model === "Assignment" &&
    paymentTransaction?.relatedTo?.id
  ) {
    return String(paymentTransaction.relatedTo.id);
  }

  return "";
};

const emitPaymentNotification = async ({ assignment, app }) => {
  if (!assignment?.assignedTutor) return;

  const student = await UserModel.findById(assignment.student).select("name").lean();
  const actorName = student?.name || "A student";

  const notification = await NotificationModel.create({
    user: assignment.assignedTutor,
    type: "payment_received",
    title: "Payment confirmed",
    message: `${actorName} completed payment for "${assignment.title}".`,
    link: `/user/assignments/view-details/${assignment._id}`,
    data: {
      assignmentId: assignment._id,
    },
  });

  const socketManager = app?.get?.("socketManager");
  if (socketManager) {
    socketManager.emitToUser(String(assignment.assignedTutor), "notification", {
      notification,
    });
  }
};

const verifyAndApplyAssignmentPayment = async ({
  invoiceId,
  source,
  app,
  deps = {},
}) => {
  const cleanInvoiceId = sanitizeText(invoiceId);
  if (!cleanInvoiceId) {
    throw new Error("Invoice ID is required");
  }

  const verifyPaymentFn = deps.verifyPaymentFn || verifyUddoktaPayment;
  const AssignmentRepo = deps.AssignmentModel || AssignmentModel;
  const UserRepo = deps.UserModel || UserModel;
  const TransactionRepo = deps.TransactionModel || TransactionModel;
  const mongooseRepo = deps.mongoose || mongoose;
  const findAssignmentIdByInvoiceIdFn =
    deps.findAssignmentIdByInvoiceIdFn || findAssignmentIdByInvoiceId;
  const emitPaymentNotificationFn =
    deps.emitPaymentNotificationFn || emitPaymentNotification;

  const verifyData = await verifyPaymentFn(cleanInvoiceId);
  const paymentState = normalizePaymentStatus(verifyData?.status);
  const metadata =
    verifyData?.metadata && typeof verifyData.metadata === "object"
      ? verifyData.metadata
      : {};

  let assignmentId = sanitizeText(metadata.assignmentId || metadata.assignment_id);
  if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
    assignmentId = await findAssignmentIdByInvoiceIdFn(cleanInvoiceId);
  }

  if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw new Error("Unable to map invoice to assignment");
  }

  const session = await mongooseRepo.startSession();
  let result = null;

  try {
    await session.withTransaction(async () => {
      const currentAssignment = await AssignmentRepo.findById(assignmentId).session(session);
      if (!currentAssignment) {
        throw new Error("Assignment not found");
      }

      const verifySnapshot = sanitizePaymentSnapshot(verifyData);
      const amount = parseNumber(
        verifySnapshot.amount,
        currentAssignment.paymentAmount ??
          currentAssignment.budget ??
          currentAssignment.estimatedCost ??
          0
      );
      const isCompleted = paymentState === "completed";
      const existingGateway = currentAssignment.paymentGateway || {};
      const gatewayUpdate = {
        ...existingGateway,
        provider: "uddoktapay",
        invoiceId: cleanInvoiceId,
        transactionId: verifySnapshot.transactionId || existingGateway.transactionId,
        paymentMethod: verifySnapshot.paymentMethod || existingGateway.paymentMethod,
        status: paymentState,
        initiatedAt: existingGateway.initiatedAt || new Date(),
        verifiedAt: new Date(),
        metadata: {
          ...(existingGateway.metadata || {}),
          source,
          latest: verifySnapshot,
        },
      };
      const completionEligibleStatuses = [
        "proposal_accepted",
        "assigned",
        "pending",
        "created",
        "proposal_received",
      ];

      let assignmentAfterUpdate = currentAssignment;
      let didTransitionToPaid = false;

      if (isCompleted && amount > 0) {
        const shouldMoveToInProgress = completionEligibleStatuses.includes(
          currentAssignment.status
        );
        const transitionUpdate = {
          paymentAmount: amount,
          paymentStatus: "paid",
          paymentGateway: gatewayUpdate,
          ...(shouldMoveToInProgress ? { status: "in_progress" } : {}),
        };

        // Atomic guard: only one concurrent request can move paymentStatus -> paid.
        const transitionedAssignment = await AssignmentRepo.findOneAndUpdate(
          { _id: currentAssignment._id, paymentStatus: { $ne: "paid" } },
          { $set: transitionUpdate },
          { new: true, session }
        );

        if (transitionedAssignment) {
          assignmentAfterUpdate = transitionedAssignment;
          didTransitionToPaid = true;
        } else {
          await AssignmentRepo.updateOne(
            { _id: currentAssignment._id },
            { $set: { paymentGateway: gatewayUpdate } },
            { session }
          );
          assignmentAfterUpdate = await AssignmentRepo.findById(
            currentAssignment._id
          ).session(session);
        }
      } else {
        await AssignmentRepo.updateOne(
          { _id: currentAssignment._id },
          { $set: { paymentGateway: gatewayUpdate } },
          { session }
        );
        assignmentAfterUpdate = await AssignmentRepo.findById(
          currentAssignment._id
        ).session(session);
      }

      if (!assignmentAfterUpdate) {
        throw new Error("Assignment state update failed");
      }

      if (didTransitionToPaid) {
        const walletUpdate = await UserRepo.updateOne(
          { _id: assignmentAfterUpdate.student },
          { $inc: { "wallet.escrowBalance": amount } },
          { session }
        );
        if (!walletUpdate?.matchedCount) {
          throw new Error("Student wallet update failed");
        }
      }

      const transactionFilter = {
        type: "escrow_hold",
        "relatedTo.model": "Assignment",
        "relatedTo.id": assignmentAfterUpdate._id,
      };

      let escrowTransaction = await TransactionRepo.findOne({
        ...transactionFilter,
        $or: [{ gatewayId: cleanInvoiceId }, { "metadata.invoiceId": cleanInvoiceId }],
      }).session(session);

      if (!escrowTransaction) {
        escrowTransaction = await TransactionRepo.findOne({
          ...transactionFilter,
        })
          .sort({ createdAt: -1 })
          .session(session);
      }

      const transactionStatus = isCompleted
        ? "completed"
        : paymentState === "failed"
        ? "failed"
        : paymentState === "cancelled"
        ? "cancelled"
        : "pending";

      if (escrowTransaction) {
        escrowTransaction.gatewayId = cleanInvoiceId;
        escrowTransaction.status = transactionStatus;
        if (amount > 0) {
          escrowTransaction.amount = amount;
        }
        escrowTransaction.metadata = {
          ...(escrowTransaction.metadata || {}),
          provider: "uddoktapay",
          invoiceId: cleanInvoiceId,
          paymentMethod: verifySnapshot.paymentMethod || escrowTransaction.metadata?.paymentMethod,
          providerTransactionId:
            verifySnapshot.transactionId || escrowTransaction.metadata?.providerTransactionId,
          verificationStatus: sanitizeText(verifyData?.status),
          verificationSource: source,
        };
        await escrowTransaction.save({ session });
      } else if (didTransitionToPaid && amount > 0) {
        await TransactionRepo.create(
          [
            {
              userId: assignmentAfterUpdate.student,
              type: "escrow_hold",
              amount,
              status: transactionStatus,
              gatewayId: cleanInvoiceId,
              relatedTo: { model: "Assignment", id: assignmentAfterUpdate._id },
              metadata: {
                provider: "uddoktapay",
                invoiceId: cleanInvoiceId,
                paymentMethod: verifySnapshot.paymentMethod,
                providerTransactionId: verifySnapshot.transactionId,
                verificationStatus: sanitizeText(verifyData?.status),
                verificationSource: source,
              },
            },
          ],
          { session }
        );
      }

      result = {
        assignmentId: String(assignmentAfterUpdate._id),
        paymentState,
        isCompleted,
        didTransitionToPaid,
        wasAlreadyPaid:
          !didTransitionToPaid && assignmentAfterUpdate.paymentStatus === "paid",
        assignment: assignmentAfterUpdate.toObject(),
      };
    });
  } finally {
    session.endSession();
  }

  if (result?.didTransitionToPaid) {
    await emitPaymentNotificationFn({ assignment: result.assignment, app });
  }

  return result;
};

class AssignmentController {
  // Create a new assignment
  static createAssignment = async (req, res) => {
    try {
      const { title, description, subject, topics, deadline, estimatedCost, priority, tags, requestedTutor } = req.body;
      const studentId = req.user._id;

      // Validate required fields
      if (!title || !description || !subject || !deadline) {
        return res.status(400).json({
          status: 'failed',
          message: 'Title, description, subject, and deadline are required'
        });
      }

      // Process attachments if they exist
      let attachments = [];
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => ({
          filename: file.key,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: file.location
        }));
      }

      let requestedTutorId = null;
      if (requestedTutor) {
        if (!mongoose.Types.ObjectId.isValid(requestedTutor)) {
          return res.status(400).json({
            status: 'failed',
            message: 'Invalid tutor ID'
          });
        }

        const tutor = await UserModel.findById(requestedTutor);
        if (!tutor || !tutor.roles.includes('tutor')) {
          return res.status(400).json({
            status: 'failed',
            message: 'Requested tutor is not valid'
          });
        }
        requestedTutorId = tutor._id;
      }

      // Create new assignment
      const parsedEstimatedCost = estimatedCost || 0;
      const assignment = new AssignmentModel({
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        topics: Array.isArray(topics) ? topics : (topics ? [topics] : []),
        deadline: new Date(deadline),
        estimatedCost: parsedEstimatedCost,
        budget: parsedEstimatedCost,
        priority: priority || 'medium',
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        attachments,
        student: studentId,
        requestedTutor: requestedTutorId,
        status: 'created',
        paymentStatus: 'pending',
        paymentAmount: parsedEstimatedCost
      });

      await assignment.save();

      // Populate student info for response
      await assignment.populate('student', 'name email profileImage');
      await assignment.populate('requestedTutor', 'name email profileImage');

      if (requestedTutorId) {
        const notification = await NotificationModel.create({
          user: requestedTutorId,
          type: "assignment_request",
          title: "New assignment request",
          message: `${assignment.student?.name || "A student"} requested you for "${assignment.title}".`,
          link: `/user/assignments/view-details/${assignment._id}`,
          data: {
            assignmentId: assignment._id,
            studentId: assignment.student?._id,
          },
        });

        const socketManager = req.app.get("socketManager");
        if (socketManager) {
          socketManager.emitToUser(requestedTutorId.toString(), "notification", {
            notification,
          });
        }
      }

      res.status(201).json({
        status: 'success',
        message: 'Assignment created successfully',
        data: assignment
      });

    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to create assignment',
        error: error.message
      });
    }
  };

  // Get assignment by ID
  static getAssignment = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid assignment ID'
        });
      }

      const assignment = await AssignmentModel.findById(id)
        .populate('student', 'name email profileImage phone')
        .populate('assignedTutor', 'name email profileImage phone tutorProfile')
        .populate('requestedTutor', 'name email profileImage phone tutorProfile');

      if (!assignment) {
        return res.status(404).json({
          status: 'failed',
          message: 'Assignment not found'
        });
      }

      // Check if user has permission to view this assignment
      const isStudent = assignment.student._id.toString() === userId.toString();
      const isTutor =
        assignment.assignedTutor &&
        assignment.assignedTutor._id.toString() === userId.toString();
      const isAdmin = req.user.roles.includes('admin');
      const openStatuses = ['pending', 'created', 'proposal_received'];
      const canViewOpenAssignment =
        req.user.roles.includes('tutor') &&
        assignment.isActive &&
        openStatuses.includes(assignment.status) &&
        !assignment.assignedTutor &&
        (!assignment.requestedTutor || assignment.requestedTutor._id.toString() === userId.toString());

      if (!isStudent && !isTutor && !isAdmin && !canViewOpenAssignment) {
        return res.status(403).json({
          status: 'failed',
          message: 'Access denied'
        });
      }

      // Update view count and last viewed
      assignment.viewCount += 1;
      assignment.lastViewedAt = new Date();
      await assignment.save();

      // Get additional stats
      const proposalCount = await ProposalModel.countDocuments({ assignment: id });
      const discussionCount = await ProposalModel.countDocuments({ assignment: id, status: 'pending' });

      res.status(200).json({
        status: 'success',
        data: {
          ...assignment.toObject(),
          proposalCount,
          discussionCount
        }
      });

    } catch (error) {
      console.error('Get assignment error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch assignment',
        error: error.message
      });
    }
  };

  // Get all assignments (with filters)
  static getAllAssignments = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        subject,
        priority,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search
      } = req.query;

      const userId = req.user._id;
      const userRoles = req.user.roles;

      // Build filter query
      let filter = { isActive: true };

      // Role-based filtering
      if (userRoles.includes('admin')) {
        // Admin can see all assignments
      } else if (userRoles.includes('tutor')) {
        // Tutors can see assigned assignments and unassigned ones
        filter.$or = [
          { assignedTutor: userId },
          {
            assignedTutor: null,
            status: { $in: ['pending', 'created', 'proposal_received'] },
            $or: [{ requestedTutor: null }, { requestedTutor: userId }]
          }
        ];
      } else {
        // Students can only see their own assignments
        filter.student = userId;
      }

      // Apply additional filters
      if (status) {
        const statusList = Array.isArray(status)
          ? status.filter(Boolean)
          : typeof status === 'string'
            ? status.split(',').map((value) => value.trim()).filter(Boolean)
            : [];
        if (statusList.length === 1) {
          filter.status = statusList[0];
        } else if (statusList.length > 1) {
          filter.status = { $in: statusList };
        }
      }
      if (subject) filter.subject = new RegExp(subject, 'i');
      if (priority) filter.priority = priority;

      // Search functionality
      if (search) {
        const searchFilter = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { subject: new RegExp(search, 'i') }
        ];

        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: searchFilter }];
          delete filter.$or;
        } else {
          filter.$or = searchFilter;
        }
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const assignments = await AssignmentModel.find(filter)
        .populate('student', 'name email profileImage')
        .populate('assignedTutor', 'name email profileImage tutorProfile.professionalTitle')
        .populate('requestedTutor', 'name email profileImage tutorProfile.professionalTitle')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await AssignmentModel.countDocuments(filter);

      res.status(200).json({
        status: 'success',
        data: assignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get all assignments error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch assignments',
        error: error.message
      });
    }
  };

  // Get calendar assignments for current user
  static getMyAssignmentsCalendar = async (req, res) => {
    try {
      const userId = req.user._id;
      const { status } = req.query;

      const filter = {
        isActive: true,
        $or: [{ student: userId }, { assignedTutor: userId }],
      };

      if (status === "IN_PROGRESS") {
        filter.status = { $in: ["assigned", "submitted", "proposal_accepted", "in_progress", "submission_pending", "revision_requested"] };
      } else if (status) {
        filter.status = status;
      }

      const assignments = await AssignmentModel.find(filter)
        .select("title deadline status student assignedTutor")
        .populate("student", "name")
        .populate("assignedTutor", "name")
        .sort({ deadline: 1 })
        .lean();

      const data = assignments.map((assignment) => ({
        id: assignment._id,
        title: assignment.title,
        deadline: assignment.deadline,
        status: assignment.status,
        assignedTutorName: assignment.assignedTutor?.name || "",
        studentName: assignment.student?.name || "",
      }));

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Unable to fetch assignments",
        code: "SERVER_ERROR",
      });
    }
  };

  // Get assignments by user ID
  static getAssignmentsByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
      const { status, limit = 10, page = 1 } = req.query;
      const requesterId = req.user._id;

      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid user ID'
        });
      }

      // Check if requester has permission
      const isOwnProfile = userId === requesterId.toString();
      const isAdmin = req.user.roles.includes('admin');

      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          status: 'failed',
          message: 'Access denied'
        });
      }

      // Build filter
      let filter = { student: userId, isActive: true };
      if (status) {
        const statusList = Array.isArray(status)
          ? status.filter(Boolean)
          : typeof status === 'string'
            ? status.split(',').map((value) => value.trim()).filter(Boolean)
            : [];
        if (statusList.length === 1) {
          filter.status = statusList[0];
        } else if (statusList.length > 1) {
          filter.status = { $in: statusList };
        }
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const assignments = await AssignmentModel.find(filter)
        .populate('assignedTutor', 'name email profileImage')
        .populate('requestedTutor', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await AssignmentModel.countDocuments(filter);

      res.status(200).json({
        status: 'success',
        data: assignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      });

    } catch (error) {
      console.error('Get assignments by user ID error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch user assignments',
        error: error.message
      });
    }
  };

  // Update assignment
  static updateAssignment = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid assignment ID'
        });
      }

      const assignment = await AssignmentModel.findById(id);

      if (!assignment) {
        return res.status(404).json({
          status: 'failed',
          message: 'Assignment not found'
        });
      }

      // Check permissions
      const canEdit = assignment.canEdit(userId) || req.user.roles.includes('admin');

      if (!canEdit) {
        return res.status(403).json({
          status: 'failed',
          message: 'You can only edit assignments in draft or pending status'
        });
      }

      // Process new attachments if provided
      if (req.files && req.files.length > 0) {
        const newAttachments = req.files.map(file => ({
          filename: file.key,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: file.location
        }));
        updateData.attachments = [...(assignment.attachments || []), ...newAttachments];
      }

      if (updateData.budget !== undefined) {
        const budgetValue = Number(updateData.budget);
        if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
          return res.status(400).json({
            status: 'failed',
            message: 'Budget must be a positive number'
          });
        }
        updateData.estimatedCost = budgetValue;
      } else if (updateData.estimatedCost !== undefined) {
        const costValue = Number(updateData.estimatedCost);
        if (!Number.isFinite(costValue) || costValue < 0) {
          return res.status(400).json({
            status: 'failed',
            message: 'Estimated cost must be a valid number'
          });
        }
        updateData.budget = costValue;
      }

      // Update assignment
      const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('student', 'name email profileImage')
        .populate('assignedTutor', 'name email profileImage');

      res.status(200).json({
        status: 'success',
        message: 'Assignment updated successfully',
        data: updatedAssignment
      });

    } catch (error) {
      console.error('Update assignment error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to update assignment',
        error: error.message
      });
    }
  };

  // Delete assignment (soft delete)
  static deleteAssignment = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid assignment ID'
        });
      }

      const assignment = await AssignmentModel.findById(id);

      if (!assignment) {
        return res.status(404).json({
          status: 'failed',
          message: 'Assignment not found'
        });
      }

      // Check permissions
      const isOwner = assignment.student.toString() === userId.toString();
      const isAdmin = req.user.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          status: 'failed',
          message: 'Access denied'
        });
      }

      // Soft delete
      assignment.isActive = false;
      assignment.status = 'cancelled';
      await assignment.save();

      res.status(200).json({
        status: 'success',
        message: 'Assignment deleted successfully'
      });

    } catch (error) {
      console.error('Delete assignment error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to delete assignment',
        error: error.message
      });
    }
  };

  // Assign tutor to assignment
  static assignTutor = async (req, res) => {
    try {
      const { id } = req.params;
      const { tutorId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(tutorId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid assignment or tutor ID'
        });
      }

      // Verify tutor exists and has tutor role
      const tutor = await UserModel.findById(tutorId);
      if (!tutor || !tutor.roles.includes('tutor')) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid tutor'
        });
      }

      const assignment = await AssignmentModel.findByIdAndUpdate(
        id,
        {
          assignedTutor: tutorId,
          status: 'proposal_accepted',
          paymentStatus: 'pending'
        },
        { new: true }
      ).populate('student', 'name email')
        .populate('assignedTutor', 'name email profileImage');

      if (!assignment) {
        return res.status(404).json({
          status: 'failed',
          message: 'Assignment not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Tutor assigned successfully',
        data: assignment
      });

    } catch (error) {
      console.error('Assign tutor error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to assign tutor',
        error: error.message
      });
    }
  };

  // Submit assignment work (by tutor)
  static submitWork = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        submissionNotes,
        submissionLinks,
        submissionTitle,
        submissionDescription,
        title,
        description,
      } = req.body;
      const tutorId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid assignment ID'
        });
      }

      const assignment = await AssignmentModel.findById(id);

      if (!assignment) {
        return res.status(404).json({
          status: 'failed',
          message: 'Assignment not found'
        });
      }

      // Check if user is the assigned tutor
      if (!assignment.assignedTutor || assignment.assignedTutor.toString() !== tutorId.toString()) {
        return res.status(403).json({
          status: 'failed',
          message: 'Only the assigned tutor can submit work'
        });
      }

      const allowedSubmissionStatuses = [
        "in_progress",
        "submission_pending",
        "revision_requested",
        "assigned",
        "proposal_accepted",
        "overdue",
      ];
      if (!allowedSubmissionStatuses.includes(assignment.status)) {
        return res.status(400).json({
          status: "failed",
          message: "Submission is not allowed in the current assignment status",
        });
      }

      if (assignment.paymentStatus !== 'paid') {
        return res.status(403).json({
          status: 'failed',
          message: 'Payment must be completed before submitting work'
        });
      }

      const sanitizedTitle = sanitizeText(submissionTitle || title);
      const sanitizedDescription = sanitizeText(submissionDescription || description);
      if (!sanitizedTitle || !sanitizedDescription) {
        return res.status(400).json({
          status: "failed",
          message: "Submission title and description are required",
        });
      }

      // Process submission files
      let submissionFiles = [];
      if (req.files && req.files.length > 0) {
        submissionFiles = req.files.map(file => ({
          filename: file.key,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: file.location
        }));
      }

      let parsedLinks = submissionLinks;
      if (typeof parsedLinks === "string") {
        try {
          parsedLinks = JSON.parse(parsedLinks);
        } catch {
          parsedLinks = submissionLinks;
        }
      }
      const normalizedLinks = normalizeSubmissionLinks(parsedLinks);
      const sanitizedNotes = sanitizeText(submissionNotes);

      if (submissionFiles.length === 0 && normalizedLinks.length === 0 && !sanitizedNotes) {
        return res.status(400).json({
          status: 'failed',
          message: 'Please include submission files, links, or notes'
        });
      }

      const revisionIndex = Array.isArray(assignment.submissionHistory)
        ? assignment.submissionHistory.length
        : 0;

      const submissionRecord = await SubmissionModel.create({
        assignment: assignment._id,
        student: assignment.student,
        tutor: assignment.assignedTutor,
        title: sanitizedTitle,
        description: sanitizedDescription,
        submissionFiles,
        submissionLinks: normalizedLinks,
        submissionNotes: sanitizedNotes || undefined,
        revisionIndex,
        submittedAt: new Date(),
        status: "submitted",
      });

      // Update assignment with submission
      assignment.submissionDetails = {
        submissionId: submissionRecord._id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        submittedAt: new Date(),
        submissionFiles,
        submissionLinks: normalizedLinks,
        submissionNotes: sanitizedNotes
      };
      assignment.submissionHistory = Array.isArray(assignment.submissionHistory)
        ? [
            ...assignment.submissionHistory,
            {
              submissionId: submissionRecord._id,
              title: sanitizedTitle,
              description: sanitizedDescription,
              submittedAt: new Date(),
              submissionFiles,
              submissionLinks: normalizedLinks,
              submissionNotes: sanitizedNotes,
              revisionIndex
            }
          ]
        : [
            {
              submissionId: submissionRecord._id,
              title: sanitizedTitle,
              description: sanitizedDescription,
              submittedAt: new Date(),
              submissionFiles,
              submissionLinks: normalizedLinks,
              submissionNotes: sanitizedNotes,
              revisionIndex
            }
          ];
      assignment.status = 'submitted';

      await assignment.save();

      const notification = await NotificationModel.create({
        user: assignment.student,
        type: "submission_ready",
        title: "Submission received",
        message: `${req.user?.name || "Your tutor"} submitted work for "${assignment.title}".`,
        link: `/user/assignments/view-details/${assignment._id}`,
        data: {
          assignmentId: assignment._id,
        },
      });

      const socketManager = req.app.get("socketManager");
      if (socketManager) {
        socketManager.emitToUser(assignment.student.toString(), "notification", {
          notification,
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Work submitted successfully',
        data: assignment
      });

    } catch (error) {
      console.error('Submit work error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to submit work',
        error: error.message
      });
    }
  };

  // Initialize UddoktaPay checkout (by student)
  static processPayment = async (req, res) => {
    try {
      if (!isUddoktaConfigured()) {
        return res.status(500).json({
          status: "failed",
          message: "Payment gateway is not configured",
        });
      }

      const { id } = req.params;
      const { amount, method } = req.body || {};
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const assignment = await AssignmentModel.findById(id);
      if (!assignment) {
        return res.status(404).json({
          status: "failed",
          message: "Assignment not found",
        });
      }

      if (assignment.student.toString() !== userId.toString()) {
        return res.status(403).json({
          status: "failed",
          message: "Only the student can pay for this assignment",
        });
      }

      if (!assignment.assignedTutor) {
        return res.status(400).json({
          status: "failed",
          message: "Please accept a proposal before paying",
        });
      }

      if (assignment.paymentStatus === "paid") {
        return res.status(400).json({
          status: "failed",
          message: "Payment has already been completed",
        });
      }

      const paymentAmount = parseNumber(
        amount,
        assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0
      );
      const checkoutCurrency = getConfiguredPaymentCurrency(
        req.user?.wallet?.currency
      );
      if (!paymentAmount || paymentAmount <= 0) {
        return res.status(400).json({
          status: "failed",
          message: "Payment amount must be greater than 0",
        });
      }

      const backendBaseUrl = getBackendBaseUrl(req);
      const callbackUrl = new URL(`${backendBaseUrl}/api/assignments/payment/callback`);
      callbackUrl.searchParams.set("assignment_id", String(assignment._id));

      const cancelUrl = new URL(`${backendBaseUrl}/api/assignments/payment/cancel`);
      cancelUrl.searchParams.set("assignment_id", String(assignment._id));

      const webhookUrl = new URL(`${backendBaseUrl}/api/assignments/payment/webhook`);

      const checkoutPayload = {
        full_name: req.user?.name || "Student",
        email: req.user?.email || "",
        amount: Number(paymentAmount.toFixed(2)),
        currency: checkoutCurrency,
        metadata: {
          assignmentId: String(assignment._id),
          studentId: String(assignment.student),
          method: sanitizeText(method) || "uddoktapay",
          currency: checkoutCurrency,
        },
        redirect_url: callbackUrl.toString(),
        cancel_url: cancelUrl.toString(),
        webhook_url: webhookUrl.toString(),
        return_type: "GET",
      };

      const checkout = await createUddoktaCheckout(checkoutPayload);
      const checkoutUrl = sanitizeText(checkout?.payment_url);

      if (!isSuccessfulCheckoutResponse(checkout) || !checkoutUrl) {
        return res.status(502).json({
          status: "failed",
          message: checkout?.message || "Unable to initialize payment",
        });
      }

      const invoiceId =
        extractInvoiceIdFromValue(checkout?.invoice_id) ||
        extractInvoiceIdFromValue(checkout?.data) ||
        extractInvoiceIdFromValue(checkoutUrl);

      assignment.paymentAmount = paymentAmount;
      assignment.paymentStatus = "pending";
      assignment.paymentGateway = {
        ...(assignment.paymentGateway || {}),
        provider: "uddoktapay",
        invoiceId: invoiceId || assignment.paymentGateway?.invoiceId,
        checkoutUrl,
        status: "pending",
        initiatedAt: new Date(),
        metadata: {
          ...(assignment.paymentGateway?.metadata || {}),
          initSource: "assignment_payment",
          currency: checkoutCurrency,
        },
      };
      await assignment.save();

      const existingPendingTransaction = await TransactionModel.findOne({
        type: "escrow_hold",
        "relatedTo.model": "Assignment",
        "relatedTo.id": assignment._id,
        status: "pending",
      });

      if (existingPendingTransaction) {
        existingPendingTransaction.amount = paymentAmount;
        existingPendingTransaction.gatewayId =
          invoiceId || existingPendingTransaction.gatewayId;
        existingPendingTransaction.metadata = {
          ...(existingPendingTransaction.metadata || {}),
          provider: "uddoktapay",
          invoiceId,
          paymentMethod: sanitizeText(method) || "uddoktapay",
          currency: checkoutCurrency,
          checkoutUrl,
        };
        await existingPendingTransaction.save();
      } else {
        await TransactionModel.create({
          userId,
          type: "escrow_hold",
          amount: paymentAmount,
          status: "pending",
          gatewayId: invoiceId || undefined,
          relatedTo: { model: "Assignment", id: assignment._id },
          metadata: {
            provider: "uddoktapay",
            invoiceId,
            paymentMethod: sanitizeText(method) || "uddoktapay",
            currency: checkoutCurrency,
            checkoutUrl,
          },
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Payment checkout initialized",
        data: {
          assignmentId: assignment._id,
          paymentStatus: assignment.paymentStatus,
          checkoutUrl,
          invoiceId,
          currency: checkoutCurrency,
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      return res.status(500).json({
        status: "failed",
        message: error?.message || "Unable to process payment",
      });
    }
  };

  // Verify payment by invoice ID and apply state changes
  static verifyPayment = async (req, res) => {
    try {
      const invoiceId =
        sanitizeText(req.query?.invoice_id) ||
        sanitizeText(req.body?.invoice_id) ||
        sanitizeText(req.query?.invoiceId) ||
        sanitizeText(req.body?.invoiceId);

      if (!invoiceId) {
        return res.status(400).json({
          status: "failed",
          message: "Invoice ID is required",
        });
      }

      const result = await verifyAndApplyAssignmentPayment({
        invoiceId,
        source: "manual_verify",
        app: req.app,
      });

      return res.status(200).json({
        status: "success",
        message: "Payment verification completed",
        data: {
          assignmentId: result.assignmentId,
          paymentState: result.paymentState,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error?.message || "Unable to verify payment",
      });
    }
  };

  // Gateway redirect after customer payment
  static handlePaymentCallback = async (req, res) => {
    const invoiceId =
      extractInvoiceIdFromValue(req.query?.invoice_id) ||
      extractInvoiceIdFromValue(req.query?.invoiceId) ||
      extractInvoiceIdFromValue(req.query);
    const fallbackAssignmentId = sanitizeText(req.query?.assignment_id);

    let assignmentId = fallbackAssignmentId;
    let paymentState = "failed";

    try {
      if (!invoiceId) {
        throw new Error("Invoice ID is missing in callback");
      }

      const result = await verifyAndApplyAssignmentPayment({
        invoiceId,
        source: "gateway_redirect",
        app: req.app,
      });

      assignmentId = result.assignmentId || assignmentId;
      paymentState = result.paymentState || "failed";
    } catch (error) {
      paymentState = "failed";
    }

    return res.redirect(
      buildAssignmentRedirectUrl({
        assignmentId,
        paymentState,
        invoiceId,
      })
    );
  };

  // Gateway cancel redirect
  static handlePaymentCancel = async (req, res) => {
    const invoiceId =
      extractInvoiceIdFromValue(req.query?.invoice_id) ||
      extractInvoiceIdFromValue(req.query?.invoiceId) ||
      "";

    let assignmentId = sanitizeText(req.query?.assignment_id);

    if (!assignmentId && invoiceId) {
      assignmentId = await findAssignmentIdByInvoiceId(invoiceId);
    }

    if (invoiceId) {
      const assignment = assignmentId
        ? await AssignmentModel.findById(assignmentId)
        : null;

      if (assignment) {
        assignment.paymentGateway = {
          ...(assignment.paymentGateway || {}),
          provider: "uddoktapay",
          invoiceId: invoiceId || assignment.paymentGateway?.invoiceId,
          status: "cancelled",
          verifiedAt: new Date(),
          metadata: {
            ...(assignment.paymentGateway?.metadata || {}),
            cancelSource: "gateway_redirect",
          },
        };
        await assignment.save();
      }

      await TransactionModel.updateMany(
        {
          type: "escrow_hold",
          "relatedTo.model": "Assignment",
          ...(assignmentId ? { "relatedTo.id": assignmentId } : {}),
          $or: [{ gatewayId: invoiceId }, { "metadata.invoiceId": invoiceId }],
          status: "pending",
        },
        {
          $set: {
            status: "cancelled",
            "metadata.cancelledAt": new Date().toISOString(),
            "metadata.cancellationSource": "gateway_redirect",
          },
        }
      );
    }

    return res.redirect(
      buildAssignmentRedirectUrl({
        assignmentId,
        paymentState: "cancelled",
        invoiceId,
      })
    );
  };

  // Gateway webhook
  static handlePaymentWebhook = async (req, res) => {
    try {
      if (!isValidUddoktaWebhookRequest(req)) {
        return res.status(401).json({
          status: "failed",
          message: "Invalid webhook signature",
        });
      }

      const invoiceId =
        extractInvoiceIdFromValue(req.body?.invoice_id) ||
        extractInvoiceIdFromValue(req.body?.invoiceId) ||
        extractInvoiceIdFromValue(req.body);

      if (!invoiceId) {
        return res.status(400).json({
          status: "failed",
          message: "Invoice ID is required",
        });
      }

      const result = await verifyAndApplyAssignmentPayment({
        invoiceId,
        source: "gateway_webhook",
        app: req.app,
      });

      return res.status(200).json({
        status: "success",
        message: "Webhook processed",
        data: {
          assignmentId: result.assignmentId,
          paymentState: result.paymentState,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error?.message || "Unable to process webhook",
      });
    }
  };

  // Request revision (by student)
  static requestRevision = async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body || {};
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const assignment = await AssignmentModel.findById(id);
      if (!assignment) {
        return res.status(404).json({
          status: "failed",
          message: "Assignment not found",
        });
      }

      if (assignment.student.toString() !== userId.toString()) {
        return res.status(403).json({
          status: "failed",
          message: "Only the student can request revisions",
        });
      }

      if (!["submitted", "revision_requested"].includes(assignment.status)) {
        return res.status(400).json({
          status: "failed",
          message: "Revision can only be requested after a submission",
        });
      }

      const noteValue = sanitizeText(note);
      if (!noteValue) {
        return res.status(400).json({
          status: "failed",
          message: "Revision note is required",
        });
      }

      assignment.status = "revision_requested";
      assignment.revisionRequests = Array.isArray(assignment.revisionRequests)
        ? [
            ...assignment.revisionRequests,
            { note: noteValue, requestedAt: new Date(), requestedBy: userId },
          ]
        : [{ note: noteValue, requestedAt: new Date(), requestedBy: userId }];

      const latestSubmission = await SubmissionModel.findOne({ assignment: id })
        .sort({ createdAt: -1, submittedAt: -1 })
        .exec();
      if (latestSubmission) {
        latestSubmission.status = "revision_requested";
        await latestSubmission.save();
      }

      await assignment.save();

      if (assignment.assignedTutor) {
        const notification = await NotificationModel.create({
          user: assignment.assignedTutor,
          type: "revision_requested",
          title: "Revision requested",
          message: `${req.user?.name || "A student"} requested revisions for "${assignment.title}".`,
          link: `/user/assignments/view-details/${assignment._id}`,
          data: {
            assignmentId: assignment._id,
          },
        });

        const socketManager = req.app.get("socketManager");
        if (socketManager) {
          socketManager.emitToUser(String(assignment.assignedTutor), "notification", {
            notification,
          });
        }
      }

      return res.status(200).json({
        status: "success",
        message: "Revision requested",
        data: assignment,
      });
    } catch (error) {
      console.error("Request revision error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to request revision",
      });
    }
  };

  // Submit feedback and complete assignment (by student)
  static submitFeedback = async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comments } = req.body || {};
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid assignment ID",
        });
      }

      const assignment = await AssignmentModel.findById(id);
      if (!assignment) {
        return res.status(404).json({
          status: "failed",
          message: "Assignment not found",
        });
      }

      if (assignment.student.toString() !== userId.toString()) {
        return res.status(403).json({
          status: "failed",
          message: "Only the student can complete this assignment",
        });
      }

      if (!["submitted", "revision_requested"].includes(assignment.status)) {
        return res.status(400).json({
          status: "failed",
          message: "Assignment must be submitted before completion",
        });
      }

      const ratingValue = parseNumber(rating, 0);
      if (!ratingValue) {
        return res.status(400).json({
          status: "failed",
          message: "Rating is required to complete the assignment",
        });
      }
      if (ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({
          status: "failed",
          message: "Rating must be between 1 and 5",
        });
      }

      const feedbackComments = sanitizeText(comments);
      const latestSubmission = await SubmissionModel.findOne({ assignment: id })
        .sort({ createdAt: -1, submittedAt: -1 })
        .exec();
      if (latestSubmission) {
        latestSubmission.status = "completed";
        latestSubmission.review = {
          stars: ratingValue,
          feedback: feedbackComments || undefined,
          reviewedAt: new Date(),
        };
        await latestSubmission.save();
      }

      assignment.feedback = {
        rating: ratingValue,
        comments: feedbackComments || undefined,
        feedbackDate: new Date(),
      };
      assignment.status = "completed";
      assignment.paymentStatus = assignment.paymentStatus || "paid";

      await assignment.save();

      const amount = parseNumber(
        assignment.paymentAmount ?? assignment.estimatedCost ?? assignment.budget ?? 0,
        0
      );

      if (amount > 0 && assignment.assignedTutor) {
        const [student, tutor, settings] = await Promise.all([
          UserModel.findById(assignment.student),
          UserModel.findById(assignment.assignedTutor),
          PlatformSettingsModel.findOne().lean(),
        ]);

        if (student && tutor) {
          const platformFeeRate = parseNumber(
            settings?.platformFeeRate,
            getDefaultPlatformFeeRate()
          );
          const minTransactionFee = parseNumber(
            settings?.minTransactionFee,
            getDefaultMinTransactionFee()
          );
          let platformFee = Math.max(0, amount * platformFeeRate);
          if (platformFee > 0 && minTransactionFee > 0) {
            platformFee = Math.max(platformFee, minTransactionFee);
          }
          const tutorNet = Math.max(0, amount - platformFee);

          await UserModel.updateOne(
            { _id: student._id, "wallet.escrowBalance": { $gte: amount } },
            { $inc: { "wallet.escrowBalance": -amount } }
          );

          if (tutorNet > 0) {
            await UserModel.updateOne(
              { _id: tutor._id },
              { $inc: { "wallet.availableBalance": tutorNet, "wallet.totalEarnings": tutorNet } }
            );
          }

          const transactions = [];
          if (tutorNet > 0) {
            transactions.push({
              userId: tutor._id,
              type: "escrow_release",
              amount: tutorNet,
              status: "completed",
              relatedTo: { model: "Assignment", id: assignment._id },
              metadata: { resolution: "completion" },
            });
          }
          if (platformFee > 0) {
            transactions.push({
              userId: tutor._id,
              type: "platform_fee",
              amount: platformFee,
              status: "completed",
              relatedTo: { model: "Assignment", id: assignment._id },
              metadata: { resolution: "completion" },
            });
          }
          if (transactions.length) {
            await TransactionModel.create(transactions);
          }
        }
      }

      if (assignment.assignedTutor) {
        const notification = await NotificationModel.create({
          user: assignment.assignedTutor,
          type: "assignment_completed",
          title: "Assignment completed",
          message: `${req.user?.name || "A student"} completed "${assignment.title}".`,
          link: `/user/assignments/view-details/${assignment._id}`,
          data: {
            assignmentId: assignment._id,
          },
        });

        const socketManager = req.app.get("socketManager");
        if (socketManager) {
          socketManager.emitToUser(String(assignment.assignedTutor), "notification", {
            notification,
          });
        }
      }

      return res.status(200).json({
        status: "success",
        message: "Assignment completed",
        data: assignment,
      });
    } catch (error) {
      console.error("Submit feedback error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to complete assignment",
      });
    }
  };

  // Get assignment statistics
  static getAssignmentStats = async (req, res) => {
    try {
      const userId = req.user._id;
      const userRoles = req.user.roles;

      let matchFilter = { isActive: true };

      // Role-based filtering for stats
      if (!userRoles.includes('admin')) {
        if (userRoles.includes('tutor')) {
          matchFilter.assignedTutor = userId;
        } else {
          matchFilter.student = userId;
        }
      }

      const stats = await AssignmentModel.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalCost: { $sum: '$estimatedCost' }
          }
        }
      ]);

      const totalAssignments = await AssignmentModel.countDocuments(matchFilter);

      res.status(200).json({
        status: 'success',
        data: {
          totalAssignments,
          statusBreakdown: stats,
          totalEstimatedValue: stats.reduce((sum, stat) => sum + stat.totalCost, 0)
        }
      });

    } catch (error) {
      console.error('Get assignment stats error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch assignment statistics',
        error: error.message
      });
    }
  };
}

export { verifyAndApplyAssignmentPayment as __verifyAndApplyAssignmentPaymentForTest };
export default AssignmentController;
