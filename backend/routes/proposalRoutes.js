import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ProposalController from '../controllers/proposalController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';

const router = express.Router();

// Ensure upload directory exists
const ensureUploadDirs = () => {
  const dir = 'uploads/proposals';
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureUploadDirs();

// Configure multer for proposal file uploads
const proposalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/proposals/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `proposal-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for proposals (documents, images, portfolios)
const proposalFileFilter = (req, file, cb) => {
  // Allow common document and image formats
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Please upload documents or images only.`), false);
  }
};

const uploadProposalFiles = multer({
  storage: proposalStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit per file
    files: 5 // Maximum 5 files per proposal
  },
  fileFilter: proposalFileFilter
});

// Apply middleware to all routes
router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

// Routes

// Create a new proposal (POST /api/proposals)
router.post('/', uploadProposalFiles.array('attachments', 5), ProposalController.createProposal);

// Get proposals by tutor (GET /api/proposals/tutor)
router.get('/tutor', ProposalController.getProposalsByTutor);

// Get proposals by student (GET /api/proposals/student)
router.get('/student', ProposalController.getProposalsByStudent);

// Get proposal statistics (GET /api/proposals/stats)
router.get('/stats', ProposalController.getProposalStats);

// Get proposals for a specific assignment (GET /api/proposals/assignment/:assignmentId)
router.get('/assignment/:assignmentId', ProposalController.getProposalsByAssignment);

// Get a specific proposal by ID (GET /api/proposals/:proposalId)
router.get('/:proposalId', ProposalController.getProposal);

// Update a proposal (PUT /api/proposals/:proposalId)
router.put('/:proposalId', uploadProposalFiles.array('attachments', 5), ProposalController.updateProposal);

// Accept a proposal (PATCH /api/proposals/:proposalId/accept)
router.patch('/:proposalId/accept', ProposalController.acceptProposal);
router.post('/:proposalId/accept', ProposalController.acceptProposal);

// Reject a proposal (PATCH /api/proposals/:proposalId/reject)
router.patch('/:proposalId/reject', ProposalController.rejectProposal);
router.post('/:proposalId/reject', ProposalController.rejectProposal);

// Withdraw a proposal (PATCH /api/proposals/:proposalId/withdraw)
router.patch('/:proposalId/withdraw', ProposalController.withdrawProposal);
router.post('/:proposalId/withdraw', ProposalController.withdrawProposal);

// Delete a proposal (DELETE /api/proposals/:proposalId)
router.delete('/:proposalId', ProposalController.deleteProposal);

// Error handling middleware for multer and other errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'failed',
        message: 'File size too large. Maximum size allowed is 25MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'failed',
        message: 'Too many files. Maximum 5 files allowed per proposal.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'failed',
        message: 'Unexpected file field. Please use "attachments" field for file uploads.'
      });
    }
  }
  
  if (error.message && error.message.includes('File type')) {
    return res.status(400).json({
      status: 'failed',
      message: error.message
    });
  }
  
  // Generic error
  console.error('Proposal route error:', error);
  res.status(500).json({
    status: 'failed',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default router;
