import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define interfaces for chat-related data
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  subjects?: string[];
  isActive?: boolean;
  roles?: string[];
}

interface Chat {
  _id: string;
  name?: string;
  description?: string;
  type: "direct" | "group";
  participants: User[];
  assignment?: {
    _id: string;
    title?: string;
    deadline?: string;
    estimatedCost?: number;
    budget?: number;
    description?: string;
    student?: string;
  };
  assignmentTitle?: string;
  creator: string;
  avatar?: string;
  isActive: boolean;
  lastMessage?: {
    content: string;
    sender: User;
    createdAt: string;
    type?: "text" | "file" | "image" | "offer";
    attachments?: {
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }[];
  };
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  chat: string | { _id?: string };
  sender: User | string;
  content?: string;
  type: "text" | "file" | "image" | "offer";
  attachments?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
  meta?: Record<string, any> | null;
  readBy: {
    user: string;
    readAt: Date;
  }[];
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: string;
  deletedAt?: string;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
  status?: "sending" | "error";
  tempId?: string;
}

interface ChatResponse {
  status: string;
  message: string;
  data?: any;
}

interface CreateChatRequest {
  name?: string;
  description?: string;
  type: "direct" | "group";
  participants: string[];
}

interface SendMessageRequest {
  chatId: string;
  content?: string;
  type?: "text" | "file" | "image";
  replyTo?: string;
}

interface GetMessagesRequest {
  chatId: string;
  page?: number;
  limit?: number;
}

interface MarkAsReadRequest {
  chatId: string;
}

const chatApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${chatApiBaseUrl}/api/chat/`,
    credentials: "include",
  }),
  tagTypes: ["Chat", "Message", "User"],
  endpoints: (builder) => ({
    // Get user's chats
    getUserChats: builder.query<
      ChatResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `list?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),

    // Create a new chat
    createChat: builder.mutation<ChatResponse, CreateChatRequest>({
      query: (chatData) => ({
        url: "create",
        method: "POST",
        body: chatData,
        headers: {
          "Content-type": "application/json",
        },
      }),
      invalidatesTags: ["Chat"],
    }),

    // Get chat details
    getChatDetails: builder.query<ChatResponse, string>({
      query: (chatId) => ({
        url: `${chatId}`,
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),

    // Get messages for a chat
    getChatMessages: builder.query<ChatResponse, GetMessagesRequest>({
      query: ({ chatId, page = 1, limit = 50 }) => ({
        url: `${chatId}/messages?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Message"],
    }),

    // Send a text message
    sendMessage: builder.mutation<ChatResponse, SendMessageRequest>({
      query: ({ chatId, ...messageData }) => ({
        url: `${chatId}/messages`,
        method: "POST",
        body: messageData,
        headers: {
          "Content-type": "application/json",
        },
      }),
      invalidatesTags: ["Message", "Chat"],
    }),

    // Send a message with file attachments
    sendFileMessage: builder.mutation<
      ChatResponse,
      { chatId: string; files: File[]; content?: string; replyTo?: string }
    >({
      query: ({ chatId, files, content, replyTo }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        if (content) formData.append("content", content);
        if (replyTo) formData.append("replyTo", replyTo);

        return {
          url: `${chatId}/messages/file`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Message", "Chat"],
    }),

    // Mark message as read
    markMessageAsRead: builder.mutation<ChatResponse, MarkAsReadRequest>({
      query: ({ chatId }) => ({
        url: `${chatId}/messages/read`,
        method: "POST",
      }),
    }),

    // Delete a message
    deleteMessage: builder.mutation<ChatResponse, { messageId: string }>({
      query: ({ messageId }) => ({
        url: `messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Message", "Chat"],
    }),

    // Edit a message
    editMessage: builder.mutation<
      ChatResponse,
      { messageId: string; content: string }
    >({
      query: ({ messageId, content }) => ({
        url: `messages/${messageId}`,
        method: "PUT",
        body: { content },
        headers: {
          "Content-type": "application/json",
        },
      }),
      invalidatesTags: ["Message"],
    }),

    // Add participant to chat
    addParticipant: builder.mutation<
      ChatResponse,
      { chatId: string; userId: string }
    >({
      query: ({ chatId, userId }) => ({
        url: `${chatId}/participants`,
        method: "POST",
        body: { userId },
        headers: {
          "Content-type": "application/json",
        },
      }),
      invalidatesTags: ["Chat"],
    }),

    // Remove participant from chat
    removeParticipant: builder.mutation<
      ChatResponse,
      { chatId: string; userId: string }
    >({
      query: ({ chatId, userId }) => ({
        url: `${chatId}/participants/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
    }),

    // Leave chat
    leaveChat: builder.mutation<ChatResponse, string>({
      query: (chatId) => ({
        url: `${chatId}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetUserChatsQuery,
  useCreateChatMutation,
  useGetChatDetailsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useSendFileMessageMutation,
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  useLeaveChatMutation,
} = chatApi;

// Export types for use in components
export type { Chat, Message, User, CreateChatRequest, SendMessageRequest };
