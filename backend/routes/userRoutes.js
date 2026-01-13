// backend\routes\userRoutes.js
import express from 'express';
import UserController from '../controllers/userController.js';
import { generateQuiz } from '../controllers/quizController.js';
import passport from 'passport';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';

const router = express.Router();
// Public Routes
router.post('/register', UserController.userRegistration);
router.post('/verify-email', UserController.verifyEmail);
router.post('/login', UserController.userLogin);
router.post('/refresh-token', UserController.getNewAccessToken);
router.post('/reset-password-link', UserController.sendUserPasswordResetEmail);
router.post('/reset-password/:id/:token', UserController.userPasswordReset);
router.post('/generate-quiz', generateQuiz);


//Protected Routes
router.get('/profile', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.userProfile)
router.put('/profile', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.updateUserProfile)
router.post('/change-password', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.changePassword)
router.post('/logout', AccessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), UserController.userLogout)

export default router