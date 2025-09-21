import { GoogleGenerativeAI } from '@google/generative-ai';
import QuizResultModel from '../models/QuizResult.js';
// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

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

    // Generate content with retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    let quiz;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();        // Extract JSON from response (in case there's extra text)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          quiz = JSON.parse(jsonMatch[0]);
          break;
        } else {
          quiz = JSON.parse(text);
          break;
        }
      } catch (parseError) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error("Failed to parse AI response after multiple attempts:", parseError);
          return res.status(500).json({ 
            success: false,
            error: 'Failed to generate a properly formatted quiz after multiple attempts'
          });
        }
      }
    }

    // Validate quiz structure
    if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
      return res.status(500).json({ 
        success: false,
        error: 'Generated quiz has invalid format' 
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