export interface User {
  name: string;
  email: string;
  is_verified: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface QuizSummary {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  topicPerformance: Record<string, unknown>;
  answers?: unknown[];
}

export interface OnboardingFormData {
  name: string;
  email: string;
  phoneNumber: string;
  university: string;
  degree: string;
  gpa: string;
  country: string;
  subject: string;
  topics: string[];
  quizSummary: QuizSummary | null;
  certificate: File | null;
  profilePicture: File | null;
}
