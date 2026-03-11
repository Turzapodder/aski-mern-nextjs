import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Submission,
  SubmissionsResponse,
  SubmissionResponse,
  LatestSubmissionStatusResponse,
  SubmissionFilters,
} from "@/types/submission";

// Re-export types for backward compatibility
export type { Submission, SubmissionsResponse, SubmissionResponse, LatestSubmissionStatusResponse, SubmissionFilters }

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

const submissionsApiBaseUrl = `${apiBaseUrl}/api/submissions`;

export const submissionsApi = createApi({
  reducerPath: "submissionsApi",
  tagTypes: ["Submissions", "Submission"],
  baseQuery: fetchBaseQuery({
    baseUrl: submissionsApiBaseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getSubmissions: builder.query<SubmissionsResponse, SubmissionFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return {
          url: `?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Submissions"],
    }),
    getSubmissionById: builder.query<SubmissionResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Submission", id }],
    }),
    markSubmissionUnderReview: builder.mutation<SubmissionResponse, { assignmentId: string }>({
      query: ({ assignmentId }) => ({
        url: "/mark-under-review",
        method: "POST",
        body: { assignmentId },
      }),
      invalidatesTags: ["Submissions"],
    }),
    getLatestSubmissionStatusByAssignments: builder.query<
      LatestSubmissionStatusResponse,
      { assignmentIds: string[] }
    >({
      query: ({ assignmentIds }) => ({
        url: "/latest-status",
        method: "POST",
        body: { assignmentIds },
      }),
      providesTags: ["Submissions"],
    }),
  }),
});

export const {
  useGetSubmissionsQuery,
  useGetSubmissionByIdQuery,
  useMarkSubmissionUnderReviewMutation,
  useGetLatestSubmissionStatusByAssignmentsQuery,
} = submissionsApi;
