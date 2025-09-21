import mongoose from 'mongoose';

const studentFormSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  formData: {
    projectName: String,
    description: String,
    subject: String,
    topics: [String],
    deadline: Date,
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      buffer: Buffer // Store file data as buffer
    }],
    estimatedCost: Number
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'converted', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Auto-delete expired forms
studentFormSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const StudentFormModel = mongoose.model('studentForm', studentFormSchema);

export default StudentFormModel;