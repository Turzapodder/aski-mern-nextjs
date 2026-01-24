import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateReportPayload {
  reporterType: "user" | "tutor";
  reportedType: "assignment" | "tutorProfile" | "userProfile";
  reportedId: string;
  reason: string;
  comments?: string;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiBaseUrl}/api/reports`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createReport: builder.mutation<{ status: string; data: any }, CreateReportPayload>({
      query: (payload) => ({
        url: "",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useCreateReportMutation } = reportsApi;
