export interface Proposal {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    description: string;
    subject: string;
    deadline: string;
    estimatedCost: number;
    budget?: number;
  };
  tutor: {
    _id: string;
    name: string;
    email: string;
    tutorProfile?: {
      expertise: string[];
      hourlyRate: number;
      rating: number;
      completedAssignments: number;
    };
    publicStats?: {
      averageRating?: number;
      totalReviews?: number;
    };
  };
  student: {
    _id: string;
    name: string;
    email: string;
  };
  conversation?:
    | {
        _id: string;
        name?: string;
        assignment?: string;
        assignmentTitle?: string;
      }
    | string;
  title: string;
  description: string;
  proposedPrice: number;
  estimatedDeliveryTime: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  coverLetter?: string;
  relevantExperience?: string;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  studentResponse?: {
    message: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface ProposalsResponse {
  status: string;
  message?: string;
  data?: {
    proposals: Proposal[];
    count?: number;
    pagination?: {
      current?: number;
      pages?: number;
      total?: number;
      currentPage?: number;
      totalPages?: number;
      totalProposals?: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
    };
  };
}

export interface ProposalResponse {
  status: string;
  message?: string;
  data?: {
    proposal: Proposal;
  };
}

export interface CreateProposalRequest {
  assignmentId: string;
  title: string;
  description: string;
  proposedPrice: number;
  estimatedDeliveryTime: number;
  coverLetter?: string;
  relevantExperience?: string;
  attachments?: File[];
}

export interface ProposalFilters {
  page?: number;
  limit?: number;
  status?: string;
  assignmentId?: string;
  tutorId?: string;
  studentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProposalStats {
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  averageProposedPrice: number;
  successRate: number;
}
