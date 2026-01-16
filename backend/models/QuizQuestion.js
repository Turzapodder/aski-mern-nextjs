import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    options: {
      type: [String],
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4,
        message: "Options must include exactly 4 items",
      },
    },
    correctIndex: { type: Number, min: 0, max: 3, required: true },
    points: { type: Number, min: 1, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quizQuestionSchema.index({ category: 1 });
quizQuestionSchema.index({ difficulty: 1 });
quizQuestionSchema.index({ isActive: 1 });

const QuizQuestionModel = mongoose.model("quizQuestion", quizQuestionSchema);

export default QuizQuestionModel;
