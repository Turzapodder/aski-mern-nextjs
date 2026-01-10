import { GoogleGenerativeAI } from '@google/generative-ai';
import QuizResultModel from '../models/QuizResult.js';

const hasGeminiKey = Boolean(process.env.GEMINI_KEY);
const genAI = hasGeminiKey ? new GoogleGenerativeAI(process.env.GEMINI_KEY) : null;

const cleanText = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const buildFallbackQuiz = (subject, topics, questionCount) => {
  const safeSubject = cleanText(subject) || "General";
  const topicList =
    Array.isArray(topics) && topics.length > 0
      ? topics.map((topic) => cleanText(topic)).filter(Boolean)
      : [safeSubject];

  const templates = [
    (topic) => ({
      question: `Which option best describes the core idea of ${topic}?`,
      options: [
        `It focuses on the fundamentals of ${topic}.`,
        `It describes a different subject outside ${safeSubject}.`,
        `It ignores ${topic} entirely.`,
        `It is unrelated to ${topic} and ${safeSubject}.`,
      ],
      correctAnswer: 0,
      explanation: `${topic} centers on its key concepts within ${safeSubject}.`,
      topic,
    }),
    (topic) => ({
      question: `Which scenario is the most direct application of ${topic}?`,
      options: [
        `Using ${topic} to solve a ${safeSubject} problem.`,
        `Avoiding ${topic} while solving ${safeSubject} problems.`,
        `Switching to an unrelated topic outside ${safeSubject}.`,
        `Skipping ${topic} altogether.`,
      ],
      correctAnswer: 0,
      explanation: `Applying ${topic} directly is the most relevant scenario.`,
      topic,
    }),
    (topic) => ({
      question: `What is the main goal when studying ${topic}?`,
      options: [
        `Understand and apply ${topic} principles.`,
        `Memorize unrelated facts from ${safeSubject}.`,
        `Avoid practicing ${topic}.`,
        `Skip ${topic} and focus on other topics.`,
      ],
      correctAnswer: 0,
      explanation: `The goal is to understand and apply ${topic}.`,
      topic,
    }),
    (topic) => ({
      question: `Which statement is most accurate about ${topic}?`,
      options: [
        `${topic} builds essential understanding in ${safeSubject}.`,
        `${topic} has no relevance to ${safeSubject}.`,
        `${topic} only applies outside ${safeSubject}.`,
        `${topic} cannot be learned or applied.`,
      ],
      correctAnswer: 0,
      explanation: `${topic} supports core knowledge in ${safeSubject}.`,
      topic,
    }),
  ];

  return Array.from({ length: questionCount }).map((_, index) => {
    const topic = topicList[index % topicList.length];
    const template = templates[index % templates.length];
    return template(topic);
  });
};

const extractQuizJson = (text) => {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(text);
};

const isRateLimitError = (error) => {
  const status = error?.status || error?.response?.status;
  const message = error?.message || "";
  return status === 429 || /quota|rate limit/i.test(message);
};

/**
 * Generate a quiz based on subject and topics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateQuiz = async (req, res) => {
  try {
    const { subject, topics } = req.body;
    const questionCount = 20;
    if (!subject || !topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request. Subject and topics array are required.' 
      });
    }

    const fallbackQuiz = buildFallbackQuiz(subject, topics, questionCount);

    if (!genAI) {
      return res.status(200).json({
        success: true,
        data: {
          subject,
          topics,
          questionCount: fallbackQuiz.length,
          questions: fallbackQuiz.map((question, index) => ({
            id: index + 1,
            ...question,
          })),
        },
        warning: "Quiz generated using fallback content.",
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create a more detailed prompt for better results
    const prompt = `Generate a quiz with ${questionCount} multiple choice questions are between beginner and intermediate level) about ${subject}, specifically covering these topics: ${topics.join(', ')}. 
    
    Format the response as a valid JSON array with each object having exactly these properties:
    - question (string): A clear, concise question
    - options (array of 4 strings): Four possible answers
    - correctAnswer (number 0-3): Index of the correct option
    - topic (string): Which of the provided topics this question relates to
    
    Questions should test understanding and application, not just memorization.
    Ensure the difficulty level is appropriate for beginner to intermediate level.
    Make sure the JSON is properly formatted with no syntax errors.`;

    let attempts = 0;
    const maxAttempts = 3;
    let quiz;
    let lastError;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        quiz = extractQuizJson(text);
        break;
      } catch (error) {
        lastError = error;
        if (isRateLimitError(error)) {
          break;
        }
        attempts += 1;
      }
    }

    // Validate quiz structure
    if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
      const warningMessage = isRateLimitError(lastError)
        ? "Quiz generated using fallback content due to rate limits."
        : "Quiz generated using fallback content due to a generation error.";

      return res.status(200).json({
        success: true,
        data: {
          subject,
          topics,
          questionCount: fallbackQuiz.length,
          questions: fallbackQuiz.map((question, index) => ({
            id: index + 1,
            ...question,
          })),
        },
        warning: warningMessage,
      });
    }

    // Ensure each question has the required properties
    const validatedQuiz = quiz.map((question, index) => ({
      id: index + 1,
      question: question.question || `Question ${index + 1}`,
      options: Array.isArray(question.options) && question.options.length === 4 
        ? question.options 
        : ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: typeof question.correctAnswer === 'number' && question.correctAnswer >= 0 && question.correctAnswer <= 3 
        ? question.correctAnswer 
        : 0,
      explanation: question.explanation || "No explanation provided",
      topic: question.topic || topics[0]
    }));

    res.json({
      success: true,
      data: {
        subject,
        topics,
        questionCount: validatedQuiz.length,
        questions: validatedQuiz
      }
    });
    
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate quiz',
      message: error.message
    });
  }
};

/**
 * Save quiz result to database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const saveQuizResult = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("saveQuizResult userId::", userId, "Req body::", req.body);
    const { 
      subject, 
      topics, 
      totalQuestions, 
      correctAnswers, 
      incorrectAnswers, 
      score, 
      timeSpent, 
      topicPerformance, 
      answers,
      questions,
      quizType = 'practice'
    } = req.body;

    // Validate required fields
    if (!subject || !topics || totalQuestions === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: subject, topics, totalQuestions, and score are required'
      });
    }

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);

    // Process answers to include complete quiz data
    let processedAnswers = [];
    if (answers && Array.isArray(answers)) {
      processedAnswers = answers.map((answer, index) => ({
        questionId: answer.questionId || index + 1,
        question: answer.question || (questions && questions[index] ? questions[index].question : ''),
        options: answer.options || (questions && questions[index] ? questions[index].options : []),
        selectedAnswer: answer.selectedAnswer !== undefined ? answer.selectedAnswer : null,
        correctAnswer: answer.correctAnswer !== undefined ? answer.correctAnswer : (questions && questions[index] ? questions[index].correctAnswer : null),
        isCorrect: answer.selectedAnswer === answer.correctAnswer,
        topic: answer.topic || (questions && questions[index] ? questions[index].topic : '')
      }));
    }

    // Create quiz result
    const quizResult = new QuizResultModel({
      user: userId,
      subject,
      topics: Array.isArray(topics) ? topics : [topics],
      totalQuestions,
      correctAnswers: correctAnswers || score,
      incorrectAnswers: incorrectAnswers || (totalQuestions - score),
      score,
      percentage,
      timeSpent: timeSpent || 0,
      topicPerformance: topicPerformance || {},
      answers: processedAnswers,
      quizType,
      status: 'completed'
    });

    await quizResult.save();

    res.status(201).json({
      success: true,
      message: 'Quiz result saved successfully',
      data: {
        resultId: quizResult._id,
        score,
        percentage,
        totalQuestions,
        answers: processedAnswers
      }
    });

  } catch (error) {
    console.error("Save quiz result error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to save quiz result',
      message: error.message
    });
  }
};

/**
 * Get quiz history for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, subject, quizType } = req.query;

    // Build query
    let query = { user: userId };
    if (subject) {
      query.subject = subject;
    }
    if (quizType) {
      query.quizType = quizType;
    }

    // Get quiz results with pagination
    const quizResults = await QuizResultModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-answers -user'); // Exclude detailed answers and user info

    // Get total count for pagination
    const total = await QuizResultModel.countDocuments(query);

    // Calculate statistics
    const stats = await QuizResultModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        quizResults,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        statistics: stats.length > 0 ? {
          totalQuizzes: stats[0].totalQuizzes,
          averageScore: Math.round(stats[0].averageScore || 0),
          bestScore: stats[0].bestScore || 0,
          totalTimeSpent: stats[0].totalTimeSpent || 0
        } : {
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0
        }
      }
    });

  } catch (error) {
    console.error("Get quiz history error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz history',
      message: error.message
    });
  }
};
