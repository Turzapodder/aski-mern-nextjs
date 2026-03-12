import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  StudentProfile,
  TutorProfile,
  UserProfile,
  ProfileUpdatePayload,
  UploadFilesResponse,
  ProfileCompletionResponse,
  TutorPublicProfile,
  VerifiedTutorsResponse,
} from '@/types/user';

// Re-export types for backward compatibility
export type {
  StudentProfile,
  TutorProfile,
  UserProfile,
  ProfileUpdatePayload,
  UploadFilesResponse,
  ProfileCompletionResponse,
  TutorPublicProfile,
  VerifiedTutorsResponse,
};

/**
 * Profile API - Redux Toolkit Query setup
 * Handles all profile-related API operations
 */
const profileApiBaseUrl = `${
  process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000'
}/api/profile`;

export const profileApi = createApi({
  reducerPath: 'profileApi',
  tagTypes: ['Profile', 'VerifiedTutors'],
  baseQuery: fetchBaseQuery({
    baseUrl: profileApiBaseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
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
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId }],
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
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Profile', id: userId }],
    }),

    /**
     * Upload profile files (images and documents)
     */
    uploadFiles: builder.mutation<UploadFilesResponse, { userId: string; formData: FormData }>({
      query: ({ userId, formData }) => ({
        url: `/${userId}/upload`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Profile', id: userId }],
    }),

    /**
     * Get profile completion percentage
     */
    getProfileCompletion: builder.query<ProfileCompletionResponse, string>({
      query: (userId) => `/${userId}/completion`,
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId }],
    }),

    /**
     * Get public tutor profile
     */
    getTutorPublicProfile: builder.query<TutorPublicProfile, string>({
      query: (tutorId) => `/tutor/public/${tutorId}`,
      providesTags: (result, error, tutorId) => [{ type: 'Profile', id: tutorId }],
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
      providesTags: ['VerifiedTutors'],
    }),

    /**
     * Admin: Verify tutor profile
     */
    verifyTutorProfile: builder.mutation<
      { status: string; message: string; user: UserProfile },
      {
        userId: string;
        verificationStatus: 'Verified' | 'Rejected' | 'Pending';
        reason?: string;
      }
    >({
      query: ({ userId, verificationStatus, reason }) => ({
        url: `/admin/${userId}/verify`,
        method: 'PUT',
        body: { verificationStatus, reason },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Profile', id: userId },
        'VerifiedTutors',
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
