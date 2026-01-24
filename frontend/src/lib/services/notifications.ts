import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  tagTypes: ["Notifications"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiBaseUrl}/api/notifications`,
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
