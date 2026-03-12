export interface Submission {
  _id: string;
  assignment: {
    _id: string;
    title?: string;
    status?: string;
    deadline?: string;
  };
  student: {
    _id: string;
    name?: string;
    email?: string;
    profileImage?: string;
  };
  tutor: {
    _id: string;
    name?: string;
    email?: string;
    profileImage?: string;
  };
  title: string;
  description: string;
  submissionFiles?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt?: string;
  }>;
  submissionLinks?: Array<{
    url: string;
    label?: string;
    addedAt?: string;
  }>;
  submissionNotes?: string;
  submittedAt?: string;
  status: 'submitted' | 'under_review' | 'completed' | 'revision_requested';
  review?: {
    stars?: number;
    feedback?: string;
    reviewedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmissionsResponse {
  status: string;
  data: Submission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SubmissionResponse {
  status: string;
  data: Submission;
}

export interface LatestSubmissionStatusResponse {
  status: string;
  data: Record<
    string,
    {
      status: 'submitted' | 'under_review' | 'completed' | 'revision_requested';
      submittedAt?: string;
      review?: {
        stars?: number;
        feedback?: string;
        reviewedAt?: string;
      };
    }
  >;
}

export interface SubmissionFilters {
  assignmentId?: string;
  studentId?: string;
  tutorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}
