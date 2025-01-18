import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();
// Public Routes
router.post('/register', UserController.userRegistration);
router.post('/verify-email', UserController.verifyEmail);
router.post('/login', UserController.userLogin);
router.post('/refresh-token', UserController.getNewAccessToken);

export default router