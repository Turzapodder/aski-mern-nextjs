import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  // Basic assignment information
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
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  // Assignment details
  topics: {
    type: [String],
    default: []
  },
  deadline: {
    type: Date,
    required: true
  },
  estimatedCost: {
    type: Number,
    min: 0,
    default: 0
  },
  budget: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // File attachments
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
  
  // User relationships
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  assignedTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  requestedTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  
  // Assignment status and workflow
  status: {
    type: String,
    enum: [
      'draft',           // Created but not submitted
      'created',         // Created and visible for proposals
      'proposal_received', // At least one proposal received
      'proposal_accepted', // Proposal accepted, awaiting payment
      'in_progress',     // Payment confirmed, tutor working
      'submission_pending', // Tutor can submit work
      'revision_requested', // Student requested revision
      'pending',         // Legacy: Submitted, waiting for tutor assignment
      'assigned',        // Legacy: Tutor assigned, work in progress
      'submitted',       // Tutor submitted the work
      'completed',       // Student approved the work
      'disputed',        // Dispute opened by student or tutor
      'resolved',        // Dispute resolved
      'cancelled',       // Assignment cancelled
      'overdue'          // Past deadline without completion
    ],
    default: 'draft'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Submission details
  submissionDetails: {
    submittedAt: Date,
    submissionFiles: [{
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
    submissionLinks: [{
      url: { type: String, trim: true },
      label: { type: String, trim: true },
      addedAt: { type: Date, default: Date.now }
    }],
    submissionNotes: String
  },

  submissionHistory: [
    {
      submittedAt: Date,
      submissionFiles: [{
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
      submissionLinks: [{
        url: { type: String, trim: true },
        label: { type: String, trim: true },
        addedAt: { type: Date, default: Date.now }
      }],
      submissionNotes: String,
      revisionIndex: { type: Number, default: 0 }
    }
  ],

  revisionRequests: [
    {
      note: { type: String, trim: true },
      requestedAt: { type: Date, default: Date.now },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    }
  ],
  
  // Feedback and grading
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    feedbackDate: Date
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'disputed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    min: 0
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  tags: {
    type: [String],
    default: []
  },
  
  // Tracking fields
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date,
  
  // Communication
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chat'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
assignmentSchema.index({ student: 1, status: 1 });
assignmentSchema.index({ assignedTutor: 1, status: 1 });
assignmentSchema.index({ requestedTutor: 1, status: 1 });
assignmentSchema.index({ deadline: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ subject: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return (
    this.deadline < new Date() &&
    !['completed', 'cancelled', 'disputed', 'resolved'].includes(this.status)
  );
});

// Pre-save middleware to update status if overdue
assignmentSchema.pre('save', function(next) {
  if (
    this.isOverdue &&
    ['pending', 'created', 'proposal_received', 'submission_pending', 'in_progress'].includes(this.status)
  ) {
    this.status = 'overdue';
  }
  if (this.isModified('budget') && !this.isModified('estimatedCost')) {
    this.estimatedCost = this.budget ?? this.estimatedCost;
  }
  if (this.isModified('estimatedCost') && !this.isModified('budget')) {
    this.budget = this.estimatedCost ?? this.budget;
  }
  next();
});

// Static method to find assignments by user
assignmentSchema.statics.findByStudent = function(studentId, options = {}) {
  return this.find({ student: studentId, isActive: true, ...options })
    .populate('assignedTutor', 'name email profileImage')
    .sort({ createdAt: -1 });
};

assignmentSchema.statics.findByTutor = function(tutorId, options = {}) {
  return this.find({ assignedTutor: tutorId, isActive: true, ...options })
    .populate('student', 'name email profileImage')
    .sort({ createdAt: -1 });
};

// Instance method to check if user can edit
assignmentSchema.methods.canEdit = function(userId) {
  return this.student.toString() === userId.toString() && 
         ['draft', 'pending', 'created', 'proposal_received'].includes(this.status);
};

const AssignmentModel = mongoose.model('Assignment', assignmentSchema);

export default AssignmentModel;
