import ChatModel from '../models/Chat.js';
import UserModel from '../models/User.js';
import MessageModel from '../models/Message.js';
import ProposalModel from '../models/Proposal.js';
import AssignmentModel from '../models/Assignment.js';

class ChatController {
  // Create a new chat
  static createChat = async (req, res) => {
    try {
      const {
        name,
        description,
        type = 'group',
        participants = [],
        tutorId,
        assignmentId,
        proposalId
      } = req.body;
      const userId = req.user._id;

      console.log('Creating chat:', { type, tutorId, participants, userId: userId.toString() });

      let chatParticipants = [];
      let chatName = name;
      let assignment = null;

      if (type === 'direct' && tutorId) {
        const isStudent =
          Array.isArray(req.user.roles) &&
          (req.user.roles.includes('student') || req.user.roles.includes('user'));

        if (!isStudent) {
          return res.status(403).json({
            status: 'failed',
            message: 'Only students can initiate direct chats'
          });
        }

        let proposal = null;
        if (proposalId) {
          proposal = await ProposalModel.findById(proposalId);
        } else if (assignmentId) {
          proposal = await ProposalModel.findOne({
            assignment: assignmentId,
            tutor: tutorId,
            student: userId,
            isActive: true
          });
        }
        
        // No longer returning 403 if proposal is missing, allowing direct contact.

        const tutor = await UserModel.findById(tutorId).select('name email avatar');
        if (!tutor) {
          return res.status(404).json({
            status: 'failed',
            message: 'Tutor not found'
          });
        }

        if (proposal && proposal.assignment) {
          assignment = await AssignmentModel.findById(proposal.assignment).select('title');
        } else if (assignmentId && mongoose.Types.ObjectId.isValid(assignmentId)) {
          assignment = await AssignmentModel.findById(assignmentId).select('title');
        }

        console.log('Resolved assignment:', assignment?._id, assignment?.title);

        // Check if direct chat already exists between these two users
        const existingChat = await ChatModel.findOne({
          type: 'direct',
          'participants.user': { $all: [userId, tutorId] },
          isActive: true
        }).populate('participants.user', 'name email avatar roles');

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
        if (!currentUser) {
          return res.status(401).json({
            status: 'failed',
            message: 'User not found in database'
          });
        }
        chatName = `${currentUser.name} & ${tutor.name}`;
        console.log('Generating chat name:', chatName);

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
        assignment: assignmentId || assignment?._id || undefined,
        assignmentTitle: assignment?.title || undefined,
        isActive: true,
        lastActivity: new Date()
      });

      await newChat.save();
      
      // Populate participants
      await newChat.populate('participants.user', 'name email avatar roles');
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
        message: 'Unable to create chat',
        error: error.message,
        details: error.errors ? Object.values(error.errors).map(e => e.message) : undefined
      });
    }
  };

  // Get user's chats
  static getUserChats = async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user._id;

      console.log('Fetching chats for user:', userId.toString());

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 20;

      const [totalChats, chats] = await Promise.all([
        ChatModel.countDocuments({
          'participants.user': userId,
          isActive: true
        }),
        ChatModel.find({
          'participants.user': userId,
          isActive: true
        })
          .populate('participants.user', 'name email avatar roles')
          .populate('createdBy', 'name email avatar')
          .populate('assignment', 'title description deadline estimatedCost budget student')
          .populate({
            path: 'lastMessage',
            populate: {
              path: 'sender',
              select: 'name email avatar'
            }
          })
          .sort({ lastActivity: -1 })
          .limit(limitNumber)
          .skip((pageNumber - 1) * limitNumber)
      ]);

      const chatIds = chats.map(chat => chat._id);
      let unreadCountsByChat = {};

      if (chatIds.length > 0) {
        const unreadCounts = await MessageModel.aggregate([
          {
            $match: {
              chat: { $in: chatIds },
              'readBy.user': { $ne: userId },
              sender: { $ne: userId },
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: '$chat',
              count: { $sum: 1 }
            }
          }
        ]);

        unreadCountsByChat = unreadCounts.reduce((acc, item) => {
          acc[item._id.toString()] = item.count;
          return acc;
        }, {});
      }

      const chatsWithUnread = chats.map(chat => ({
        ...chat.toObject(),
        unreadCount: unreadCountsByChat[chat._id.toString()] || 0
      }));

      console.log(`Found ${chatsWithUnread.length} chats for user`);

      res.status(200).json({
        status: 'success',
        data: {
          chats: chatsWithUnread,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalChats / limitNumber),
          totalChats
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
      .populate('participants.user', 'name email avatar roles')
      .populate('createdBy', 'name email avatar')
      .populate('assignment', 'title description deadline estimatedCost budget student')
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

  // Get active assignments between chat participants
  static getActiveAssignments = async (req, res) => {
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
          message: 'Chat not found'
        });
      }

      // Identify the participants in this chat
      const participants = chat.participants.map(p => p.user.toString());
      
      const assignments = await AssignmentModel.find({
        student: { $in: participants },
        assignedTutor: { $in: participants },
        status: { $in: ['created', 'proposal_received', 'proposal_accepted', 'assigned', 'in_progress', 'submitted'] }
      }).sort({ deadline: 1 });

      res.status(200).json({
        status: 'success',
        data: assignments
      });
    } catch (error) {
      console.error('Error fetching active assignments:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to fetch active assignments'
      });
    }
  };
}

export default ChatController;
