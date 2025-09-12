import ChatModel from '../models/Chat.js';
import MessageModel from '../models/Message.js';
import UserModel from '../models/User.js';
import mongoose from 'mongoose';

class ChatController {
  // Create a new chat/group
  static createChat = async (req, res) => {
    try {
      const { name, description, type = 'group', participants = [] } = req.body;
      const userId = req.user._id;

      // Validate participants
      const validParticipants = await UserModel.find({
        _id: { $in: participants },
        status: 'active'
      });

      if (validParticipants.length !== participants.length) {
        return res.status(400).json({
          status: 'failed',
          message: 'Some participants are invalid or inactive'
        });
      }

      // Create participants array with creator as admin
      const chatParticipants = [
        { user: userId, role: 'admin' },
        ...participants.filter(p => p.toString() !== userId.toString())
          .map(p => ({ user: p, role: 'member' }))
      ];

      const newChat = new ChatModel({
        name,
        description,
        type,
        participants: chatParticipants,
        createdBy: userId
      });

      await newChat.save();
      await newChat.populate('participants.user', 'name email avatar');
      await newChat.populate('createdBy', 'name email avatar');

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
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      const chats = await ChatModel.find({
        'participants.user': userId,
        isActive: true
      })
      .populate('participants.user', 'name email avatar')
      .populate('lastMessage')
      .populate('createdBy', 'name email avatar')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Get unread message counts for each chat
      const chatsWithUnreadCount = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = await MessageModel.countDocuments({
            chat: chat._id,
            'readBy.user': { $ne: userId },
            isDeleted: false
          });
          return {
            ...chat.toObject(),
            unreadCount
          };
        })
      );

      res.status(200).json({
        status: 'success',
        chats: chatsWithUnreadCount
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
        'participants.user': userId
      })
      .populate('participants.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

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
      const { participants } = req.body;
      const userId = req.user._id;

      const chat = await ChatModel.findOne({
        _id: chatId,
        'participants.user': userId,
        'participants.role': 'admin'
      });

      if (!chat) {
        return res.status(403).json({
          status: 'failed',
          message: 'Chat not found or insufficient permissions'
        });
      }

      // Validate new participants
      const validParticipants = await UserModel.find({
        _id: { $in: participants },
        status: 'active'
      });

      // Filter out already existing participants
      const existingParticipantIds = chat.participants.map(p => p.user.toString());
      const newParticipants = validParticipants
        .filter(p => !existingParticipantIds.includes(p._id.toString()))
        .map(p => ({ user: p._id, role: 'member' }));

      if (newParticipants.length === 0) {
        return res.status(400).json({
          status: 'failed',
          message: 'No new valid participants to add'
        });
      }

      chat.participants.push(...newParticipants);
      chat.lastActivity = new Date();
      await chat.save();

      await chat.populate('participants.user', 'name email avatar');

      res.status(200).json({
        status: 'success',
        message: 'Participants added successfully',
        chat
      });
    } catch (error) {
      console.error('Add participants error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to add participants'
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
        'participants.role': 'admin'
      });

      if (!chat) {
        return res.status(403).json({
          status: 'failed',
          message: 'Chat not found or insufficient permissions'
        });
      }

      chat.participants = chat.participants.filter(
        p => p.user.toString() !== participantId
      );
      chat.lastActivity = new Date();
      await chat.save();

      res.status(200).json({
        status: 'success',
        message: 'Participant removed successfully'
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
        'participants.user': userId
      });

      if (!chat) {
        return res.status(404).json({
          status: 'failed',
          message: 'Chat not found'
        });
      }

      chat.participants = chat.participants.filter(
        p => p.user.toString() !== userId.toString()
      );
      chat.lastActivity = new Date();
      await chat.save();

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

  // Search tutors
  static searchTutors = async (req, res) => {
    try {
      const { search = '', limit = 30 } = req.query;
      const currentUserId = req.user._id;
      
      // Build search query
      let searchQuery = {
        roles: 'tutor',
        _id: { $ne: currentUserId }, // Exclude current user
        isActive: true, // Only active users
        status: 'active' // Only non-suspended users
      };
      
      // Add text search if search term provided
      if (search.trim()) {
        searchQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subjects: { $elemMatch: { $regex: search, $options: 'i' } } }
        ];
      }
      
      const tutors = await UserModel.find(searchQuery)
        .select('name email subjects isActive lastSeen')
        .limit(parseInt(limit))
        .sort({ isActive: -1, lastSeen: -1 }); // Active users first, then by last seen
      
      // Add online status (you can enhance this with real-time data)
      const tutorsWithStatus = tutors.map(tutor => ({
        ...tutor.toObject(),
        isActive: tutor.isActive && (new Date() - tutor.lastSeen) < 5 * 60 * 1000 // Active if seen within 5 minutes
      }));
      
      res.status(200).json({
        status: 'success',
        tutors: tutorsWithStatus
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