export interface QuizRequest {
  subject: string;
  topics: string[];
  difficulty?: string;
  questionCount?: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface QuizResponse {
  success: boolean;
  data: {
    subject: string;
    topics: string[];
    questions: QuizQuestion[];
  };
}

export interface QuizSummary {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  topicPerformance: Record<string, any>;
  answers?: any[];
}
