export interface TutorApplicationData {
  personalInfo: {
    name: string;
    email: string;
    phoneNumber: string;
    university: string;
    degree: string;
    gpa: string;
    country: string;
  };
  academicInfo: {
    subject: string;
    topics: string[];
  };
  quizSummary: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    timeSpent: number;
    topicPerformance: Record<string, any>;
    answers?: any[];
  };
  documents?: {
    certificate?: File;
    profilePicture?: File;
  };
}

export interface TutorResponse {
  status: string;
  message: string;
  data?: any;
  application?: any;
}

export interface CanApplyResponse {
  status: string;
  canApply: boolean;
  message: string;
  existingApplication?: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
}
