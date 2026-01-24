import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'offer'],
    default: 'text'
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });

// Validation: Either content or attachments must be present
messageSchema.pre('save', function(next) {
  const hasContent = Boolean(this.content && this.content.trim().length > 0);
  const hasAttachments = Array.isArray(this.attachments) && this.attachments.length > 0;
  const isOffer = this.type === 'offer';

  if (!hasContent && !hasAttachments && !isOffer) {
    return next(new Error('Message must have either content or attachments'));
  }

  if (isOffer && (!this.meta || typeof this.meta !== 'object')) {
    return next(new Error('Offer message must include metadata'));
  }

  return next();
});

const MessageModel = mongoose.model('message', messageSchema);

export default MessageModel;
