import AssignmentModel from '../models/Assignment.js';
import UserModel from '../models/User.js';
import ProposalModel from '../models/Proposal.js';
import mongoose from 'mongoose';

class AssignmentController {
  // Create a new assignment
  static createAssignment = async (req, res) => {
    try {
      const { title, description, subject, topics, deadline, estimatedCost, priority, tags } = req.body;
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

      // Create new assignment
      const assignment = new AssignmentModel({
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        topics: Array.isArray(topics) ? topics : (topics ? [topics] : []),
        deadline: new Date(deadline),
        estimatedCost: estimatedCost || 0,
        priority: priority || 'medium',
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        attachments,
        student: studentId,
        status: 'pending' // Auto-submit when created
      });

      await assignment.save();

      // Populate student info for response
      await assignment.populate('student', 'name email profileImage');

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
        .populate('assignedTutor', 'name email profileImage phone tutorProfile');

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
      const canViewOpenAssignment =
        req.user.roles.includes('tutor') &&
        assignment.isActive &&
        assignment.status === 'pending' &&
        !assignment.assignedTutor;

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
          { assignedTutor: null, status: 'pending' }
        ];
      } else {
        // Students can only see their own assignments
        filter.student = userId;
      }

      // Apply additional filters
      if (status) filter.status = status;
      if (subject) filter.subject = new RegExp(subject, 'i');
      if (priority) filter.priority = priority;

      // Search functionality
      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { subject: new RegExp(search, 'i') }
        ];
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const assignments = await AssignmentModel.find(filter)
        .populate('student', 'name email profileImage')
        .populate('assignedTutor', 'name email profileImage tutorProfile.professionalTitle')
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
        filter.status = { $in: ["assigned", "submitted"] };
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
      if (status) filter.status = status;

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const assignments = await AssignmentModel.find(filter)
        .populate('assignedTutor', 'name email profileImage')
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
          status: 'assigned'
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
      const { submissionNotes } = req.body;
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

      // Update assignment with submission
      assignment.submissionDetails = {
        submittedAt: new Date(),
        submissionFiles,
        submissionNotes: submissionNotes || ''
      };
      assignment.status = 'submitted';

      await assignment.save();

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
