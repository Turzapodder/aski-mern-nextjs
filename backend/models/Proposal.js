import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  // Assignment reference
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  
  // Tutor who sent the proposal
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  
  // Student who will receive the proposal
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  
  // Proposal details
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Pricing and timeline
  proposedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  estimatedDeliveryTime: {
    type: Number, // in hours
    required: true,
    min: 1
  },
  
  // Proposal status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },

  // Conversation created for this proposal
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chat'
  },
  
  // Additional details
  coverLetter: {
    type: String,
    trim: true
  },
  
  // Tutor's relevant experience/qualifications for this assignment
  relevantExperience: {
    type: String,
    trim: true
  },
  
  // Attachments (portfolio, samples, etc.)
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Response from student
  studentResponse: {
    message: String,
    respondedAt: Date
  },
  
  // Timestamps for different actions
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  acceptedAt: Date,
  rejectedAt: Date,
  withdrawnAt: Date,
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  
  // For tracking proposal views
  viewedByStudent: {
    type: Boolean,
    default: false
  },
  
  viewedAt: Date
  
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
proposalSchema.index({ assignment: 1, tutor: 1 }, { unique: true }); // One proposal per tutor per assignment
proposalSchema.index({ assignment: 1, status: 1 });
proposalSchema.index({ tutor: 1, status: 1 });
proposalSchema.index({ student: 1, status: 1 });
proposalSchema.index({ submittedAt: -1 });
proposalSchema.index({ conversation: 1 });

// Virtual for checking if proposal is still valid
proposalSchema.virtual('isExpired').get(function() {
  // Proposals expire after 30 days if not responded to
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.status === 'pending' && this.submittedAt < thirtyDaysAgo;
});

// Static methods
proposalSchema.statics.findByAssignment = function(assignmentId, options = {}) {
  return this.find({ assignment: assignmentId, isActive: true, ...options })
    .populate('tutor', 'name profileImage tutorProfile publicStats')
    .populate('conversation', 'name assignment assignmentTitle')
    .sort({ submittedAt: -1 });
};

proposalSchema.statics.findByTutor = function(tutorId, options = {}) {
  return this.find({ tutor: tutorId, isActive: true, ...options })
    .populate('assignment', 'title subject deadline status')
    .populate('student', 'name profileImage')
    .populate('conversation', 'name assignment assignmentTitle')
    .sort({ submittedAt: -1 });
};

proposalSchema.statics.findByStudent = function(studentId, options = {}) {
  return this.find({ student: studentId, isActive: true, ...options })
    .populate('tutor', 'name profileImage tutorProfile publicStats')
    .populate('assignment', 'title subject deadline')
    .populate('conversation', 'name assignment assignmentTitle')
    .sort({ submittedAt: -1 });
};

// Instance methods
proposalSchema.methods.canEdit = function(userId) {
  return this.tutor.toString() === userId.toString() && this.status === 'pending';
};

proposalSchema.methods.canWithdraw = function(userId) {
  return this.tutor.toString() === userId.toString() && this.status === 'pending';
};

proposalSchema.methods.canRespond = function(userId) {
  return this.student.toString() === userId.toString() && this.status === 'pending';
};

// Pre-save middleware
proposalSchema.pre('save', function(next) {
  // Set response timestamps based on status changes
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'accepted':
        this.acceptedAt = now;
        break;
      case 'rejected':
        this.rejectedAt = now;
        break;
      case 'withdrawn':
        this.withdrawnAt = now;
        break;
    }
  }
  next();
});

const ProposalModel = mongoose.model('Proposal', proposalSchema);

export default ProposalModel;
