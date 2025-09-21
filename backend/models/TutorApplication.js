import mongoose from 'mongoose';

const tutorApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    university: { type: String, required: true },
    degree: { type: String, required: true },
    gpa: { type: String, required: true },
    country: { type: String, required: true }
  },
  academicInfo: {
    subject: { type: String, required: true },
    topics: [{ type: String, required: true }]
  },
  documents: {
    certificate: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String
    },
    profilePicture: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String
    }
  },
  quizResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'quizResult'
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  reviewedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
tutorApplicationSchema.index({ user: 1 });
tutorApplicationSchema.index({ applicationStatus: 1 });
tutorApplicationSchema.index({ createdAt: -1 });

const TutorApplicationModel = mongoose.model('tutorApplication', tutorApplicationSchema);

export default TutorApplicationModel;