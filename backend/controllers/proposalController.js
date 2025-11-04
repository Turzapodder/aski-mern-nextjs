import ProposalModel from '../models/Proposal.js';
import AssignmentModel from '../models/Assignment.js';
import UserModel from '../models/User.js';
import mongoose from 'mongoose';

class ProposalController {
  // Create a new proposal (for tutors)
  static createProposal = async (req, res) => {
    try {
      const { 
        assignmentId, 
        title, 
        description, 
        proposedPrice, 
        estimatedDeliveryTime, 
        coverLetter, 
        relevantExperience 
      } = req.body;
      const tutorId = req.user._id;

      // Validate required fields
      if (!assignmentId || !title || !description || !proposedPrice || !estimatedDeliveryTime) {
        return res.status(400).json({
          status: 'failed',
          message: 'Assignment ID, title, description, proposed price, and estimated delivery time are required'
        });
      }

      // Check if assignment exists and is available for proposals
      const assignment = await AssignmentModel.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          status: 'failed',
          message: 'Assignment not found'
        });
      }

      if (assignment.status !== 'pending') {
        return res.status(400).json({
          status: 'failed',
          message: 'This assignment is no longer accepting proposals'
        });
      }

      // Check if tutor already submitted a proposal for this assignment
      const existingProposal = await ProposalModel.findOne({
        assignment: assignmentId,
        tutor: tutorId,
        isActive: true
      });

      if (existingProposal) {
        return res.status(400).json({
          status: 'failed',
          message: 'You have already submitted a proposal for this assignment'
        });
      }

      // Process attachments if they exist
      let attachments = [];
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/proposals/${file.filename}`
        }));
      }

      // Create new proposal
      const proposal = new ProposalModel({
        assignment: assignmentId,
        tutor: tutorId,
        student: assignment.student,
        title: title.trim(),
        description: description.trim(),
        proposedPrice: parseFloat(proposedPrice),
        estimatedDeliveryTime: parseInt(estimatedDeliveryTime),
        coverLetter: coverLetter?.trim(),
        relevantExperience: relevantExperience?.trim(),
        attachments
      });

      await proposal.save();

      // Populate related data for response
      await proposal.populate([
        { path: 'tutor', select: 'name email profileImage tutorProfile' },
        { path: 'assignment', select: 'title subject deadline' },
        { path: 'student', select: 'name email' }
      ]);

      res.status(201).json({
        status: 'success',
        message: 'Proposal submitted successfully',
        data: { proposal }
      });

    } catch (error) {
      console.error('Error creating proposal:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Get proposal by ID
  static getProposal = async (req, res) => {
    try {
      const { proposalId } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid proposal ID'
        });
      }

      const proposal = await ProposalModel.findById(proposalId)
        .populate('tutor', 'name email profileImage tutorProfile')
        .populate('assignment', 'title subject deadline status')
        .populate('student', 'name email profileImage');

      if (!proposal) {
        return res.status(404).json({
          status: 'failed',
          message: 'Proposal not found'
        });
      }

      // Check if user has permission to view this proposal
      const canView = proposal.tutor._id.toString() === userId.toString() || 
                     proposal.student._id.toString() === userId.toString();

      if (!canView) {
        return res.status(403).json({
          status: 'failed',
          message: 'You do not have permission to view this proposal'
        });
      }

      // Mark as viewed by student if applicable
      if (proposal.student._id.toString() === userId.toString() && !proposal.viewedByStudent) {
        proposal.viewedByStudent = true;
        proposal.viewedAt = new Date();
        await proposal.save();
      }

      res.status(200).json({
        status: 'success',
        data: { proposal }
      });

    } catch (error) {
      console.error('Error fetching proposal:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Get proposals for an assignment (for students)
  static getProposalsByAssignment = async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid assignment ID'
        });
      }

      // Check if user owns the assignment
      const assignment = await AssignmentModel.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          status: 'failed',
          message: 'Assignment not found'
        });
      }

      if (assignment.student.toString() !== userId.toString()) {
        return res.status(403).json({
          status: 'failed',
          message: 'You do not have permission to view proposals for this assignment'
        });
      }

      const proposals = await ProposalModel.findByAssignment(assignmentId);

      res.status(200).json({
        status: 'success',
        data: { 
          proposals,
          count: proposals.length
        }
      });

    } catch (error) {
      console.error('Error fetching proposals by assignment:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Get proposals by tutor (for tutors)
  static getProposalsByTutor = async (req, res) => {
    try {
      const tutorId = req.user._id;
      const { status, page = 1, limit = 10 } = req.query;

      const options = {};
      if (status) {
        options.status = status;
      }

      const proposals = await ProposalModel.findByTutor(tutorId, options)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await ProposalModel.countDocuments({
        tutor: tutorId,
        isActive: true,
        ...options
      });

      res.status(200).json({
        status: 'success',
        data: { 
          proposals,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Error fetching proposals by tutor:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Get proposals by student (for students)
  static getProposalsByStudent = async (req, res) => {
    try {
      const studentId = req.user._id;
      const { status, page = 1, limit = 10 } = req.query;

      const options = {};
      if (status) {
        options.status = status;
      }

      const proposals = await ProposalModel.findByStudent(studentId, options)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await ProposalModel.countDocuments({
        student: studentId,
        isActive: true,
        ...options
      });

      res.status(200).json({
        status: 'success',
        data: { 
          proposals,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Error fetching proposals by student:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Update proposal (for tutors, only if pending)
  static updateProposal = async (req, res) => {
    try {
      const { proposalId } = req.params;
      const userId = req.user._id;
      const updates = req.body;

      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid proposal ID'
        });
      }

      const proposal = await ProposalModel.findById(proposalId);
      if (!proposal) {
        return res.status(404).json({
          status: 'failed',
          message: 'Proposal not found'
        });
      }

      // Check if user can edit this proposal
      if (!proposal.canEdit(userId)) {
        return res.status(403).json({
          status: 'failed',
          message: 'You cannot edit this proposal'
        });
      }

      // Only allow certain fields to be updated
      const allowedUpdates = [
        'title', 'description', 'proposedPrice', 'estimatedDeliveryTime', 
        'coverLetter', 'relevantExperience'
      ];

      const updateData = {};
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      // Process new attachments if they exist
      if (req.files && req.files.length > 0) {
        const newAttachments = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/proposals/${file.filename}`
        }));
        updateData.attachments = [...proposal.attachments, ...newAttachments];
      }

      const updatedProposal = await ProposalModel.findByIdAndUpdate(
        proposalId,
        updateData,
        { new: true, runValidators: true }
      ).populate([
        { path: 'tutor', select: 'name email profileImage tutorProfile' },
        { path: 'assignment', select: 'title subject deadline' },
        { path: 'student', select: 'name email' }
      ]);

      res.status(200).json({
        status: 'success',
        message: 'Proposal updated successfully',
        data: { proposal: updatedProposal }
      });

    } catch (error) {
      console.error('Error updating proposal:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Accept proposal (for students)
  static acceptProposal = async (req, res) => {
    try {
      const { proposalId } = req.params;
      const { message } = req.body;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid proposal ID'
        });
      }

      const proposal = await ProposalModel.findById(proposalId);
      if (!proposal) {
        return res.status(404).json({
          status: 'failed',
          message: 'Proposal not found'
        });
      }

      // Check if user can respond to this proposal
      if (!proposal.canRespond(userId)) {
        return res.status(403).json({
          status: 'failed',
          message: 'You cannot respond to this proposal'
        });
      }

      // Update proposal status
      proposal.status = 'accepted';
      proposal.studentResponse = {
        message: message?.trim(),
        respondedAt: new Date()
      };

      await proposal.save();

      // Update assignment status and assign tutor
      await AssignmentModel.findByIdAndUpdate(proposal.assignment, {
        status: 'assigned',
        assignedTutor: proposal.tutor
      });

      // Reject all other proposals for this assignment
      await ProposalModel.updateMany(
        {
          assignment: proposal.assignment,
          _id: { $ne: proposalId },
          status: 'pending'
        },
        { status: 'rejected' }
      );

      await proposal.populate([
        { path: 'tutor', select: 'name email profileImage tutorProfile' },
        { path: 'assignment', select: 'title subject deadline' }
      ]);

      res.status(200).json({
        status: 'success',
        message: 'Proposal accepted successfully',
        data: { proposal }
      });

    } catch (error) {
      console.error('Error accepting proposal:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Reject proposal (for students)
  static rejectProposal = async (req, res) => {
    try {
      const { proposalId } = req.params;
      const { message } = req.body;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid proposal ID'
        });
      }

      const proposal = await ProposalModel.findById(proposalId);
      if (!proposal) {
        return res.status(404).json({
          status: 'failed',
          message: 'Proposal not found'
        });
      }

      // Check if user can respond to this proposal
      if (!proposal.canRespond(userId)) {
        return res.status(403).json({
          status: 'failed',
          message: 'You cannot respond to this proposal'
        });
      }

      // Update proposal status
      proposal.status = 'rejected';
      proposal.studentResponse = {
        message: message?.trim(),
        respondedAt: new Date()
      };

      await proposal.save();

      await proposal.populate([
        { path: 'tutor', select: 'name email profileImage tutorProfile' },
        { path: 'assignment', select: 'title subject deadline' }
      ]);

      res.status(200).json({
        status: 'success',
        message: 'Proposal rejected successfully',
        data: { proposal }
      });

    } catch (error) {
      console.error('Error rejecting proposal:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Withdraw proposal (for tutors)
  static withdrawProposal = async (req, res) => {
    try {
      const { proposalId } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid proposal ID'
        });
      }

      const proposal = await ProposalModel.findById(proposalId);
      if (!proposal) {
        return res.status(404).json({
          status: 'failed',
          message: 'Proposal not found'
        });
      }

      // Check if user can withdraw this proposal
      if (!proposal.canWithdraw(userId)) {
        return res.status(403).json({
          status: 'failed',
          message: 'You cannot withdraw this proposal'
        });
      }

      proposal.status = 'withdrawn';
      await proposal.save();

      res.status(200).json({
        status: 'success',
        message: 'Proposal withdrawn successfully',
        data: { proposal }
      });

    } catch (error) {
      console.error('Error withdrawing proposal:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Delete proposal (soft delete)
  static deleteProposal = async (req, res) => {
    try {
      const { proposalId } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid proposal ID'
        });
      }

      const proposal = await ProposalModel.findById(proposalId);
      if (!proposal) {
        return res.status(404).json({
          status: 'failed',
          message: 'Proposal not found'
        });
      }

      // Only tutor can delete their own proposal
      if (proposal.tutor.toString() !== userId.toString()) {
        return res.status(403).json({
          status: 'failed',
          message: 'You do not have permission to delete this proposal'
        });
      }

      // Soft delete
      proposal.isActive = false;
      await proposal.save();

      res.status(200).json({
        status: 'success',
        message: 'Proposal deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting proposal:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  // Get proposal statistics
  static getProposalStats = async (req, res) => {
    try {
      const userId = req.user._id;
      const userRoles = req.user.roles;

      let stats = {};

      if (userRoles.includes('tutor')) {
        // Tutor statistics
        const tutorStats = await ProposalModel.aggregate([
          { $match: { tutor: userId, isActive: true } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        stats.tutor = {
          total: await ProposalModel.countDocuments({ tutor: userId, isActive: true }),
          pending: tutorStats.find(s => s._id === 'pending')?.count || 0,
          accepted: tutorStats.find(s => s._id === 'accepted')?.count || 0,
          rejected: tutorStats.find(s => s._id === 'rejected')?.count || 0,
          withdrawn: tutorStats.find(s => s._id === 'withdrawn')?.count || 0
        };
      }

      if (userRoles.includes('user') || userRoles.includes('student')) {
        // Student statistics
        const studentStats = await ProposalModel.aggregate([
          { $match: { student: userId, isActive: true } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        stats.student = {
          total: await ProposalModel.countDocuments({ student: userId, isActive: true }),
          pending: studentStats.find(s => s._id === 'pending')?.count || 0,
          accepted: studentStats.find(s => s._id === 'accepted')?.count || 0,
          rejected: studentStats.find(s => s._id === 'rejected')?.count || 0
        };
      }

      res.status(200).json({
        status: 'success',
        data: { stats }
      });

    } catch (error) {
      console.error('Error fetching proposal stats:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
        error: error.message
      });
    }
  };
}

export default ProposalController;