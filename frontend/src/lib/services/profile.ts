import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

export interface StudentProfile {
  institutionName?: string;
  institutionType?: 'College' | 'University' | 'High School' | 'Other';
  department?: string;
  degree?: string;
  yearOfStudy?: string;
  studentID?: string;
  cgpa?: string;
  interests?: string[];
  skills?: string[];
  guardianContact?: string;
  documents?: Array<{ filename: string; url: string; }>;
}

export interface TutorProfile {
  professionalTitle?: string;
  qualification?: string;
  expertiseSubjects?: string[];
  experienceYears?: number;
  currentInstitution?: string;
  availableDays?: string[];
  availableTimeSlots?: string[];
  hourlyRate?: number;
  teachingMode?: 'Online' | 'Offline' | 'Hybrid';
  achievements?: string;
  documents?: Array<{ filename: string; url: string; }>;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
}

export interface ProfileUpdatePayload {
  profileImage?: string;
  fullName?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  about?: string;
  socialLinks?: SocialLinks;
  languages?: string[];
  profileStatus?: boolean;
  studentProfile?: StudentProfile;
  tutorProfile?: TutorProfile;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/profile/' , credentials: 'include'}),
  endpoints: (builder) => ({
    getProfile: builder.query<any, string>({
      query: (userId) => ({ url: userId, method: 'GET' })
    }),
    updateProfile: builder.mutation<any, { userId: string; data: ProfileUpdatePayload }>({
      query: ({ userId, data }) => ({
        url: userId,
        method: 'PUT',
        body: data,
        headers: { 'Content-Type': 'application/json' }
      })
    }),
    uploadFiles: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'upload',
        method: 'POST',
        body: formData
      })
    })
  })
});

export const { useGetProfileQuery, useUpdateProfileMutation, useUploadFilesMutation } = profileApi;