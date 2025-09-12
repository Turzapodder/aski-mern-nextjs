import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import ChatModel from '../models/Chat.js';
import MessageModel from '../models/Message.js';

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.typingUsers = new Map(); // chatId -> Set of userIds
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_HOST,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
        const user = await UserModel.findById(decoded.userID).select('-password');
        
        if (!user || user.status !== 'active') {
          return next(new Error('Invalid user or user is inactive'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('Socket.IO server initialized');
    return this.io;
  }

  handleConnection(socket) {
    const userId = socket.userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Join user to their chat rooms
    this.joinUserChats(socket, userId);

    // Handle socket events
    this.setupSocketEvents(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  async joinUserChats(socket, userId) {
    try {
      const userChats = await ChatModel.find({
        'participants.user': userId,
        isActive: true
      }).select('_id');

      userChats.forEach(chat => {
        socket.join(chat._id.toString());
      });

      console.log(`User ${userId} joined ${userChats.length} chat rooms`);
    } catch (error) {
      console.error('Error joining user chats:', error);
    }
  }

  setupSocketEvents(socket) {
    const userId = socket.userId;

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', replyTo } = data;

        // Verify user is participant
        const chat = await ChatModel.findOne({
          _id: chatId,
          'participants.user': userId,
          isActive: true
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Create and save message
        const newMessage = new MessageModel({
          chat: chatId,
          sender: userId,
          content,
          type,
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

        // Broadcast message to all chat participants
        this.io.to(chatId).emit('new_message', {
          message: newMessage,
          chatId
        });

        // Stop typing indicator for this user
        this.handleStopTyping(socket, chatId);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      this.handleStartTyping(socket, data.chatId);
    });

    socket.on('typing_stop', (data) => {
      this.handleStopTyping(socket, data.chatId);
    });

    // Handle joining a chat
    socket.on('join_chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user is participant
        const chat = await ChatModel.findOne({
          _id: chatId,
          'participants.user': userId
        });

        if (chat) {
          socket.join(chatId);
          socket.emit('joined_chat', { chatId });
        } else {
          socket.emit('error', { message: 'Chat not found or access denied' });
        }
      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving a chat
    socket.on('leave_chat', (data) => {
      const { chatId } = data;
      socket.leave(chatId);
      this.handleStopTyping(socket, chatId);
      socket.emit('left_chat', { chatId });
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user is participant
        const chat = await ChatModel.findOne({
          _id: chatId,
          'participants.user': userId
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Update messages as read
        await MessageModel.updateMany(
          {
            chat: chatId,
            'readBy.user': { $ne: userId },
            isDeleted: false
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

        // Notify other participants about read status
        socket.to(chatId).emit('messages_read', {
          chatId,
          userId,
          readAt: new Date()
        });

      } catch (error) {
        console.error('Mark messages read error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle user presence
    socket.on('update_presence', (data) => {
      const { status } = data; // online, away, busy
      socket.broadcast.emit('user_presence_updated', {
        userId,
        status,
        lastSeen: new Date()
      });
    });
  }

  handleStartTyping(socket, chatId) {
    const userId = socket.userId;
    
    if (!this.typingUsers.has(chatId)) {
      this.typingUsers.set(chatId, new Set());
    }
    
    this.typingUsers.get(chatId).add(userId);
    
    // Notify other participants
    socket.to(chatId).emit('user_typing', {
      chatId,
      userId,
      userName: socket.user.name
    });
  }

  handleStopTyping(socket, chatId) {
    const userId = socket.userId;
    
    if (this.typingUsers.has(chatId)) {
      this.typingUsers.get(chatId).delete(userId);
      
      if (this.typingUsers.get(chatId).size === 0) {
        this.typingUsers.delete(chatId);
      }
    }
    
    // Notify other participants
    socket.to(chatId).emit('user_stopped_typing', {
      chatId,
      userId
    });
  }

  handleDisconnection(socket) {
    const userId = this.userSockets.get(socket.id);
    
    if (userId) {
      console.log(`User ${userId} disconnected`);
      
      // Remove from connected users
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      
      // Clean up typing indicators
      this.typingUsers.forEach((typingSet, chatId) => {
        if (typingSet.has(userId)) {
          typingSet.delete(userId);
          socket.to(chatId).emit('user_stopped_typing', {
            chatId,
            userId
          });
        }
      });
      
      // Broadcast user offline status
      socket.broadcast.emit('user_presence_updated', {
        userId,
        status: 'offline',
        lastSeen: new Date()
      });
    }
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  emitToChat(chatId, event, data) {
    this.io.to(chatId).emit(event, data);
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;