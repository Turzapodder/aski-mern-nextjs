'use client'
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';
import { toast } from 'sonner';
import { 
  useGetUserChatsQuery, 
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useSendFileMessageMutation,
  useMarkMessageAsReadMutation,
  Chat,
  Message,
  User
} from '@/lib/services/chat';
import { useGetUserQuery } from '@/lib/services/auth';

interface ChatContextType {
  // State
  selectedChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  typingUsers: { [chatId: string]: User[] };
  onlineUsers: User[];
  isConnected: boolean;
  isLoading: boolean;
  chatsLoading: boolean;
  messagesLoading: boolean;
  chatsError: unknown;
  messagesError: unknown;
  currentUserId: string | null;
  
  // Actions
  selectChat: (chat: Chat) => void;
  sendMessage: (content: string, replyTo?: string) => void;
  sendFile: (file: File, replyTo?: string) => void;
  markMessageAsRead: (messageId?: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  refreshChats: () => void;
  refreshMessages: () => void;
  clearSelectedChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Local state
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: User[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  // Get current user
  const { data: userData } = useGetUserQuery();
  const currentUserId = userData?.user?._id || null;

  // RTK Query hooks
  const {
    data: chatsData,
    isLoading: chatsLoading,
    error: chatsError,
    refetch: refetchChats,
  } = useGetUserChatsQuery({});
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetChatMessagesQuery(
    selectedChat ? { chatId: selectedChat._id } : { chatId: '' },
    { skip: !selectedChat, refetchOnMountOrArgChange: true }
  );
  
  const [sendMessageMutation] = useSendMessageMutation();
  const [sendFileMutation] = useSendFileMessageMutation();
  const [markAsReadMutation] = useMarkMessageAsReadMutation();

  const connectionRef = useRef<boolean | null>(null);
  const joinedChatsRef = useRef<Set<string>>(new Set());
  const markReadInFlightRef = useRef<Record<string, boolean>>({});
  const lastReadTimeRef = useRef<Record<string, number>>({});
  const markChatReadRef = useRef<(chatId: string) => void>(() => {});

  const normalizeId = useCallback((value: any) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) {
      return typeof value._id === 'string' ? value._id : value._id.toString?.() || '';
    }
    return value.toString?.() || '';
  }, []);

  const applyLocalRead = useCallback((chatId: string) => {
    if (!currentUserId) {
      return;
    }

    setMessages(prev => prev.map(msg => {
      const senderId = normalizeId(msg.sender);
      const existingReadBy = msg.readBy || [];
      const alreadyRead = existingReadBy.some(entry => normalizeId(entry.user) === currentUserId);

      if (senderId === currentUserId || alreadyRead) return msg;

      return {
        ...msg,
        readBy: [...existingReadBy, { user: currentUserId as string, readAt: new Date() }]
      };
    }));

    setChats(prev => prev.map(chat =>
      chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
  }, [currentUserId, normalizeId]);

  // Socket connection with event handlers
  const { 
    isConnected, 
    sendMessage: socketSendMessage,
    joinChat,
    startTyping: socketStartTyping,
    stopTyping: socketStopTyping,
    markAsRead: socketMarkAsRead
  } = useSocket({
    onMessageReceived: (data: any) => {
      console.log('Received new message:', data);
      const message = data.message || data;
      const messageChatId =
        normalizeId(message?.chat);

      if (!messageChatId) {
        return;
      }

      const senderId =
        normalizeId(message?.sender);
      const isOwnMessage = Boolean(currentUserId && senderId === currentUserId);
      const isSelectedChat = Boolean(selectedChat && messageChatId === selectedChat._id);

      // Only add message if it's for the currently selected chat
      if (isSelectedChat) {
        setMessages(prev => {
          const incomingId = normalizeId(message?._id);
          const exists = incomingId
            ? prev.find(m => normalizeId(m._id) === incomingId)
            : prev.find(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });

        if (!isOwnMessage) {
          markChatReadRef.current(messageChatId);
        }
      }

      // Update last message + unread counts + ordering
      setChats(prev => {
        const chatIndex = prev.findIndex(chat => chat._id === messageChatId);
        if (chatIndex === -1) {
          refetchChats();
          return prev;
        }

        const existingChat = prev[chatIndex];
        const currentUnread = existingChat.unreadCount || 0;
        const nextUnread = isOwnMessage
          ? currentUnread
          : isSelectedChat
            ? 0
            : currentUnread + 1;

        const previewContent =
          message.content?.trim()
            ? message.content
            : message.type === 'offer'
              ? 'Custom offer'
              : message.attachments && message.attachments.length > 0
                ? 'Attachment'
                : 'File';

        const updatedChat = {
          ...existingChat,
          lastMessage: {
            content: previewContent,
            sender: message.sender,
            createdAt: message.createdAt,
            type: message.type,
            attachments: message.attachments
          },
          unreadCount: nextUnread
        };

        const nextChats = [...prev];
        nextChats.splice(chatIndex, 1);
        nextChats.unshift(updatedChat);
        return nextChats;
      });
    },

    onMessageEdited: (data: any) => {
      console.log('Message edited:', data);
      const editedMessage = data?.message || data;
      const editedChatId =
        data?.chatId || normalizeId(editedMessage?.chat);

      if (selectedChat && editedChatId === selectedChat._id && editedMessage?._id) {
        setMessages(prev => prev.map(msg => (
          msg._id === editedMessage._id ? { ...msg, ...editedMessage } : msg
        )));
      }

      if (editedChatId) {
        refetchChats();
      }
    },

    onMessageDeleted: (data: any) => {
      console.log('Message deleted:', data);
      const messageId = data?.messageId ? normalizeId(data.messageId) : '';
      const deletedChatId = data?.chatId ? normalizeId(data.chatId) : '';

      if (selectedChat && deletedChatId === selectedChat._id && messageId) {
        setMessages(prev => prev.filter(msg => normalizeId(msg._id) !== messageId));
      }

      if (deletedChatId) {
        refetchChats();
      }
    },
    
    onTypingStart: ({ chatId, userId, userName }) => {
      console.log('User started typing:', { chatId, userId, userName });
      
      // Only show typing for current chat and exclude current user
      if (selectedChat && chatId === selectedChat._id && userId !== currentUserId) {
        setTypingUsers(prev => {
          const currentTyping = prev[chatId] || [];
          const userExists = currentTyping.find(u => u._id === userId);
          
          if (userExists) return prev;
          
          return {
            ...prev,
            [chatId]: [...currentTyping, { _id: userId, name: userName, email: '' }]
          };
        });
      }
    },
    
    onTypingStop: ({ chatId, userId }) => {
      console.log('User stopped typing:', { chatId, userId });
      
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter(u => u._id !== userId)
      }));
    },
    
    onUserOnline: ({ userId, status, userData }) => {
      console.log('User online status:', { userId, status });
      
      if (status === 'online') {
        setOnlineUsers(prev => {
          const userIndex = prev.findIndex(u => u._id === userId);
          if (userIndex !== -1) {
            const next = [...prev];
            next[userIndex] = { ...next[userIndex], ...(userData || {}), isActive: true };
            return next;
          }

          return [
            ...prev,
            {
              _id: userId,
              name: userData?.name || '',
              email: userData?.email || '',
              avatar: userData?.avatar,
              isActive: true
            }
          ];
        });
      }
    },
    
    onUserOffline: ({ userId }) => {
      console.log('User went offline:', { userId });
      setOnlineUsers(prev => prev.filter(u => u._id !== userId));
    },

    onOnlineUsers: ({ users }) => {
      if (Array.isArray(users)) {
        setOnlineUsers(users.map((user: any) => ({ ...user, isActive: true })));
      }
    },
    
    onMessageRead: ({ chatId, messageId, userId }) => {
      console.log('Message read:', { chatId, messageId, userId });

      if (currentUserId && userId === currentUserId) {
        return;
      }

      const normalizedMessageId = messageId ? normalizeId(messageId) : '';

      if (selectedChat && normalizeId(chatId) === selectedChat._id && userId) {
        setMessages(prev => prev.map(msg => {
          const senderId = normalizeId(msg.sender);
          const readBy = msg.readBy || [];
          const alreadyRead = readBy.some(entry => normalizeId(entry.user) === userId);

          if (normalizedMessageId) {
            if (normalizeId(msg._id) !== normalizedMessageId || alreadyRead) return msg;
            return {
              ...msg,
              readBy: [...readBy, { user: userId, readAt: new Date() }]
            };
          }

          if (senderId !== currentUserId || alreadyRead) return msg;

          return {
            ...msg,
            readBy: [...readBy, { user: userId, readAt: new Date() }]
          };
        }));
      }
    },
    onChatUpdated: () => {
      refetchChats();
    }
  });

  useEffect(() => {
    if (connectionRef.current === null) {
      connectionRef.current = isConnected;
      return;
    }

    if (connectionRef.current && !isConnected) {
      toast.error('Realtime connection lost. Messages may be delayed.');
    }

    if (!connectionRef.current && isConnected) {
      toast.success('Realtime connection restored.');
    }

    connectionRef.current = isConnected;
  }, [isConnected]);

  // Update local state when RTK Query data changes
  useEffect(() => {
    if (chatsData?.data?.chats) {
      console.log('Updating chats from API:', chatsData.data.chats.length);
      const normalized = chatsData.data.chats.map((chat: any) => ({
        ...chat,
        participants: Array.isArray(chat.participants)
          ? chat.participants.map((participant: any) => participant.user || participant)
          : []
      }));
      setChats(normalized);
      setSelectedChat((prev) => {
        if (!prev) return prev;
        const updated = normalized.find((chat: any) => chat._id === prev._id);
        return updated || prev;
      });
    }
  }, [chatsData]);

  useEffect(() => {
    if (messagesData?.data?.messages) {
      console.log('Updating messages from API:', messagesData.data.messages.length);
      setMessages(messagesData.data.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    if (selectedChat) {
      refetchMessages();
    }
  }, [selectedChat, refetchMessages]);

  // Join chat rooms for all available conversations
  useEffect(() => {
    if (!isConnected) {
      joinedChatsRef.current.clear();
      return;
    }

    chats.forEach((chat) => {
      if (!joinedChatsRef.current.has(chat._id)) {
        joinChat(chat._id);
        joinedChatsRef.current.add(chat._id);
      }
    });
  }, [chats, isConnected, joinChat]);

  const markChatReadOnce = useCallback((chatId: string) => {
    if (!chatId || !currentUserId) {
      return;
    }

    if (markReadInFlightRef.current[chatId]) {
      return;
    }

    const now = Date.now();
    if (now - (lastReadTimeRef.current[chatId] || 0) < 1500) {
      return;
    }

    markReadInFlightRef.current[chatId] = true;
    lastReadTimeRef.current[chatId] = now;

    applyLocalRead(chatId);

    const finalize = () => {
      markReadInFlightRef.current[chatId] = false;
    };

    if (isConnected) {
      socketMarkAsRead(chatId);
      finalize();
      return;
    }

    markAsReadMutation({ chatId })
      .unwrap()
      .then(() => finalize())
      .catch((error: any) => {
        console.error('Failed to mark messages as read:', error);
        markReadInFlightRef.current[chatId] = false;
      });
  }, [applyLocalRead, currentUserId, isConnected, markAsReadMutation, socketMarkAsRead]);

  useEffect(() => {
    markChatReadRef.current = markChatReadOnce;
  }, [markChatReadOnce]);

  // Action handlers
  const selectChat = useCallback((chat: Chat) => {
    console.log('Selecting chat:', chat._id);

    if (selectedChat?._id === chat._id) {
      return;
    }

    const previousChatId = selectedChat?._id;

    setSelectedChat(chat);
    setMessages([]); // Clear messages when switching chats

    setChats(prev => prev.map(existing =>
      existing._id === chat._id ? { ...existing, unreadCount: 0 } : existing
    ));

    // Clear typing users for previous chat
    if (previousChatId) {
      setTypingUsers(prev => ({
        ...prev,
        [previousChatId]: []
      }));
    }

    markChatReadRef.current(chat._id);
  }, [selectedChat]);

  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    if (!selectedChat || !content.trim()) {
      console.warn('Cannot send message: no chat selected or empty content');
      return;
    }

    try {
      console.log('Sending message:', { chatId: selectedChat._id, content });
      
      const shouldUseSocket = isConnected;
      if (shouldUseSocket) {
        socketSendMessage(selectedChat._id, content, replyTo);
        return;
      }

      const result = await sendMessageMutation({
        chatId: selectedChat._id,
        content,
        replyTo
      }).unwrap();
      
      console.log('Message sent successfully:', result);

      if (result?.data) {
        const newMessage = result.data;
        setMessages(prev => {
          const incomingId = normalizeId(newMessage?._id);
          const exists = incomingId
            ? prev.find(m => normalizeId(m._id) === incomingId)
            : prev.find(m => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        setChats(prev => prev.map(chat =>
          chat._id === selectedChat._id
            ? {
                ...chat,
                lastMessage: {
                  content: newMessage.content || '',
                  sender: newMessage.sender,
                  createdAt: newMessage.createdAt
                }
              }
            : chat
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [selectedChat, socketSendMessage, sendMessageMutation, isConnected]);

  const sendFile = useCallback(async (file: File, replyTo?: string) => {
    if (!selectedChat) {
      console.warn('Cannot send file: no chat selected');
      return;
    }

    try {
      console.log('Sending file:', { chatId: selectedChat._id, fileName: file.name });
      
      const result = await sendFileMutation({
        chatId: selectedChat._id,
        file,
        replyTo
      }).unwrap();
      
      console.log('File sent successfully:', result);
      toast.success('File sent');
      
      // Refresh messages to get the new file message
      refetchMessages();
    } catch (error: any) {
      console.error('Failed to send file:', error);
      const message =
        error?.data?.message ||
        error?.message ||
        'Unable to send file. Please try again.';
      toast.error(message);
    }
  }, [selectedChat, sendFileMutation, refetchMessages]);

  const markMessageAsRead = useCallback(async () => {
    if (!selectedChat) {
      console.warn('Cannot mark message as read: no chat selected');
      return;
    }

    try {
      markChatReadOnce(selectedChat._id);
      console.log('Messages marked as read for chat:', selectedChat._id);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, [selectedChat, markChatReadOnce]);

  const startTyping = useCallback(() => {
    if (selectedChat && isConnected) {
      socketStartTyping(selectedChat._id);
    }
  }, [selectedChat, isConnected, socketStartTyping]);

  const stopTyping = useCallback(() => {
    if (selectedChat && isConnected) {
      socketStopTyping(selectedChat._id);
    }
  }, [selectedChat, isConnected, socketStopTyping]);

  const refreshChats = useCallback(() => {
    console.log('Refreshing chats');
    refetchChats();
  }, [refetchChats]);

  const refreshMessages = useCallback(() => {
    console.log('Refreshing messages');
    refetchMessages();
  }, [refetchMessages]);

  const clearSelectedChat = useCallback(() => {
    setSelectedChat(null);
    setMessages([]);
  }, []);

  const contextValue: ChatContextType = {
    // State
    selectedChat,
    chats,
    messages,
    typingUsers,
    onlineUsers,
    isConnected,
    isLoading: chatsLoading || messagesLoading,
    chatsLoading,
    messagesLoading,
    chatsError,
    messagesError,
    currentUserId,
    
    // Actions
    selectChat,
    sendMessage,
    sendFile,
    markMessageAsRead,
    startTyping,
    stopTyping,
    refreshChats,
    refreshMessages,
    clearSelectedChat
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
