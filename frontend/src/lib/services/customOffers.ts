import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CustomOffer } from "@/types/offer";

// Re-export for backward compatibility
export type { CustomOffer }

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

const customOffersApiBaseUrl = `${apiBaseUrl}/api/custom-offers`;

export const customOffersApi = createApi({
  reducerPath: "customOffersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: customOffersApiBaseUrl,
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
