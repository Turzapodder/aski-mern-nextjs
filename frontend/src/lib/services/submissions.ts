import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
  status: "submitted" | "under_review" | "completed" | "revision_requested";
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
      status: "submitted" | "under_review" | "completed" | "revision_requested";
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

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

export const submissionsApi = createApi({
  reducerPath: "submissionsApi",
  tagTypes: ["Submissions", "Submission"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiBaseUrl}/api/submissions`,
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
