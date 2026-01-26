import MessageModel from '../models/Message.js';
import ChatModel from '../models/Chat.js';
import ProposalModel from '../models/Proposal.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/chat-files');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images, PDFs, and DOCX files
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDF, and DOCX files are allowed.'), false);
  }
};

const buildPublicFileUrl = (req, relativePath) => {
  if (!relativePath) return relativePath;
  if (relativePath.startsWith('http')) return relativePath;
  const baseUrl =
    process.env.BACKEND_PUBLIC_URL ||
    `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${relativePath}`;
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const CHAT_TUTOR_MESSAGE_GATE = process.env.CHAT_TUTOR_MESSAGE_GATE || 'user_first';
const READ_THROTTLE_MS = Number(process.env.CHAT_READ_THROTTLE_MS || 1500);
const readThrottleCache = new Map();

const shouldThrottleRead = (chatId, userId) => {
  const key = `${chatId}:${userId}`;
  const now = Date.now();
  const last = readThrottleCache.get(key) || 0;
  if (now - last < READ_THROTTLE_MS) {
    return true;
  }
  readThrottleCache.set(key, now);
  return false;
};

const canTutorSendMessage = async ({ chat, user }) => {
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  const isTutor = userRoles.includes('tutor');

  if (!isTutor || chat.type !== 'direct') {
    return { allowed: true };
  }

  const proposal = await ProposalModel.findOne({
    conversation: chat._id,
    isActive: true
  }).lean();

  if (!proposal) {
    return { allowed: false, reason: 'Submit a proposal to start conversation' };
  }

  if (proposal.tutor.toString() !== user._id.toString()) {
    return { allowed: true };
  }

  if (CHAT_TUTOR_MESSAGE_GATE === 'proposal_accepted' && proposal.status !== 'accepted') {
    return { allowed: false, reason: 'Proposal must be accepted before messaging' };
  }

  if (CHAT_TUTOR_MESSAGE_GATE === 'user_first') {
    const studentHasMessaged = await MessageModel.exists({
      chat: chat._id,
      sender: proposal.student,
      isDeleted: false
    });

    if (!studentHasMessaged) {
      return { allowed: false, reason: 'Wait for the student to start the conversation' };
    }
  }

  return { allowed: true };
};

class MessageController {
  // Send a text message (REST API backup - main sending happens via Socket.IO)
  static sendMessage = async (req, res) => {
    try {
      const { chatId, content, replyTo } = req.body;
      const chatIdFromParams = req.params.chatId;
      const userId = req.user._id;
      const socketManager = req.app.get('socketManager');

      const actualChatId = chatIdFromParams || chatId;

      console.log('📨 REST API SendMessage Request:', {
        chatIdFromBody: chatId,
        chatIdFromParams: chatIdFromParams,
        actualChatId: actualChatId,
        userId: userId.toString(),
        content: content?.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });

      // Verify user is participant of the chat
      const chat = await ChatModel.findOne({
        _id: actualChatId,
        'participants.user': userId,
        isActive: true
      });

      if (!chat) {
        console.log('❌ Chat access denied:', {
          actualChatId,
          userId: userId.toString(),
          reason: 'Chat not found or user not participant'
        });
        return res.status(403).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      const gate = await canTutorSendMessage({ chat, user: req.user });
      if (!gate.allowed) {
        return res.status(403).json({
          status: 'failed',
          message: gate.reason || 'Message not allowed'
        });
      }

      const newMessage = new MessageModel({
        chat: actualChatId,
        sender: userId,
        content,
        type: 'text',
        replyTo: replyTo || undefined
      });

      await newMessage.save();
      
      // Update chat's last message and activity
      chat.lastMessage = newMessage._id;
      chat.lastActivity = new Date();
      await chat.save();

      // Populate message details
      await newMessage.populate('sender', 'name email avatar');
      if (replyTo) {
        await newMessage.populate('replyTo');
      }

      // Send via Socket.IO to all chat participants
      if (socketManager) {
        socketManager.sendToChat(actualChatId, 'new_message', {
          message: newMessage,
          chatId: actualChatId
        });
        console.log('✅ Message sent via Socket.IO to chat:', actualChatId);
      }

      console.log('✅ Message sent successfully via REST API:', {
        messageId: newMessage._id,
        chatId: actualChatId,
        sender: userId.toString()
      });

      res.status(201).json({
        status: 'success',
        message: 'Message sent successfully',
        data: newMessage
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to send message'
      });
    }
  };

  // Send a message with file attachments
  static sendFileMessage = async (req, res) => {
    try {
      const { chatId, content, replyTo } = req.body;
      const chatIdFromParams = req.params.chatId;
      const userId = req.user._id;
      const files = req.files;
      const socketManager = req.app.get('socketManager');

      const actualChatId = chatIdFromParams || chatId;

      if (!files || files.length === 0) {
        return res.status(400).json({
          status: 'failed',
          message: 'No files uploaded'
        });
      }

      // Verify user is participant of the chat
      const chat = await ChatModel.findOne({
        _id: actualChatId,
        'participants.user': userId,
        isActive: true
      });

      if (!chat) {
        return res.status(403).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      const gate = await canTutorSendMessage({ chat, user: req.user });
      if (!gate.allowed) {
        return res.status(403).json({
          status: 'failed',
          message: gate.reason || 'Message not allowed'
        });
      }

      // Process file attachments
      const attachments = files.map(file => {
        const relativeUrl = `/uploads/chat-files/${file.filename}`;
        return {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: buildPublicFileUrl(req, relativeUrl)
        };
      });

      // Determine message type based on file types
      const hasImages = attachments.some(att => att.mimetype.startsWith('image/'));
      const messageType = hasImages ? 'image' : 'file';

      const newMessage = new MessageModel({
        chat: actualChatId,
        sender: userId,
        content: content || '',
        type: messageType,
        attachments,
        replyTo: replyTo || undefined
      });

      await newMessage.save();
      
      // Update chat's last message and activity
      chat.lastMessage = newMessage._id;
      chat.lastActivity = new Date();
      await chat.save();

      // Populate message details
      await newMessage.populate('sender', 'name email avatar');
      if (replyTo) {
        await newMessage.populate('replyTo');
      }

      // Send via Socket.IO to all chat participants
      if (socketManager) {
        socketManager.sendToChat(actualChatId, 'new_message', {
          message: newMessage,
          chatId: actualChatId
        });
        console.log('✅ File message sent via Socket.IO to chat:', actualChatId);
      }

      res.status(201).json({
        status: 'success',
        message: 'File message sent successfully',
        data: newMessage
      });
    } catch (error) {
      console.error('Send file message error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to send file message'
      });
    }
  };

  // Get messages for a chat
  static getChatMessages = async (req, res) => {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user._id;

      console.log('📥 Fetching messages for chat:', {
        chatId,
        userId: userId.toString(),
        page,
        limit
      });

      // Verify user is participant of the chat
      const chat = await ChatModel.findOne({
        _id: chatId,
        'participants.user': userId
      });

      if (!chat) {
        return res.status(403).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 50;

      const totalMessages = await MessageModel.countDocuments({
        chat: chatId,
        isDeleted: { $ne: true }
      });

      const skipCount = Math.max(totalMessages - pageNumber * limitNumber, 0);

      const messages = await MessageModel.find({
        chat: chatId,
        isDeleted: { $ne: true }
      })
        .populate('sender', 'name email avatar')
        .populate({
          path: 'replyTo',
          populate: {
            path: 'sender',
            select: 'name email avatar'
          }
        })
        .sort({ createdAt: 1 })
        .limit(limitNumber)
        .skip(skipCount);

      console.log('✅ Messages fetched successfully:', {
        chatId,
        messageCount: messages.length
      });

      res.status(200).json({
        status: 'success',
        data: {
          messages,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalMessages / limitNumber),
          totalMessages
        }
      });
    } catch (error) {
      console.error('Get chat messages error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch messages'
      });
    }
  };

  // Mark messages as read
  static markMessagesAsRead = async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user._id;
      const socketManager = req.app.get('socketManager');

      // Verify user is participant of the chat
      const chat = await ChatModel.findOne({
        _id: chatId,
        'participants.user': userId
      });

      if (!chat) {
        return res.status(403).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      if (shouldThrottleRead(chatId, userId.toString())) {
        return res.status(200).json({
          status: 'success',
          message: 'Messages already marked as read',
          markedCount: 0,
          throttled: true
        });
      }

      // Update all unread messages in this chat
      const updateResult = await MessageModel.updateMany(
        {
          chat: chatId,
          'readBy.user': { $ne: userId },
          sender: { $ne: userId }, // Don't mark own messages as read
          isDeleted: { $ne: true }
        },
        {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log(`✅ Marked ${updateResult.modifiedCount} messages as read`);

        // Notify via Socket.IO
        if (socketManager) {
          socketManager.sendToChat(chatId, 'messages_read', {
            chatId,
            userId: userId.toString()
          });
        }
      }

      res.status(200).json({
        status: 'success',
        message: 'Messages marked as read',
        markedCount: updateResult.modifiedCount
      });
    } catch (error) {
      console.error('Mark messages as read error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to mark messages as read'
      });
    }
  };

  // Delete a message
  static deleteMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user._id;
      const socketManager = req.app.get('socketManager');

      const message = await MessageModel.findOne({
        _id: messageId,
        sender: userId
      });

      if (!message) {
        return res.status(404).json({
          status: 'failed',
          message: 'Message not found or access denied'
        });
      }

      message.isDeleted = true;
      message.deletedAt = new Date();
      await message.save();

      // Notify via Socket.IO
      if (socketManager) {
        socketManager.sendToChat(message.chat.toString(), 'message_deleted', {
          messageId: messageId,
          chatId: message.chat.toString()
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to delete message'
      });
    }
  };

  // Edit a message
  static editMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user._id;
      const socketManager = req.app.get('socketManager');

      const message = await MessageModel.findOne({
        _id: messageId,
        sender: userId,
        type: 'text',
        isDeleted: false
      });

      if (!message) {
        return res.status(404).json({
          status: 'failed',
          message: 'Message not found or cannot be edited'
        });
      }

      message.content = content;
      message.editedAt = new Date();
      await message.save();

      await message.populate('sender', 'name email avatar');

      // Notify via Socket.IO
      if (socketManager) {
        socketManager.sendToChat(message.chat.toString(), 'message_edited', {
          message: message,
          chatId: message.chat.toString()
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Message edited successfully',
        data: message
      });
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to edit message'
      });
    }
  };
}

export default MessageController;
