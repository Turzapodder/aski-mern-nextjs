import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type definitions
export interface StudentProfile {
  institutionName?: string;
  institutionType?: "College" | "University" | "High School" | "Other";
  department?: string;
  degree?: string;
  yearOfStudy?: string;
  studentID?: string;
  cgpa?: string;
  interests?: string[];
  skills?: string[];
  guardianContact?: string;
  documents?: Array<{
    filename: string;
    originalName: string;
    url: string;
    mimetype: string;
    size: number;
  }>;
}

export interface TutorProfile {
  professionalTitle?: string;
  qualification?: string;
  expertiseSubjects?: string[];
  skills?: string[];
  experienceYears?: number;
  currentInstitution?: string;
  availableDays?: string[];
  availableTimeSlots?: Array<string | { day: string; slots: string[] }>;
  hourlyRate?: number;
  teachingMode?: "Online" | "Offline" | "Hybrid";
  achievements?: string;
  bio?: string;
  documents?: Array<{
    filename: string;
    originalName: string;
    url: string;
    mimetype: string;
    size: number;
  }>;
  verificationStatus?: "Pending" | "Verified" | "Rejected";
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  about?: string;
  languages?: string[];
  profileImage?: string;
  profileStatus?: boolean;
  roles: string[];
  is_verified: boolean;
  registrationDate: string;
  lastLogin?: string;
  studentProfile?: StudentProfile;
  tutorProfile?: TutorProfile;
  onboardingStatus?: string;
  status?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  about?: string;
  languages?: string[];
  profileImage?: string;
  profileStatus?: boolean;
  studentProfile?: StudentProfile;
  tutorProfile?: TutorProfile;
}

export interface UploadFilesResponse {
  status: string;
  message: string;
  files: {
    profileImage?: {
      filename: string;
      originalName: string;
      url: string;
      absoluteUrl: string;
      mimetype: string;
      size: number;
    };
    documents?: Array<{
      filename: string;
      originalName: string;
      url: string;
      absoluteUrl: string;
      mimetype: string;
      size: number;
    }>;
  };
}

export interface ProfileCompletionResponse {
  status: string;
  completion: number;
  profileStatus: boolean;
}

export interface TutorPublicProfile {
  status: string;
  tutor: UserProfile;
}

export interface VerifiedTutorsResponse {
  status: string;
  tutors: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Profile API - Redux Toolkit Query setup
 * Handles all profile-related API operations
 */
export const profileApi = createApi({
  reducerPath: "profileApi",
  tagTypes: ["Profile", "VerifiedTutors"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.REACT_APP_API_URL ||
      "http://localhost:8000"
    }/api/profile`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    /**
     * Get user profile by ID
     */
    getProfile: builder.query<{ status: string; user: UserProfile }, string>({
      query: (userId) => `/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "Profile", id: userId },
      ],
    }),

    /**
     * Update user profile
     */
    updateProfile: builder.mutation<
      { status: string; message: string; user: UserProfile },
      { userId: string; data: ProfileUpdatePayload }
    >({
      query: ({ userId, data }) => ({
        url: `/${userId}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Profile", id: userId },
      ],
    }),

    /**
     * Upload profile files (images and documents)
     */
    uploadFiles: builder.mutation<
      UploadFilesResponse,
      { userId: string; formData: FormData }
    >({
      query: ({ userId, formData }) => ({
        url: `/${userId}/upload`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Profile", id: userId },
      ],
    }),

    /**
     * Get profile completion percentage
     */
    getProfileCompletion: builder.query<ProfileCompletionResponse, string>({
      query: (userId) => `/${userId}/completion`,
      providesTags: (result, error, userId) => [
        { type: "Profile", id: userId },
      ],
    }),

    /**
     * Get public tutor profile
     */
    getTutorPublicProfile: builder.query<TutorPublicProfile, string>({
      query: (tutorId) => `/tutor/public/${tutorId}`,
      providesTags: (result, error, tutorId) => [
        { type: "Profile", id: tutorId },
      ],
    }),

    /**
     * Get all verified tutors with filtering
     */
    getVerifiedTutors: builder.query<
      VerifiedTutorsResponse,
      {
        page?: number;
        limit?: number;
        subject?: string;
        city?: string;
      }
    >({
      query: ({ page = 1, limit = 10, subject, city }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(subject && { subject }),
          ...(city && { city }),
        });
        return `/tutors/verified?${params.toString()}`;
      },
      providesTags: ["VerifiedTutors"],
    }),

    /**
     * Admin: Verify tutor profile
     */
    verifyTutorProfile: builder.mutation<
      { status: string; message: string; user: UserProfile },
      {
        userId: string;
        verificationStatus: "Verified" | "Rejected" | "Pending";
        reason?: string;
      }
    >({
      query: ({ userId, verificationStatus, reason }) => ({
        url: `/admin/${userId}/verify`,
        method: "PUT",
        body: { verificationStatus, reason },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Profile", id: userId },
        "VerifiedTutors",
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadFilesMutation,
  useGetProfileCompletionQuery,
  useGetTutorPublicProfileQuery,
  useGetVerifiedTutorsQuery,
  useVerifyTutorProfileMutation,
} = profileApi;
