import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define interfaces for chat-related data
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  subjects?: string[];
  isActive?: boolean;
}

interface Chat {
  _id: string;
  name?: string;
  description?: string;
  type: 'direct' | 'group';
  participants: User[];
  creator: string;
  avatar?: string;
  isActive: boolean;
  lastMessage?: {
    content: string;
    sender: User;
    createdAt: string;
  };
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  chat: string;
  sender: User;
  content?: string;
  type: 'text' | 'file' | 'image';
  attachments?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
  readBy: {
    user: string;
    readAt: Date;
  }[];
  isEdited: boolean;
  isDeleted: boolean;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatResponse {
  status: string;
  message: string;
  data?: any;
}

interface CreateChatRequest {
  name?: string;
  description?: string;
  type: 'direct' | 'group';
  participants: string[];
}

interface SendMessageRequest {
  chatId: string;
  content?: string;
  type?: 'text' | 'file' | 'image';
  replyTo?: string;
}

interface GetMessagesRequest {
  chatId: string;
  page?: number;
  limit?: number;
}

interface MarkAsReadRequest {
  chatId: string;
  messageId: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/api/chat/',
    credentials: 'include'
  }),
  tagTypes: ['Chat', 'Message', 'User'],
  endpoints: (builder) => ({
    // Get user's chats
    getUserChats: builder.query<ChatResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `list?page=${page}&limit=${limit}`,
        method: 'GET'
      }),
      providesTags: ['Chat']
    }),

    // Create a new chat
    createChat: builder.mutation<ChatResponse, CreateChatRequest>({
      query: (chatData) => ({
        url: 'create',
        method: 'POST',
        body: chatData,
        headers: {
          'Content-type': 'application/json'
        }
      }),
      invalidatesTags: ['Chat']
    }),

    // Get chat details
    getChatDetails: builder.query<ChatResponse, string>({
      query: (chatId) => ({
        url: `${chatId}`,
        method: 'GET'
      }),
      providesTags: ['Chat']
    }),

    // Get messages for a chat
    getChatMessages: builder.query<ChatResponse, GetMessagesRequest>({
      query: ({ chatId, page = 1, limit = 50 }) => ({
        url: `${chatId}/messages?page=${page}&limit=${limit}`,
        method: 'GET'
      }),
      providesTags: ['Message']
    }),

    // Send a text message
    sendMessage: builder.mutation<ChatResponse, SendMessageRequest>({
      query: ({ chatId, ...messageData }) => ({
        url: `${chatId}/messages`,
        method: 'POST',
        body: messageData,
        headers: {
          'Content-type': 'application/json'
        }
      }),
      invalidatesTags: ['Message', 'Chat']
    }),

    // Send a file message
    sendFileMessage: builder.mutation<ChatResponse, { chatId: string; file: File; replyTo?: string }>({
      query: ({ chatId, file, replyTo }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (replyTo) formData.append('replyTo', replyTo);
        
        return {
          url: `${chatId}/messages/file`,
          method: 'POST',
          body: formData
        };
      },
      invalidatesTags: ['Message', 'Chat']
    }),

    // Mark message as read
    markMessageAsRead: builder.mutation<ChatResponse, MarkAsReadRequest>({
      query: ({ chatId, messageId }) => ({
        url: `${chatId}/messages/${messageId}/read`,
        method: 'POST'
      }),
      invalidatesTags: ['Message']
    }),

    // Delete a message
    deleteMessage: builder.mutation<ChatResponse, { chatId: string; messageId: string }>({
      query: ({ chatId, messageId }) => ({
        url: `${chatId}/messages/${messageId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Message', 'Chat']
    }),

    // Edit a message
    editMessage: builder.mutation<ChatResponse, { chatId: string; messageId: string; content: string }>({
      query: ({ chatId, messageId, content }) => ({
        url: `${chatId}/messages/${messageId}`,
        method: 'PUT',
        body: { content },
        headers: {
          'Content-type': 'application/json'
        }
      }),
      invalidatesTags: ['Message']
    }),

    // Add participant to chat
    addParticipant: builder.mutation<ChatResponse, { chatId: string; userId: string }>({
      query: ({ chatId, userId }) => ({
        url: `${chatId}/participants`,
        method: 'POST',
        body: { userId },
        headers: {
          'Content-type': 'application/json'
        }
      }),
      invalidatesTags: ['Chat']
    }),

    // Remove participant from chat
    removeParticipant: builder.mutation<ChatResponse, { chatId: string; userId: string }>({
      query: ({ chatId, userId }) => ({
        url: `${chatId}/participants/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Chat']
    }),

    // Leave chat
    leaveChat: builder.mutation<ChatResponse, string>({
      query: (chatId) => ({
        url: `${chatId}/leave`,
        method: 'POST'
      }),
      invalidatesTags: ['Chat']
    }),

    // Tutor search
    searchTutors: builder.query<{ tutors: User[] }, { search?: string; limit?: number }>({
      query: ({ search = '', limit = 30 }) => ({
        url: `/tutors/search?search=${encodeURIComponent(search)}&limit=${limit}`,
        method: 'GET'
      }),
      providesTags: ['User']
    })
  })
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
  useSearchTutorsQuery
} = chatApi;

// Export types for use in components
export type { Chat, Message, User, CreateChatRequest, SendMessageRequest };