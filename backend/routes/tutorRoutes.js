//backend\routes\tutorRoutes.js
import express from 'express';
import TutorController, { uploadDocuments } from '../controllers/tutorController.js';
import { saveQuizResult, getQuizHistory } from '../controllers/quizController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';
import verifyAdmin from '../middlewares/admin-middleware.js';

const router = express.Router();

// Middleware to handle cookie-based authentication and refresh tokens
router.use(AccessTokenAutoRefresh);

// Middleware to protect all tutor routes
router.use(checkUserAuth);

// Check if user can apply for a subject
router.get('/can-apply/:subject', TutorController.canApplyForSubject);

// Tutor application routes
router.post('/application/submit', 
  uploadDocuments.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
  ]), 
  TutorController.submitApplication
);

router.get('/application/status', TutorController.getApplicationStatus);

// Quiz result routes
router.post('/quiz/save-result', saveQuizResult);
router.get('/quiz/history', getQuizHistory);

// Admin routes
router.get('/applications', verifyAdmin, TutorController.getAllApplications);
router.put(
  '/applications/:applicationId/review',
  verifyAdmin,
  TutorController.reviewApplication
);

export default router;