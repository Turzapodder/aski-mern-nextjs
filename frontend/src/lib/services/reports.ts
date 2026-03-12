import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CreateReportPayload } from '@/types/report';

// Re-export for backward compatibility
export type { CreateReportPayload };

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

const reportsApiBaseUrl = `${apiBaseUrl}/api/reports`;

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: reportsApiBaseUrl,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    createReport: builder.mutation<{ status: string; data: any }, CreateReportPayload>({
      query: (payload) => ({
        url: '',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const { useCreateReportMutation } = reportsApi;
