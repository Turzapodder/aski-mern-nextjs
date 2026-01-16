import mongoose from "mongoose";
import QuizQuestionModel from "../models/QuizQuestion.js";
import AdminLogModel from "../models/AdminLog.js";

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options.map((option) => sanitizeText(option)).filter(Boolean);
};

class AdminQuizController {
  static getQuestions = async (req, res) => {
    try {
      const page = parseNumber(req.query.page, 1);
      const limit = parseNumber(req.query.limit, 20);
      const category = req.query.category;
      const difficulty = req.query.difficulty;
      const status = req.query.status;
      const search = req.query.search;

      const filter = {};
      if (category && category !== "all") {
        filter.category = new RegExp(`^${category}$`, "i");
      }
      if (difficulty && difficulty !== "all") {
        filter.difficulty = difficulty;
      }
      if (status === "active") {
        filter.isActive = true;
      }
      if (status === "inactive") {
        filter.isActive = false;
      }
      if (search) {
        filter.question = new RegExp(search, "i");
      }

      const skip = (page - 1) * limit;

      const data = await QuizQuestionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await QuizQuestionModel.countDocuments(filter);

      return res.status(200).json({
        status: "success",
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch quiz questions",
      });
    }
  };

  static createQuestion = async (req, res) => {
    try {
      const {
        question,
        category,
        difficulty,
        options,
        correctIndex,
        points,
        isActive,
      } = req.body || {};

      const normalizedQuestion = sanitizeText(question);
      if (!normalizedQuestion) {
        return res.status(400).json({
          status: "failed",
          message: "Question text is required",
        });
      }

      const normalizedOptions = normalizeOptions(options);
      if (normalizedOptions.length !== 4) {
        return res.status(400).json({
          status: "failed",
          message: "Provide exactly 4 options",
        });
      }

      const parsedCorrectIndex = parseNumber(correctIndex, NaN);
      if (
        !Number.isFinite(parsedCorrectIndex) ||
        parsedCorrectIndex < 0 ||
        parsedCorrectIndex > 3
      ) {
        return res.status(400).json({
          status: "failed",
          message: "Correct answer index must be between 0 and 3",
        });
      }

      const parsedPoints = parseNumber(points, 1);
      if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
        return res.status(400).json({
          status: "failed",
          message: "Points must be a positive number",
        });
      }

      const created = await QuizQuestionModel.create({
        question: normalizedQuestion,
        category: sanitizeText(category),
        difficulty: difficulty || "Medium",
        options: normalizedOptions,
        correctIndex: parsedCorrectIndex,
        points: parsedPoints,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "CREATE_QUIZ_QUESTION",
        targetId: created._id,
        targetType: "QuizQuestion",
      });

      return res.status(201).json({
        status: "success",
        message: "Quiz question created",
        data: created,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to create quiz question",
      });
    }
  };

  static updateQuestion = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid question ID",
        });
      }

      const {
        question,
        category,
        difficulty,
        options,
        correctIndex,
        points,
        isActive,
      } = req.body || {};

      const update = {};

      if (question !== undefined) {
        const normalized = sanitizeText(question);
        if (!normalized) {
          return res.status(400).json({
            status: "failed",
            message: "Question text cannot be empty",
          });
        }
        update.question = normalized;
      }

      if (category !== undefined) {
        update.category = sanitizeText(category);
      }

      if (difficulty !== undefined) {
        update.difficulty = difficulty;
      }

      if (options !== undefined) {
        const normalizedOptions = normalizeOptions(options);
        if (normalizedOptions.length !== 4) {
          return res.status(400).json({
            status: "failed",
            message: "Provide exactly 4 options",
          });
        }
        update.options = normalizedOptions;
      }

      if (correctIndex !== undefined) {
        const parsedCorrectIndex = parseNumber(correctIndex, NaN);
        if (
          !Number.isFinite(parsedCorrectIndex) ||
          parsedCorrectIndex < 0 ||
          parsedCorrectIndex > 3
        ) {
          return res.status(400).json({
            status: "failed",
            message: "Correct answer index must be between 0 and 3",
          });
        }
        update.correctIndex = parsedCorrectIndex;
      }

      if (points !== undefined) {
        const parsedPoints = parseNumber(points, NaN);
        if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
          return res.status(400).json({
            status: "failed",
            message: "Points must be a positive number",
          });
        }
        update.points = parsedPoints;
      }

      if (isActive !== undefined) {
        update.isActive = Boolean(isActive);
      }

      const updated = await QuizQuestionModel.findByIdAndUpdate(id, update, {
        new: true,
      }).lean();

      if (!updated) {
        return res.status(404).json({
          status: "failed",
          message: "Quiz question not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "UPDATE_QUIZ_QUESTION",
        targetId: updated._id,
        targetType: "QuizQuestion",
      });

      return res.status(200).json({
        status: "success",
        message: "Quiz question updated",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to update quiz question",
      });
    }
  };

  static deleteQuestion = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid question ID",
        });
      }

      const deleted = await QuizQuestionModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        return res.status(404).json({
          status: "failed",
          message: "Quiz question not found",
        });
      }

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "DELETE_QUIZ_QUESTION",
        targetId: deleted._id,
        targetType: "QuizQuestion",
      });

      return res.status(200).json({
        status: "success",
        message: "Quiz question deleted",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to delete quiz question",
      });
    }
  };

  static duplicateQuestion = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid question ID",
        });
      }

      const question = await QuizQuestionModel.findById(id).lean();
      if (!question) {
        return res.status(404).json({
          status: "failed",
          message: "Quiz question not found",
        });
      }

      const created = await QuizQuestionModel.create({
        question: `${question.question} (Copy)`,
        category: question.category,
        difficulty: question.difficulty,
        options: question.options,
        correctIndex: question.correctIndex,
        points: question.points,
        isActive: question.isActive,
      });

      await AdminLogModel.create({
        adminId: req.user._id,
        actionType: "DUPLICATE_QUIZ_QUESTION",
        targetId: created._id,
        targetType: "QuizQuestion",
      });

      return res.status(201).json({
        status: "success",
        message: "Quiz question duplicated",
        data: created,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to duplicate quiz question",
      });
    }
  };
}

export default AdminQuizController;
