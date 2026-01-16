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
  
  // Assignment status and workflow
  status: {
    type: String,
    enum: [
      'draft',           // Created but not submitted
      'pending',         // Submitted, waiting for tutor assignment
      'assigned',        // Tutor assigned, work in progress
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
    submissionNotes: String
  },
  
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
  if (this.isOverdue && this.status === 'pending') {
    this.status = 'overdue';
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
         ['draft', 'pending'].includes(this.status);
};

const AssignmentModel = mongoose.model('Assignment', assignmentSchema);

export default AssignmentModel;
