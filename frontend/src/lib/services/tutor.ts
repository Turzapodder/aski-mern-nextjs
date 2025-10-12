import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface TutorApplicationData {
  personalInfo: {
    name: string;
    email: string;
    phoneNumber: string;
    university: string;
    degree: string;
    gpa: string;
    country: string;
  };
  academicInfo: {
    subject: string;
    topics: string[];
  };
  quizSummary: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    timeSpent: number;
    topicPerformance: Record<string, any>;
    answers?: any[];
  };
  documents?: {
    certificate?: File;
    profilePicture?: File;
  };
}

interface TutorResponse {
  status: string;
  message: string;
  data?: any;
  application?: string;
}

interface CanApplyResponse {
  status: string;
  canApply: boolean;
  message: string;
  existingApplication?: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
}

export const tutorApi = createApi({
  reducerPath: "tutorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    }/api/tutor/`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      // Add any additional headers if needed
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["TutorApplication", "QuizResult"],
  endpoints: (builder) => ({
    // Check if user can apply for a subject
    canApplyForSubject: builder.query<CanApplyResponse, string>({
      query: (subject) => ({
        url: `can-apply/${encodeURIComponent(subject)}`,
        method: "GET",
      }),
      providesTags: ["TutorApplication"],
    }),

    // Submit tutor application
    submitTutorApplication: builder.mutation<
      TutorResponse,
      TutorApplicationData
    >({
      query: (applicationData) => {
        const formData = new FormData();

        // Add JSON data as strings
        formData.append(
          "personalInfo",
          JSON.stringify(applicationData.personalInfo)
        );
        formData.append(
          "academicInfo",
          JSON.stringify(applicationData.academicInfo)
        );
        formData.append(
          "quizSummary",
          JSON.stringify(applicationData.quizSummary)
        );

        // Add files if they exist
        if (applicationData.documents?.certificate) {
          formData.append("certificate", applicationData.documents.certificate);
        }
        if (applicationData.documents?.profilePicture) {
          formData.append(
            "profilePicture",
            applicationData.documents.profilePicture
          );
        }

        // Log the form data for debugging
        console.log("Submitting application with FormData:");
        for (let [key, value] of formData.entries()) {
          console.log(
            key,
            ":",
            value instanceof File ? `File: ${value.name}` : value
          );
        }

        return {
          url: "application/submit",
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it for FormData
        };
      },
      invalidatesTags: ["TutorApplication"],
      transformErrorResponse: (response) => {
        console.error("Submit application error:", response);
        return response;
      },
    }),

    // Get application status
    getTutorApplicationStatus: builder.query<TutorResponse, void>({
      query: () => ({
        url: "application/status",
        method: "GET",
      }),
      providesTags: ["TutorApplication"],
    }),

    // Get all applications (admin)
    getAllTutorApplications: builder.query<
      TutorResponse,
      {
        page?: number;
        limit?: number;
        status?: string;
        subject?: string;
      }
    >({
      query: ({ page = 1, limit = 20, status, subject } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) params.append("status", status);
        if (subject) params.append("subject", subject);

        return {
          url: `applications?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TutorApplication"],
    }),

    // Review application (admin)
    reviewTutorApplication: builder.mutation<
      TutorResponse,
      {
        applicationId: string;
        status: "approved" | "rejected" | "under_review";
        reviewNotes?: string;
      }
    >({
      query: ({ applicationId, status, reviewNotes }) => ({
        url: `applications/${applicationId}/review`,
        method: "PUT",
        body: { status, reviewNotes },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["TutorApplication"],
    }),

    // Save quiz result
    saveQuizResult: builder.mutation<
      TutorResponse,
      {
        subject: string;
        topics: string[];
        totalQuestions: number;
        correctAnswers: number;
        score: number;
        timeSpent: number;
        topicPerformance?: Record<string, any>;
        answers?: any[];
        quizType?: string;
      }
    >({
      query: (quizData) => ({
        url: "quiz/save-result",
        method: "POST",
        body: quizData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["QuizResult"],
    }),

    // Get quiz history
    getQuizHistory: builder.query<
      TutorResponse,
      {
        page?: number;
        limit?: number;
        subject?: string;
        quizType?: string;
      }
    >({
      query: ({ page = 1, limit = 10, subject, quizType } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (subject) params.append("subject", subject);
        if (quizType) params.append("quizType", quizType);

        return {
          url: `quiz/history?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["QuizResult"],
    }),
  }),
});

export const {
  useCanApplyForSubjectQuery,
  useSubmitTutorApplicationMutation,
  useGetTutorApplicationStatusQuery,
  useGetAllTutorApplicationsQuery,
  useReviewTutorApplicationMutation,
  useSaveQuizResultMutation,
  useGetQuizHistoryQuery,
} = tutorApi;
