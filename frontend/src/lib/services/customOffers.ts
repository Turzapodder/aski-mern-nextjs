import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CustomOffer {
  _id: string;
  assignment: string;
  conversation: string;
  tutor: string;
  student: string;
  proposedBudget: number;
  proposedDeadline: string;
  message?: string;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: string;
  expiresAt: string;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

export const customOffersApi = createApi({
  reducerPath: "customOffersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiBaseUrl}/api/custom-offers`,
    credentials: "include",
  }),
  tagTypes: ["CustomOffer"],
  endpoints: (builder) => ({
    getActiveOffer: builder.query<
      { status: string; data: CustomOffer | null },
      string
    >({
      query: (chatId) => ({
        url: `/conversation/${chatId}`,
        method: "GET",
      }),
      providesTags: ["CustomOffer"],
    }),
    createOffer: builder.mutation<
      { status: string; data: CustomOffer },
      {
        conversationId: string;
        assignmentId?: string;
        title?: string;
        description?: string;
        proposedBudget: number;
        proposedDeadline: string;
        message?: string;
      }
    >({
      query: (payload) => ({
        url: "",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["CustomOffer"],
    }),
    acceptOffer: builder.mutation<{ status: string; data: any }, string>({
      query: (offerId) => ({
        url: `/${offerId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["CustomOffer"],
    }),
    declineOffer: builder.mutation<{ status: string }, string>({
      query: (offerId) => ({
        url: `/${offerId}/decline`,
        method: "POST",
      }),
      invalidatesTags: ["CustomOffer"],
    }),
  }),
});

export const {
  useGetActiveOfferQuery,
  useCreateOfferMutation,
  useAcceptOfferMutation,
  useDeclineOfferMutation,
} = customOffersApi;
