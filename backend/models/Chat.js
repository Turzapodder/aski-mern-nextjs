import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'group'
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  assignmentTitle: {
    type: String,
    trim: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  avatar: {
    type: String // URL for chat/group avatar
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isLockedUntil: {
    type: Date,
    description: "The date-time until which this chat remains locked. Null if never locked."
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    description: "Reference to the tutoring session that triggered this chat"
  }
}, {
  timestamps: true
});

// Index for better query performance
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ type: 1 });
chatSchema.index({ assignment: 1 });
chatSchema.index({ assignmentTitle: 1 });

const ChatModel = mongoose.model('chat', chatSchema);

export default ChatModel;
