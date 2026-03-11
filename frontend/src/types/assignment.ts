export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  deadline: string;
  estimatedCost: number;
  budget?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  status: string;
  createdAt: string;
  updatedAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTutor?: {
    _id: string;
    name: string;
    email: string;
  };
  requestedTutor?: {
    _id: string;
    name: string;
    email: string;
  };
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt?: string;
  }>;
  submissionDetails?: {
    submissionId?: string;
    title?: string;
    description?: string;
    submittedAt?: string;
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
  };
  submissionHistory?: Array<{
    submissionId?: string;
    title?: string;
    description?: string;
    submittedAt?: string;
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
    revisionIndex?: number;
  }>;
  revisionRequests?: Array<{
    note?: string;
    requestedAt?: string;
    requestedBy?: string;
  }>;
  feedback?: {
    rating?: number;
    comments?: string;
    feedbackDate?: string;
  };
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'disputed' | string;
  paymentAmount?: number;
  paymentGateway?: {
    provider?: string;
    invoiceId?: string;
    transactionId?: string;
    paymentMethod?: string;
    checkoutUrl?: string;
    status?: string;
    initiatedAt?: string;
    verifiedAt?: string;
    refundedAt?: string;
    refundReference?: string;
    metadata?: Record<string, unknown>;
  };
  isActive?: boolean;
  tags?: string[];
  viewCount?: number;
  lastViewedAt?: string;
  chatId?: string;
  proposalCount?: number;
  discussionCount?: number;
  proposals?: any[];
}

export interface AssignmentsResponse {
  status: string;
  message?: string;
  data: Assignment[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalAssignments?: number;
    totalItems?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface AssignmentResponse {
  status: string;
  message?: string;
  data: Assignment;
}

export interface PaymentCheckoutResponse {
  status: string;
  message?: string;
  data: {
    assignmentId?: string;
    paymentStatus?: string;
    checkoutUrl: string;
    invoiceId?: string;
    transactionId?: string;
    paymentId?: string;
  };
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  subject: string;
  topics?: string[];
  deadline: string;
  estimatedCost?: number;
  budget?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | string;
  attachments?: File[];
  files?: File[];
  requestedTutor?: string;
}

export interface AssignmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  subject?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  sort?: string;
}
