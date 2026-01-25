import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import ChatModel from '../models/Chat.js';
import MessageModel from '../models/Message.js';
import ProposalModel from '../models/Proposal.js';
import logger from '../utils/logger.js';

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> { socketId, userInfo }
    this.userSockets = new Map(); // socketId -> userId
    this.typingUsers = new Map(); // chatId -> Set of userIds
    this.chatRooms = new Map(); // chatId -> Set of socketIds
    this.readThrottle = new Map(); // `${chatId}:${userId}` -> last timestamp
  }

  async canTutorSendMessage(chat, socketUser) {
    const roles = Array.isArray(socketUser.roles) ? socketUser.roles : [];
    const isTutor = roles.includes('tutor');

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

    if (proposal.tutor.toString() !== socketUser._id.toString()) {
      return { allowed: true };
    }

    const gate = process.env.CHAT_TUTOR_MESSAGE_GATE || 'user_first';
    if (gate === 'proposal_accepted' && proposal.status !== 'accepted') {
      return { allowed: false, reason: 'Proposal must be accepted before messaging' };
    }

    if (gate === 'user_first') {
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
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [process.env.FRONTEND_HOST || "http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const parseCookies = (header = '') => header.split(';').reduce((acc, part) => {
          const [rawKey, ...rest] = part.trim().split('=');
          if (!rawKey) return acc;
          acc[rawKey] = decodeURIComponent(rest.join('=') || '');
          return acc;
        }, {});

        const authHeader = socket.handshake.headers.authorization;
        const headerToken = authHeader ? authHeader.split(' ')[1] : undefined;
        const cookieHeader = socket.handshake.headers.cookie || '';
        const cookies = parseCookies(cookieHeader);
        const cookieToken = cookies.accessToken || cookies.refreshToken;
        const token = socket.handshake.auth?.token || headerToken || cookieToken;
        
        if (!token) {
          logger.warn('Socket connection denied: No token provided');
          return next(new Error('Authentication token required'));
        }

        // Try to decode the token - handle both userID and _id formats
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
        } catch (jwtError) {
          // Try with refresh token secret as fallback
          try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);
          } catch (fallbackError) {
            logger.error('JWT verification failed:', jwtError.message);
            return next(new Error('Invalid authentication token'));
          }
        }

        // Handle different token formats
        const userId = decoded.userID || decoded._id || decoded.id;
        if (!userId) {
          logger.error('No user ID found in token:', decoded);
          return next(new Error('Invalid token: no user ID'));
        }

        const user = await UserModel.findById(userId).select('-password');
        
        if (!user) {
          logger.warn(`User not found for ID: ${userId}`);
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        
        logger.info(`Socket authentication successful for user: ${user.name} (${user._id})`);
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error.message);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('🔌 Socket.IO server initialized and ready for real-time communication');
    return this.io;
  }

  async handleConnection(socket) {
    const userId = socket.userId;
    const userName = socket.user.name;
    
    logger.info(`👤 User ${userName} (${userId}) connected with socket ${socket.id}`);

    // Store user connection
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      userInfo: {
        _id: socket.user._id,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar
      }
    });
    this.userSockets.set(socket.id, userId);

    // Join user to their chat rooms
    await this.joinUserChats(socket, userId);

    // Send initial online users snapshot to the newly connected client
    socket.emit('online_users', {
      users: this.getOnlineUsers()
    });

    // Broadcast user online status
    socket.broadcast.emit('user_online', {
      userId: userId,
      status: 'online',
      userData: {
        _id: socket.user._id,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar
      }
    });

    // Handle socket events
    this.setupSocketEvents(socket);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to chat server',
      userId: userId,
      socketId: socket.id
    });
  }

  async joinUserChats(socket, userId) {
    try {
      const userChats = await ChatModel.find({
        'participants.user': userId,
        isActive: true
      }).select('_id name');

      for (const chat of userChats) {
        const chatId = chat._id.toString();
        socket.join(chatId);
        
        // Track chat rooms
        if (!this.chatRooms.has(chatId)) {
          this.chatRooms.set(chatId, new Set());
        }
        this.chatRooms.get(chatId).add(socket.id);
      }

      logger.info(`🏠 User ${socket.user.name} joined ${userChats.length} chat rooms`);
    } catch (error) {
      logger.error('Error joining user chats:', error);
    }
  }

  setupSocketEvents(socket) {
    const userId = socket.userId;
    const userName = socket.user.name;

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', replyTo } = data;

        logger.info(`📤 User ${userName} sending message to chat ${chatId}: "${content?.substring(0, 50)}..."`);

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

        const gate = await this.canTutorSendMessage(chat, socket.user);
        if (!gate.allowed) {
          socket.emit('error', { message: gate.reason || 'Message not allowed' });
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
          chatId: chatId
        });

        // Stop typing indicator for this user
        this.handleStopTyping(socket, chatId);

        logger.info(`✅ Message sent successfully by ${userName} to chat ${chatId}`);

      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      try {
        const { chatId } = data;
        this.handleStartTyping(socket, chatId);
      } catch (error) {
        logger.error('Typing start error:', error);
      }
    });

    socket.on('typing_stop', (data) => {
      try {
        const { chatId } = data;
        this.handleStopTyping(socket, chatId);
      } catch (error) {
        logger.error('Typing stop error:', error);
      }
    });

    // Handle joining a chat
    socket.on('join_chat', async (data) => {
      try {
        const { chatId } = data;
        
        logger.info(`User ${userName} joining chat: ${chatId}`);

        // Verify user is participant
        const chat = await ChatModel.findOne({
          _id: chatId,
          'participants.user': userId,
          isActive: true
        });

        if (chat) {
          socket.join(chatId);
          
          // Track chat rooms
          if (!this.chatRooms.has(chatId)) {
            this.chatRooms.set(chatId, new Set());
          }
          this.chatRooms.get(chatId).add(socket.id);

          // Notify user they joined successfully
          socket.emit('joined_chat', { chatId });
          
          // Notify others in the chat
          socket.to(chatId).emit('user_joined_chat', {
            chatId,
            user: {
              _id: socket.user._id,
              name: socket.user.name,
              email: socket.user.email
            }
          });

          logger.info(`✅ User ${userName} successfully joined chat: ${chatId}`);
        } else {
          socket.emit('error', { message: 'Chat not found or access denied' });
        }
      } catch (error) {
        logger.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving a chat
    socket.on('leave_chat', (data) => {
      try {
        const { chatId } = data;
        
        logger.info(`User ${userName} leaving chat: ${chatId}`);
        
        socket.leave(chatId);
        
        // Remove from chat rooms tracking
        if (this.chatRooms.has(chatId)) {
          this.chatRooms.get(chatId).delete(socket.id);
          if (this.chatRooms.get(chatId).size === 0) {
            this.chatRooms.delete(chatId);
          }
        }

        this.handleStopTyping(socket, chatId);
        
        socket.emit('left_chat', { chatId });
        
        // Notify others in the chat
        socket.to(chatId).emit('user_left_chat', {
          chatId,
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            email: socket.user.email
          }
        });
      } catch (error) {
        logger.error('Leave chat error:', error);
      }
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      try {
        const { chatId } = data;
        
        const throttleKey = `${chatId}:${userId}`;
        const now = Date.now();
        const lastReadAt = this.readThrottle.get(throttleKey) || 0;
        if (now - lastReadAt < 1500) {
          return;
        }
        this.readThrottle.set(throttleKey, now);

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

        // Update messages as read
        const updateResult = await MessageModel.updateMany(
          {
            chat: chatId,
            'readBy.user': { $ne: userId },
            sender: { $ne: userId }, // Don't mark own messages as read
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

        if (updateResult.modifiedCount > 0) {
          logger.info(`Marked ${updateResult.modifiedCount} messages as read for user ${userName}`);

          // Notify other participants about read status
          socket.to(chatId).emit('messages_read', {
            chatId,
            userId: userId,
            readAt: new Date()
          });
        }

      } catch (error) {
        logger.error('Mark messages read error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle user presence updates
    socket.on('update_presence', (data) => {
      try {
        const { status } = data; // online, away, busy
        socket.broadcast.emit('user_presence_updated', {
          userId,
          status,
          lastSeen: new Date()
        });
        logger.info(`User ${userName} updated presence to: ${status}`);
      } catch (error) {
        logger.error('Update presence error:', error);
      }
    });
  }

  handleStartTyping(socket, chatId) {
    const userId = socket.userId;
    const userName = socket.user.name;
    
    if (!this.typingUsers.has(chatId)) {
      this.typingUsers.set(chatId, new Set());
    }
    
    this.typingUsers.get(chatId).add(userId);
    
    // Notify other participants (exclude sender)
    socket.to(chatId).emit('user_typing', {
      chatId,
      userId,
      userName
    });

    logger.info(`User ${userName} started typing in chat: ${chatId}`);
  }

  handleStopTyping(socket, chatId) {
    const userId = socket.userId;
    const userName = socket.user.name;
    
    if (this.typingUsers.has(chatId)) {
      this.typingUsers.get(chatId).delete(userId);
      
      if (this.typingUsers.get(chatId).size === 0) {
        this.typingUsers.delete(chatId);
      }
    }
    
    // Notify other participants (exclude sender)
    socket.to(chatId).emit('user_stopped_typing', {
      chatId,
      userId
    });

    logger.info(`User ${userName} stopped typing in chat: ${chatId}`);
  }

  handleDisconnection(socket, reason) {
    const userId = this.userSockets.get(socket.id);
    
    if (userId) {
      const userInfo = this.connectedUsers.get(userId);
      logger.info(`👋 User ${userInfo?.userInfo?.name || userId} disconnected (${reason})`);
      
      // Remove from connected users
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      
      // Remove from all chat rooms
      this.chatRooms.forEach((socketIds, chatId) => {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          
          // Notify others in the chat
          socket.to(chatId).emit('user_left_chat', {
            chatId,
            user: socket.user ? {
              _id: socket.user._id,
              name: socket.user.name,
              email: socket.user.email
            } : null
          });
        }
        
        // Clean up empty chat rooms
        if (socketIds.size === 0) {
          this.chatRooms.delete(chatId);
        }
      });
      
      // Clean up typing indicators
      this.typingUsers.forEach((typingSet, chatId) => {
        if (typingSet.has(userId)) {
          typingSet.delete(userId);
          socket.to(chatId).emit('user_stopped_typing', {
            chatId,
            userId
          });
          
          if (typingSet.size === 0) {
            this.typingUsers.delete(chatId);
          }
        }
      });
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: userId,
        userData: userInfo?.userInfo || null
      });
    }
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.values()).map(connection => connection.userInfo);
  }

  getOnlineUserIds() {
    return Array.from(this.connectedUsers.keys());
  }

  emitToUser(userId, event, data) {
    const connection = this.connectedUsers.get(userId);
    if (connection) {
      this.io.to(connection.socketId).emit(event, data);
      return true;
    }
    return false;
  }

  emitToChat(chatId, event, data) {
    this.io.to(chatId).emit(event, data);
    logger.info(`Emitted ${event} to chat ${chatId}`);
  }

  sendToChat(chatId, event, data) {
    return this.emitToChat(chatId, event, data);
  }

  getChatUsers(chatId) {
    const chatSockets = this.chatRooms.get(chatId);
    if (!chatSockets) return [];
    
    const users = [];
    chatSockets.forEach(socketId => {
      const userId = this.userSockets.get(socketId);
      if (userId && this.connectedUsers.has(userId)) {
        users.push(this.connectedUsers.get(userId).userInfo);
      }
    });
    
    return users;
  }

  // Close all connections
  async close() {
    if (this.io) {
      logger.info('🔌 Closing Socket.IO server...');
      
      // Notify all clients about server shutdown
      this.io.emit('server_shutdown', {
        message: 'Server is shutting down',
        timestamp: new Date()
      });
      
      // Give clients time to receive the message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close all socket connections
      this.io.close();
      
      // Clear all maps
      this.connectedUsers.clear();
      this.userSockets.clear();
      this.typingUsers.clear();
      this.chatRooms.clear();
      
      logger.info('✅ Socket.IO server closed successfully');
    }
  }

  // Get server statistics
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeChats: this.chatRooms.size,
      typingUsers: Array.from(this.typingUsers.entries()).reduce((acc, [chatId, users]) => {
        acc[chatId] = users.size;
        return acc;
      }, {}),
      totalSockets: this.userSockets.size
    };
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;
