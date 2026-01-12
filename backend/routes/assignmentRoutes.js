import express from 'express';
import multer from 'multer';
import { uploadAssignment } from '../config/s3Config.js';
import AssignmentController from '../controllers/assignmentController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';

const router = express.Router();

// Local multer configuration removed in favor of S3

// Apply authentication middleware to all routes
router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

// Assignment CRUD Routes

// Create new assignment
router.post('/', uploadAssignment.array('attachments', 10), AssignmentController.createAssignment);

// Get all assignments (with filtering and pagination)
router.get('/', AssignmentController.getAllAssignments);

// Get assignment statistics
router.get('/stats', AssignmentController.getAssignmentStats);

// Get assignments for current user (calendar)
router.get('/me', AssignmentController.getMyAssignmentsCalendar);

// Get assignments by user ID
router.get('/user/:userId', AssignmentController.getAssignmentsByUserId);

// Get specific assignment by ID
router.get('/:id', AssignmentController.getAssignment);

// Update assignment
router.put('/:id', uploadAssignment.array('attachments', 10), AssignmentController.updateAssignment);

// Delete assignment (soft delete)
router.delete('/:id', AssignmentController.deleteAssignment);

// Assignment workflow routes

// Assign tutor to assignment (admin/system use)
router.patch('/:id/assign-tutor', AssignmentController.assignTutor);

// Submit work (by tutor)
router.post('/:id/submit', uploadAssignment.array('submissionFiles', 10), AssignmentController.submitWork);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'failed',
        message: 'File too large. Maximum size is 50MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'failed',
        message: 'Too many files. Maximum is 10 files per upload.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'failed',
        message: 'Unexpected file field.'
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      status: 'failed',
      message: error.message
    });
  }

  next(error);
});

export default router;
