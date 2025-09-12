import { GoogleGenerativeAI } from '@google/generative-ai';
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