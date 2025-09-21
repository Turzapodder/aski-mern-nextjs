import express from 'express';
import ChatController from '../controllers/chatController.js';
import MessageController, { upload } from '../controllers/messageController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';

const router = express.Router();

// Middleware to handle cookie-based authentication and refresh tokens
router.use(AccessTokenAutoRefresh);

// Middleware to protect all chat routes
router.use(checkUserAuth);

// Chat routes
router.post('/create', ChatController.createChat);
router.get('/list', ChatController.getUserChats);
router.get('/tutors/search', ChatController.searchTutors); // Move before /:chatId to avoid conflicts
router.get('/:chatId', ChatController.getChatDetails);
router.post('/:chatId/participants', ChatController.addParticipants);
router.delete('/:chatId/participants/:participantId', ChatController.removeParticipant);
router.post('/:chatId/leave', ChatController.leaveChat);

// Message routes
router.post('/:chatId/messages', MessageController.sendMessage);
router.post('/:chatId/messages/file', upload.array('files', 5), MessageController.sendFileMessage);
router.get('/:chatId/messages', MessageController.getChatMessages);
router.post('/:chatId/messages/read', MessageController.markMessagesAsRead);
router.put('/messages/:messageId', MessageController.editMessage);
router.delete('/messages/:messageId', MessageController.deleteMessage);

export default router;