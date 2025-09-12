import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define response types
interface AuthResponse {
  status: string;
  message: string;
  data?: any;
}

// Fix User interface
interface User {
  email: string;
  password: string;
  name?: string;
  tc?: boolean;
}

interface PasswordReset {
  id: string;
  token: string;
  password: string;
  password_confirmation: string;
}

interface ChangePassword {
  password: string;
  password_confirmation: string;
}

// Define a service using a base URL and expected endpoints
interface QuizRequest {
  subject: string;
  topics: string[];
  difficulty?: string;
  questionCount?: number;
}

interface QuizResponse {
  success: boolean;
  data: {
    subject: string;
    topics: string[];
    questions: {
      id: number;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      topic: string;
    }[];
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/user/' }),
  endpoints: (builder) => ({
    createUser: builder.mutation<AuthResponse, User>({
      query: (user) => ({
        url: 'register',
        method: 'POST',
        body: user,
        headers: {
          'Content-type': 'application/json'
        }
      })
    }),
    verifyEmail: builder.mutation<AuthResponse, {email: string, otp: string }>({
      query: (data) => ({
        url: `verify-email`,
        method: 'POST',
        body: data,
        headers: {
          'Content-type': 'application/json'
        }
      })
    }),
    loginUser: builder.mutation<AuthResponse, Pick<User, 'email' | 'password'>>({
      query: (user) => ({
        url: `login`,
        method: 'POST',
        body: user,
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      })
    }),
    getUser: builder.query<any, void>({
      query: () => ({
        url: `profile`,
        method: 'GET',
        credentials: 'include'
      })
    }),
    logoutUser: builder.mutation({
      query: () => {
        return {
          url: `logout`,
          method: 'POST',
          body: {},
          credentials: 'include'
        }
      }
    }),
    resetPasswordLink: builder.mutation({
      query: (user) => {
        return {
          url: 'reset-password-link',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          }
        }
      }
    }),
    resetPassword: builder.mutation({
      query: (data) => {
        const { id, token, ...values } = data
        const actualData = { ...values }
        return {
          url: `/reset-password/${id}/${token}`,
          method: 'POST',
          body: actualData,
          headers: {
            'Content-type': 'application/json',
          }
        }
      }
    }),
    changePassword: builder.mutation({
      query: (actualData) => {
        return {
          url: 'change-password',
          method: 'POST',
          body: actualData,
          credentials: 'include'
        }
      }
    }),
    generateQuiz: builder.mutation<QuizResponse, QuizRequest>({
      query: (quizData) => ({
        url: 'generate-quiz',
        method: 'POST',
        body: quizData,
        headers: {
          'Content-type': 'application/json',
        }
      })
    }),
  }),
})

export const { 
  useCreateUserMutation,
  useVerifyEmailMutation,
  useLoginUserMutation,
  useGetUserQuery,
  useLogoutUserMutation,
  useResetPasswordLinkMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGenerateQuizMutation
} = authApi