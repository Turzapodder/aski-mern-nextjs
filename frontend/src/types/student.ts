export interface StudentFormData {
  projectName: string;
  description: string;
  subject: string;
  topics: string[];
  deadline: string;
  attachments?: File[];
  estimatedCost?: number;
}

export interface StudentResponse {
  status: string;
  message: string;
  data?: any;
  sessionId?: string;
  formData?: StudentFormData;
}
