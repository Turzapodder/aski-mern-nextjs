import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define proposal types
export interface Proposal {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    description: string;
    subject: string;
    deadline: string;
    estimatedCost: number;
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
  };
  student: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  proposedPrice: number;
  estimatedDeliveryTime: number; // in hours
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
  message: string;
  proposals: Proposal[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalProposals: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProposalResponse {
  status: string;
  message: string;
  proposal: Proposal;
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

// Create the proposals API
export const proposalsApi = createApi({
  reducerPath: 'proposalsApi',
  tagTypes: ['Proposal', 'Proposals'],
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/proposals',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Get proposals with filters
    getProposals: builder.query<ProposalsResponse, ProposalFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        return {
          url: `?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Proposals'],
    }),

    // Get proposal by ID
    getProposalById: builder.query<ProposalResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Proposal', id }],
    }),

    // Get proposals by assignment ID
    getProposalsByAssignment: builder.query<ProposalsResponse, string>({
      query: (assignmentId) => ({
        url: `/assignment/${assignmentId}`,
        method: 'GET',
      }),
      providesTags: (result, error, assignmentId) => [
        { type: 'Proposals', id: `assignment-${assignmentId}` }
      ],
    }),

    // Get proposals by tutor ID
    getProposalsByTutor: builder.query<ProposalsResponse, ProposalFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        return {
          url: `/tutor?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Proposals'],
    }),

    // Get proposals by student ID
    getProposalsByStudent: builder.query<ProposalsResponse, ProposalFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        return {
          url: `/student?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Proposals'],
    }),

    // Create a new proposal
    createProposal: builder.mutation<ProposalResponse, FormData>({
      query: (formData) => ({
        url: '',
        method: 'POST',
        body: formData,
        prepareHeaders: (headers: Headers) => {
          // Don't set Content-Type for FormData, let the browser set it
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Proposals'],
    }),

    // Update a proposal
    updateProposal: builder.mutation<ProposalResponse, { id: string; data: Partial<Proposal> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Proposal', id },
        'Proposals',
      ],
    }),

    // Accept a proposal
    acceptProposal: builder.mutation<ProposalResponse, { id: string; message?: string }>({
      query: ({ id, message }) => ({
        url: `/${id}/accept`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Proposal', id },
        'Proposals',
      ],
    }),

    // Reject a proposal
    rejectProposal: builder.mutation<ProposalResponse, { id: string; message?: string }>({
      query: ({ id, message }) => ({
        url: `/${id}/reject`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Proposal', id },
        'Proposals',
      ],
    }),

    // Withdraw a proposal
    withdrawProposal: builder.mutation<ProposalResponse, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/withdraw`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Proposal', id },
        'Proposals',
      ],
    }),

    // Delete a proposal
    deleteProposal: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Proposal', id },
        'Proposals',
      ],
    }),

    // Get proposal statistics
    getProposalStats: builder.query<{
      status: string;
      data: ProposalStats;
    }, void>({
      query: () => ({
        url: '/stats',
        method: 'GET',
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetProposalsQuery,
  useGetProposalByIdQuery,
  useGetProposalsByAssignmentQuery,
  useGetProposalsByTutorQuery,
  useGetProposalsByStudentQuery,
  useCreateProposalMutation,
  useUpdateProposalMutation,
  useAcceptProposalMutation,
  useRejectProposalMutation,
  useWithdrawProposalMutation,
  useDeleteProposalMutation,
  useGetProposalStatsQuery,
} = proposalsApi;
