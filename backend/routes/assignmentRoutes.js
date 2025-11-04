import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AssignmentController from '../controllers/assignmentController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';

const router = express.Router();

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    'uploads/assignments',
    'uploads/submissions'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadDirs();

// Configure multer for assignment file uploads
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `assignment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure multer for submission file uploads
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/submissions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `submission-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for assignments
const assignmentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, PPT, PPTX, TXT, Images, Videos`), false);
  }
};

// Multer configurations
const uploadAssignmentFiles = multer({
  storage: assignmentStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: assignmentFileFilter
});

const uploadSubmissionFiles = multer({
  storage: submissionStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: assignmentFileFilter
});

// Apply authentication middleware to all routes
router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

// Assignment CRUD Routes

// Create new assignment
router.post('/', uploadAssignmentFiles.array('attachments', 10), AssignmentController.createAssignment);

// Get all assignments (with filtering and pagination)
router.get('/', AssignmentController.getAllAssignments);

// Get assignment statistics
router.get('/stats', AssignmentController.getAssignmentStats);

// Get assignments by user ID
router.get('/user/:userId', AssignmentController.getAssignmentsByUserId);

// Get specific assignment by ID
router.get('/:id', AssignmentController.getAssignment);

// Update assignment
router.put('/:id', uploadAssignmentFiles.array('attachments', 10), AssignmentController.updateAssignment);

// Delete assignment (soft delete)
router.delete('/:id', AssignmentController.deleteAssignment);

// Assignment workflow routes

// Assign tutor to assignment (admin/system use)
router.patch('/:id/assign-tutor', AssignmentController.assignTutor);

// Submit work (by tutor)
router.post('/:id/submit', uploadSubmissionFiles.array('submissionFiles', 10), AssignmentController.submitWork);

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