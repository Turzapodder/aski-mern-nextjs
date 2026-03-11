import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Notification, NotificationsResponse } from "@/types/notification";

// Re-export for backward compatibility
export type { Notification, NotificationsResponse }

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

const notificationsApiBaseUrl = `${apiBaseUrl}/api/notifications`;

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  tagTypes: ["Notifications"],
  baseQuery: fetchBaseQuery({
    baseUrl: notificationsApiBaseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        return `?page=${page}&limit=${limit}`;
      },
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<{ status: string }, string>({
      query: (id) => ({
        url: `/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllRead: builder.mutation<{ status: string }, void>({
      query: () => ({
        url: "/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
} = notificationsApi;
