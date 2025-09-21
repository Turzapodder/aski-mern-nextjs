import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topics: [{
    type: String,
    required: true
  }],
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  incorrectAnswers: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  topicPerformance: {
    type: Map,
    of: {
      total: Number,
      correct: Number,
      percentage: Number
    }
  },
  answers: [{
    questionId: Number,
    question: String, // Store the actual question text
    options: [String], // Store all answer options
    selectedAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    topic: String
  }],
  quizType: {
    type: String,
    enum: ['onboarding', 'practice', 'assessment'],
    default: 'practice'
  },
  status: {
    type: String,
    enum: ['completed', 'abandoned'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for better query performance
quizResultSchema.index({ user: 1, createdAt: -1 });
quizResultSchema.index({ subject: 1 });
quizResultSchema.index({ quizType: 1 });

const QuizResultModel = mongoose.model('quizResult', quizResultSchema);

export default QuizResultModel;