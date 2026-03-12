import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl } from '../apiConfig';
import type {
  AuthResponse,
  RegisterUser as User,
  LoginPayload,
  PasswordReset,
  ChangePassword,
} from '@/types/user';
import type { QuizRequest, QuizResponse } from '@/types/quiz';

const authApiBaseUrl = `${apiBaseUrl}/user/`;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: authApiBaseUrl }),
  endpoints: (builder) => ({
    createUser: builder.mutation<AuthResponse, User>({
      query: (user) => ({
        url: 'register',
        method: 'POST',
        body: user,
        headers: {
          'Content-type': 'application/json',
        },
      }),
    }),
    verifyEmail: builder.mutation<AuthResponse, { email: string; otp: string }>({
      query: (data) => ({
        url: `verify-email`,
        method: 'POST',
        body: data,
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
      }),
    }),
    loginUser: builder.mutation<AuthResponse, LoginPayload>({
      query: (user) => ({
        url: `login`,
        method: 'POST',
        body: user,
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
      }),
    }),
    getUser: builder.query<any, void>({
      query: () => ({
        url: `profile`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
    getMe: builder.query<any, void>({
      query: () => ({
        url: 'me',
        method: 'GET',
        credentials: 'include',
      }),
    }),
    logoutUser: builder.mutation({
      query: () => {
        return {
          url: `logout`,
          method: 'POST',
          body: {},
          credentials: 'include',
        };
      },
    }),
    resetPasswordLink: builder.mutation({
      query: (user) => {
        return {
          url: 'reset-password-link',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
    }),
    resetPassword: builder.mutation({
      query: (data) => {
        const { id, token, ...values } = data;
        const actualData = { ...values };
        return {
          url: `/reset-password/${id}/${token}`,
          method: 'POST',
          body: actualData,
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
    }),
    changePassword: builder.mutation({
      query: (actualData) => {
        return {
          url: 'change-password',
          method: 'POST',
          body: actualData,
          credentials: 'include',
        };
      },
    }),
    generateQuiz: builder.mutation<QuizResponse, QuizRequest>({
      query: (quizData) => ({
        url: 'generate-quiz',
        method: 'POST',
        body: quizData,
        headers: {
          'Content-type': 'application/json',
        },
      }),
    }),
    updateUser: builder.mutation<any, Partial<any>>({
      query: (data) => ({
        url: 'profile',
        method: 'PUT',
        body: data,
        credentials: 'include',
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useVerifyEmailMutation,
  useLoginUserMutation,
  useGetUserQuery,
  useGetMeQuery,
  useLogoutUserMutation,
  useResetPasswordLinkMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGenerateQuizMutation,
  useUpdateUserMutation,
} = authApi;
