import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define assignment types
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  deadline: string;
  estimatedCost: number;
  budget?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status:
    | 'draft'
    | 'created'
    | 'proposal_received'
    | 'proposal_accepted'
    | 'in_progress'
    | 'submission_pending'
    | 'revision_requested'
    | 'pending'
    | 'assigned'
    | 'submitted'
    | 'completed'
    | 'cancelled'
    | 'overdue'
    | 'disputed'
    | 'resolved';
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
    uploadedAt: string;
  }>;
  submissionDetails?: {
    submittedAt?: string;
    submissionFiles?: Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
      uploadedAt: string;
    }>;
    submissionLinks?: Array<{
      url: string;
      label?: string;
      addedAt?: string;
    }>;
    submissionNotes?: string;
  };
  submissionHistory?: Array<{
    submittedAt?: string;
    submissionFiles?: Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
      uploadedAt: string;
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
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'disputed';
  paymentAmount?: number;
  isActive: boolean;
  tags?: string[];
  viewCount: number;
  lastViewedAt?: string;
  chatId?: string;
  proposalCount?: number;
  discussionCount?: number;
}

export interface AssignmentsResponse {
  status: string;
  message: string;
  data: Assignment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAssignments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AssignmentResponse {
  status: string;
  message: string;
  data: Assignment;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  subject: string;
  topics: string[];
  deadline: string;
  estimatedCost?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: File[];
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
}

// Define the assignments API
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8000'

export const assignmentsApi = createApi({
  reducerPath: 'assignmentsApi',
  tagTypes: ['Assignment', 'Assignments'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiBaseUrl}/api/assignments`,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    // Get all assignments with filters
    getAssignments: builder.query<AssignmentsResponse, AssignmentFilters>({
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
      providesTags: ['Assignments'],
    }),

    // Get single assignment by ID
    getAssignmentById: builder.query<AssignmentResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Assignment', id }],
    }),

    // Create new assignment
    createAssignment: builder.mutation<AssignmentResponse, FormData>({
      query: (formData) => ({
        url: '',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Assignments'],
    }),

    // Update assignment
    updateAssignment: builder.mutation<AssignmentResponse, { id: string; data: Partial<Assignment> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Assignment', id },
        'Assignments',
      ],
    }),

    // Delete assignment
    deleteAssignment: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Assignment', id },
        'Assignments',
      ],
    }),

    // Submit assignment solution
    submitAssignmentSolution: builder.mutation<AssignmentResponse, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}/submit`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Assignment', id },
        'Assignments',
      ],
    }),

    // Assign tutor to assignment
    assignTutor: builder.mutation<AssignmentResponse, { assignmentId: string; tutorId: string }>({
      query: ({ assignmentId, tutorId }) => ({
        url: `/${assignmentId}/assign-tutor`,
        method: 'POST',
        body: { tutorId },
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
        'Assignments',
      ],
    }),

    // Submit feedback for assignment
    submitFeedback: builder.mutation<AssignmentResponse, { id: string; rating?: number; comments?: string }>({
      query: ({ id, rating, comments }) => ({
        url: `/${id}/feedback`,
        method: 'POST',
        body: { rating, comments },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Assignment', id },
        'Assignments',
      ],
    }),

    // Dummy payment for assignment
    processPayment: builder.mutation<AssignmentResponse, { id: string; amount?: number; method?: string }>({
      query: ({ id, amount, method }) => ({
        url: `/${id}/payment`,
        method: 'POST',
        body: { amount, method },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Assignment', id },
        'Assignments',
      ],
    }),

    // Request revision
    requestRevision: builder.mutation<AssignmentResponse, { id: string; note: string }>({
      query: ({ id, note }) => ({
        url: `/${id}/request-revision`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Assignment', id },
        'Assignments',
      ],
    }),

    // Get assignment statistics
    getAssignmentStats: builder.query<{
      status: string;
      data: {
        totalAssignments: number;
        pendingAssignments: number;
        completedAssignments: number;
        assignedAssignments: number;
        averageRating: number;
        totalEarnings: number;
      };
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
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmitAssignmentSolutionMutation,
  useAssignTutorMutation,
  useSubmitFeedbackMutation,
  useProcessPaymentMutation,
  useRequestRevisionMutation,
  useGetAssignmentStatsQuery,
} = assignmentsApi;
