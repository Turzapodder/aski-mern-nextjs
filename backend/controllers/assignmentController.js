import AssignmentModel from '../models/Assignment.js';
import UserModel from '../models/User.js';
import ProposalModel from '../models/Proposal.js';
import NotificationModel from '../models/Notification.js';
import TransactionModel from "../models/Transaction.js";
import PlatformSettingsModel from "../models/PlatformSettings.js";
import mongoose from 'mongoose';

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

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
      const { submissionNotes, submissionLinks } = req.body;
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

      if (assignment.paymentStatus !== 'paid') {
        return res.status(403).json({
          status: 'failed',
          message: 'Payment must be completed before submitting work'
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

      // Update assignment with submission
      assignment.submissionDetails = {
        submittedAt: new Date(),
        submissionFiles,
        submissionLinks: normalizedLinks,
        submissionNotes: sanitizedNotes
      };
      assignment.submissionHistory = Array.isArray(assignment.submissionHistory)
        ? [
            ...assignment.submissionHistory,
            {
              submittedAt: new Date(),
              submissionFiles,
              submissionLinks: normalizedLinks,
              submissionNotes: sanitizedNotes,
              revisionIndex
            }
          ]
        : [
            {
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

  // Dummy payment processing (by student)
  static processPayment = async (req, res) => {
    try {
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
      if (!paymentAmount || paymentAmount <= 0) {
        return res.status(400).json({
          status: "failed",
          message: "Payment amount must be greater than 0",
        });
      }

      assignment.paymentAmount = paymentAmount;
      assignment.paymentStatus = "paid";
      if (["proposal_accepted", "assigned", "pending", "created", "proposal_received"].includes(assignment.status)) {
        assignment.status = "in_progress";
      }

      await assignment.save();

      await UserModel.updateOne(
        { _id: userId },
        { $inc: { "wallet.escrowBalance": paymentAmount } }
      );

      await TransactionModel.create({
        userId,
        type: "escrow_hold",
        amount: paymentAmount,
        status: "completed",
        relatedTo: { model: "Assignment", id: assignment._id },
        metadata: {
          method: sanitizeText(method) || "dummy",
        },
      });

      const notification = await NotificationModel.create({
        user: assignment.assignedTutor,
        type: "payment_received",
        title: "Payment confirmed",
        message: `${req.user?.name || "A student"} completed payment for "${assignment.title}".`,
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

      return res.status(200).json({
        status: "success",
        message: "Payment completed",
        data: assignment,
      });
    } catch (error) {
      console.error("Payment error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to process payment",
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

      const ratingValue = rating !== undefined ? parseNumber(rating, 0) : 0;
      if (ratingValue && (ratingValue < 1 || ratingValue > 5)) {
        return res.status(400).json({
          status: "failed",
          message: "Rating must be between 1 and 5",
        });
      }

      assignment.feedback = {
        rating: ratingValue || undefined,
        comments: sanitizeText(comments) || undefined,
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
          const platformFeeRate = parseNumber(settings?.platformFeeRate, 0);
          const minTransactionFee = parseNumber(settings?.minTransactionFee, 0);
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

export default AssignmentController;
