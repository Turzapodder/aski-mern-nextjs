import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Proposal,
  ProposalsResponse,
  ProposalResponse,
  CreateProposalRequest,
  ProposalFilters,
  ProposalStats,
} from '@/types/proposal';

// Re-export types for backward compatibility
export type {
  Proposal,
  ProposalsResponse,
  ProposalResponse,
  CreateProposalRequest,
  ProposalFilters,
  ProposalStats,
};

const resolveApiRoot = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
  return /\/api$/i.test(normalizedBaseUrl) ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
};

const proposalsApiBaseUrl = `${resolveApiRoot()}/proposals`;

// Create the proposals API
export const proposalsApi = createApi({
  reducerPath: 'proposalsApi',
  tagTypes: ['Proposal', 'Proposals'],
  baseQuery: fetchBaseQuery({
    baseUrl: proposalsApiBaseUrl,
    credentials: 'include',
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
        { type: 'Proposals', id: `assignment-${assignmentId}` },
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Proposal', id }, 'Proposals'],
    }),

    // Accept a proposal
    acceptProposal: builder.mutation<ProposalResponse, { id: string; message?: string }>({
      query: ({ id, message }) => ({
        url: `/${id}/accept`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Proposal', id }, 'Proposals'],
    }),

    // Reject a proposal
    rejectProposal: builder.mutation<ProposalResponse, { id: string; message?: string }>({
      query: ({ id, message }) => ({
        url: `/${id}/reject`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Proposal', id }, 'Proposals'],
    }),

    // Withdraw a proposal
    withdrawProposal: builder.mutation<ProposalResponse, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/withdraw`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Proposal', id }, 'Proposals'],
    }),

    // Delete a proposal
    deleteProposal: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Proposal', id }, 'Proposals'],
    }),

    // Get proposal statistics
    getProposalStats: builder.query<
      {
        status: string;
        data: ProposalStats;
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
