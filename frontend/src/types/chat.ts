export interface ChatUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  subjects?: string[];
  isActive?: boolean;
  roles?: string[];
}

export interface Chat {
  _id: string;
  name?: string;
  description?: string;
  type: "direct" | "group";
  participants: ChatUser[];
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
    sender: ChatUser;
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

export interface Message {
  _id: string;
  chat: string | { _id?: string };
  sender: ChatUser | string;
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

export interface ChatResponse {
  status: string;
  message: string;
  data?: any;
}

export interface CreateChatRequest {
  name?: string;
  description?: string;
  type: "direct" | "group";
  participants: string[];
  tutorId?: string;
  assignmentId?: string;
  proposalId?: string;
}

export interface SendMessageRequest {
  chatId: string;
  content?: string;
  type?: "text" | "file" | "image";
  replyTo?: string;
}

export interface GetMessagesRequest {
  chatId: string;
  page?: number;
  limit?: number;
}

export interface MarkAsReadRequest {
  chatId: string;
}
