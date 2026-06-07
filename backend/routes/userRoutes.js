// backend\routes\userRoutes.js
import express from 'express';
import UserController from '../controllers/userController.js';
import { generateQuiz } from '../controllers/quizController.js';
import passport from 'passport';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';
import { authLimiter, quizLimiter } from '../middlewares/rateLimiters.js';

const router = express.Router();
// Public Routes
router.post('/register', authLimiter, UserController.userRegistration);
router.post('/verify-email', authLimiter, UserController.verifyEmail);
router.post('/resend-otp', authLimiter, UserController.resendVerificationOtp);
router.post('/login', authLimiter, UserController.userLogin);
router.post('/refresh-token', UserController.getNewAccessToken);
router.post('/reset-password-link', authLimiter, UserController.sendUserPasswordResetEmail);
router.post('/reset-password/:id/:token', authLimiter, UserController.userPasswordReset);
router.post('/generate-quiz', quizLimiter, generateQuiz);


//Protected Routes
router.get('/me', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.userMe)
router.get('/profile', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.userProfile)
router.put('/profile', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.updateUserProfile)
router.post('/change-password', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.changePassword)
router.post('/logout', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.userLogout)

export default router