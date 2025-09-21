import ChatModel from '../models/Chat.js';
import UserModel from '../models/User.js';
import MessageModel from '../models/Message.js';

class ChatController {
  // Create a new chat
  static createChat = async (req, res) => {
    try {
      const { name, description, type = 'group', participants = [], tutorId } = req.body;
      const userId = req.user._id;

      console.log('Creating chat:', { type, tutorId, participants, userId: userId.toString() });

      let chatParticipants = [];
      let chatName = name;

      if (type === 'direct' && tutorId) {
        // For direct chats with a tutor
        const tutor = await UserModel.findById(tutorId).select('name email avatar');
        if (!tutor) {
          return res.status(404).json({
            status: 'failed',
            message: 'Tutor not found'
          });
        }

        // Check if direct chat already exists
        const existingChat = await ChatModel.findOne({
          type: 'direct',
          'participants.user': { $all: [userId, tutorId] },
          isActive: true
        }).populate('participants.user', 'name email avatar');

        if (existingChat) {
          return res.status(200).json({
            status: 'success',
            message: 'Direct chat already exists',
            chat: existingChat
          });
        }

        chatParticipants = [
          { user: userId, role: 'member' },
          { user: tutorId, role: 'member' }
        ];

        // Generate name for direct chat
        const currentUser = await UserModel.findById(userId).select('name');
        chatName = `${currentUser.name} & ${tutor.name}`;

      } else if (type === 'group') {
        // For group chats
        if (!participants || participants.length === 0) {
          return res.status(400).json({
            status: 'failed',
            message: 'Group chat must have at least one participant'
          });
        }

        // Validate all participants exist
        const validParticipants = await UserModel.find({
          _id: { $in: participants }
        }).select('_id');

        if (validParticipants.length !== participants.length) {
          return res.status(400).json({
            status: 'failed',
            message: 'Some participants not found'
          });
        }

        chatParticipants = [
          { user: userId, role: 'admin' },
          ...participants.map(participantId => ({
            user: participantId,
            role: 'member'
          }))
        ];
      }

      const newChat = new ChatModel({
        name: chatName,
        description,
        type,
        participants: chatParticipants,
        createdBy: userId,
        isActive: true,
        lastActivity: new Date()
      });

      await newChat.save();
      
      // Populate participants
      await newChat.populate('participants.user', 'name email avatar');
      await newChat.populate('createdBy', 'name email avatar');

      console.log('Chat created successfully:', newChat._id);

      res.status(201).json({
        status: 'success',
        message: 'Chat created successfully',
        chat: newChat
      });
    } catch (error) {
      console.error('Create chat error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to create chat'
      });
    }
  };

  // Get user's chats
  static getUserChats = async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user._id;

      console.log('Fetching chats for user:', userId.toString());

      const chats = await ChatModel.find({
        'participants.user': userId,
        isActive: true
      })
      .populate('participants.user', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name email avatar'
        }
      })
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Calculate unread count for each chat
      const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = await MessageModel.countDocuments({
            chat: chat._id,
            'readBy.user': { $ne: userId },
            sender: { $ne: userId },
            isDeleted: false
          });

          return {
            ...chat.toObject(),
            unreadCount
          };
        })
      );

      console.log(`Found ${chatsWithUnread.length} chats for user`);

      res.status(200).json({
        status: 'success',
        data: {
          chats: chatsWithUnread,
          currentPage: parseInt(page),
          totalPages: Math.ceil(chatsWithUnread.length / limit)
        }
      });
    } catch (error) {
      console.error('Get user chats error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch chats'
      });
    }
  };

  // Get chat details
  static getChatDetails = async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user._id;

      const chat = await ChatModel.findOne({
        _id: chatId,
        'participants.user': userId,
        isActive: true
      })
      .populate('participants.user', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name email avatar'
        }
      });

      if (!chat) {
        return res.status(404).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      res.status(200).json({
        status: 'success',
        chat
      });
    } catch (error) {
      console.error('Get chat details error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch chat details'
      });
    }
  };

  // Add participants to chat
  static addParticipants = async (req, res) => {
    try {
      const { chatId } = req.params;
      const { userId: newUserId } = req.body;
      const userId = req.user._id;

      const chat = await ChatModel.findOne({
        _id: chatId,
        'participants.user': userId,
        type: 'group',
        isActive: true
      });

      if (!chat) {
        return res.status(404).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      // Check if user is already a participant
      const isAlreadyParticipant = chat.participants.some(
        p => p.user.toString() === newUserId
      );

      if (isAlreadyParticipant) {
        return res.status(400).json({
          status: 'failed',
          message: 'User is already a participant'
        });
      }

      // Add new participant
      chat.participants.push({
        user: newUserId,
        role: 'member'
      });

      await chat.save();
      await chat.populate('participants.user', 'name email avatar');

      res.status(200).json({
        status: 'success',
        message: 'Participant added successfully',
        chat
      });
    } catch (error) {
      console.error('Add participants error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to add participant'
      });
    }
  };

  // Remove participant from chat
  static removeParticipant = async (req, res) => {
    try {
      const { chatId, participantId } = req.params;
      const userId = req.user._id;

      const chat = await ChatModel.findOne({
        _id: chatId,
        'participants.user': userId,
        type: 'group',
        isActive: true
      });

      if (!chat) {
        return res.status(404).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      // Check if user has permission (admin or removing themselves)
      const currentUserParticipant = chat.participants.find(
        p => p.user.toString() === userId.toString()
      );

      if (currentUserParticipant.role !== 'admin' && userId.toString() !== participantId) {
        return res.status(403).json({
          status: 'failed',
          message: 'Permission denied'
        });
      }

      // Remove participant
      chat.participants = chat.participants.filter(
        p => p.user.toString() !== participantId
      );

      await chat.save();
      await chat.populate('participants.user', 'name email avatar');

      res.status(200).json({
        status: 'success',
        message: 'Participant removed successfully',
        chat
      });
    } catch (error) {
      console.error('Remove participant error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to remove participant'
      });
    }
  };

  // Leave chat
  static leaveChat = async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user._id;

      const chat = await ChatModel.findOne({
        _id: chatId,
        'participants.user': userId,
        isActive: true
      });

      if (!chat) {
        return res.status(404).json({
          status: 'failed',
          message: 'Chat not found or access denied'
        });
      }

      // For direct chats, deactivate the chat
      if (chat.type === 'direct') {
        chat.isActive = false;
        await chat.save();
      } else {
        // For group chats, remove the user
        chat.participants = chat.participants.filter(
          p => p.user.toString() !== userId.toString()
        );

        // If no participants left, deactivate the chat
        if (chat.participants.length === 0) {
          chat.isActive = false;
        }

        await chat.save();
      }

      res.status(200).json({
        status: 'success',
        message: 'Left chat successfully'
      });
    } catch (error) {
      console.error('Leave chat error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to leave chat'
      });
    }
  };

  // Search tutors for creating direct chats
  static searchTutors = async (req, res) => {
    try {
      const { search = '', limit = 30 } = req.query;
      const userId = req.user._id;

      console.log('Searching tutors:', { search, limit });

      let searchQuery = {
        _id: { $ne: userId }, // Exclude current user
        isActive: true
      };

      // Add search criteria if provided
      if (search.trim()) {
        searchQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subjects: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const tutors = await UserModel.find(searchQuery)
        .select('name email avatar subjects')
        .limit(parseInt(limit));

      console.log(`Found ${tutors.length} tutors`);

      res.status(200).json({
        status: 'success',
        tutors
      });
    } catch (error) {
      console.error('Search tutors error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to search tutors'
      });
    }
  };
}

export default ChatController;