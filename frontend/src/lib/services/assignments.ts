import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Assignment,
  AssignmentsResponse,
  AssignmentResponse,
  PaymentCheckoutResponse,
  CreateAssignmentRequest,
  AssignmentFilters,
} from '@/types/assignment';

// Re-export types for backward compatibility
export type {
  Assignment,
  AssignmentsResponse,
  AssignmentResponse,
  PaymentCheckoutResponse,
  CreateAssignmentRequest,
  AssignmentFilters,
};

// Define the assignments API
const resolveApiRoot = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
  return /\/api$/i.test(normalizedBaseUrl) ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
};

const assignmentsApiBaseUrl = `${resolveApiRoot()}/assignments`;

export const assignmentsApi = createApi({
  reducerPath: 'assignmentsApi',
  tagTypes: ['Assignment', 'Assignments'],
  baseQuery: fetchBaseQuery({
    baseUrl: assignmentsApiBaseUrl,
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
    updateAssignment: builder.mutation<
      AssignmentResponse,
      { id: string; data: Partial<Assignment> }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Assignment', id }, 'Assignments'],
    }),

    // Delete assignment
    deleteAssignment: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Assignment', id }, 'Assignments'],
    }),

    // Submit assignment solution
    submitAssignmentSolution: builder.mutation<
      AssignmentResponse,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/${id}/submit`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Assignment', id }, 'Assignments'],
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
    submitFeedback: builder.mutation<
      AssignmentResponse,
      { id: string; rating?: number; comments?: string }
    >({
      query: ({ id, rating, comments }) => ({
        url: `/${id}/feedback`,
        method: 'POST',
        body: { rating, comments },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Assignment', id }, 'Assignments'],
    }),

    // Initialize gateway payment for assignment
    processPayment: builder.mutation<
      PaymentCheckoutResponse,
      { id: string; amount?: number; method?: string }
    >({
      query: ({ id, amount, method }) => ({
        url: `/${id}/payment`,
        method: 'POST',
        body: { amount, method },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Assignment', id }, 'Assignments'],
    }),

    // Request revision
    requestRevision: builder.mutation<AssignmentResponse, { id: string; note: string }>({
      query: ({ id, note }) => ({
        url: `/${id}/request-revision`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Assignment', id }, 'Assignments'],
    }),

    // Get assignment statistics
    getAssignmentStats: builder.query<
      {
        status: string;
        data: {
          totalAssignments: number;
          pendingAssignments: number;
          completedAssignments: number;
          assignedAssignments: number;
          averageRating: number;
          totalEarnings: number;
        };
      },
      void
    >({
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
