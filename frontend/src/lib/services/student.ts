import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface StudentFormData {
  projectName: string;
  description: string;
  subject: string;
  topics: string[];
  deadline: string;
  attachments?: File[];
  estimatedCost?: number;
}

interface StudentResponse {
  status: string;
  message: string;
  data?: any;
  sessionId?: string;
  formData?: StudentFormData;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

const studentApiBaseUrl = `${apiBaseUrl}/api/student/`;
console.log('[studentApi] API base URL:', studentApiBaseUrl);

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: studentApiBaseUrl,
    credentials: 'include'
  }),
  tagTypes: ['StudentForm'],
  endpoints: (builder) => ({
    // Generate session ID for anonymous users
    generateSessionId: builder.query<StudentResponse, void>({
      query: () => ({
        url: 'session/generate',
        method: 'GET'
      })
    }),

    // Save student form data
    saveStudentForm: builder.mutation<StudentResponse, {
      sessionId: string;
      formData: StudentFormData;
    }>({
      query: ({ sessionId, formData }) => ({
        url: 'form/save',
        method: 'POST',
        body: { sessionId, formData },
        headers: {
          'Content-type': 'application/json'
        }
      }),
      invalidatesTags: ['StudentForm']
    }),

    // Get student form data
    getStudentForm: builder.query<StudentResponse, string>({
      query: (sessionId) => ({
        url: `form/${sessionId}`,
        method: 'GET'
      }),
      providesTags: ['StudentForm']
    }),

    // Convert form to assignment (after login)
    convertFormToAssignment: builder.mutation<StudentResponse, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: 'form/convert',
        method: 'POST',
        body: { sessionId },
        headers: {
          'Content-type': 'application/json'
        }
      }),
      invalidatesTags: ['StudentForm']
    })
  })
});

export const {
  useGenerateSessionIdQuery,
  useSaveStudentFormMutation,
  useGetStudentFormQuery,
  useConvertFormToAssignmentMutation
} = studentApi;