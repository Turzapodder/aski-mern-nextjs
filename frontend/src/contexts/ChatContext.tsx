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
  markMessageAsRead: (messageId: string) => void;
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

  // Socket connection with event handlers
  const { 
    isConnected, 
    sendMessage: socketSendMessage,
    joinChat,
    leaveChat,
    startTyping: socketStartTyping,
    stopTyping: socketStopTyping,
    markAsRead: socketMarkAsRead
  } = useSocket({
    onMessageReceived: (data: any) => {
      console.log('Received new message:', data);
      const message = data.message || data;
      const messageChatId =
        typeof message.chat === "object" && message.chat
          ? message.chat._id
          : message.chat;
      
      // Only add message if it's for the currently selected chat
      if (selectedChat && messageChatId === selectedChat._id) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.find(m => m._id === message._id);
          if (exists) return prev;
          
          return [...prev, message];
        });
      }
      
      // Update last message in chats list regardless of selected chat
      setChats(prev => prev.map(chat => 
        chat._id === messageChatId 
          ? { 
              ...chat, 
              lastMessage: {
                content: message.content || (message.type === 'offer' ? 'Custom offer' : 'File'),
                sender: message.sender,
                createdAt: message.createdAt
              }
            }
          : chat
      ));
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
    
    onUserOnline: ({ userId, status }) => {
      console.log('User online status:', { userId, status });
      
      if (status === 'online') {
        setOnlineUsers(prev => {
          const userExists = prev.find(u => u._id === userId);
          if (userExists) return prev;
          
          return [...prev, { _id: userId, name: '', email: '', isActive: true }];
        });
      }
    },
    
    onUserOffline: ({ userId }) => {
      console.log('User went offline:', { userId });
      setOnlineUsers(prev => prev.filter(u => u._id !== userId));
    },
    
    onMessageRead: ({ chatId, messageId, userId }) => {
      console.log('Message read:', { chatId, messageId, userId });
      
      if (selectedChat && chatId === selectedChat._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId
            ? {
                ...msg,
                readBy: [...msg.readBy, { user: userId, readAt: new Date() }]
              }
            : msg
        ));
      }
    },
    onChatUpdated: () => {
      refetchChats();
    }
  });

  const connectionRef = useRef<boolean | null>(null);

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

  // Join/leave chat rooms when selected chat changes
  useEffect(() => {
    if (selectedChat && isConnected) {
      console.log('Joining chat room:', selectedChat._id);
      joinChat(selectedChat._id);
      
      return () => {
        console.log('Leaving chat room:', selectedChat._id);
        leaveChat(selectedChat._id);
      };
    }
  }, [selectedChat, isConnected, joinChat, leaveChat]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChat && messages.length > 0 && currentUserId) {
      const unreadMessages = messages.filter(msg => {
        const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
        return senderId !== currentUserId && !msg.readBy.some(r => r.user === currentUserId);
      });
      
      if (unreadMessages.length > 0) {
        socketMarkAsRead(selectedChat._id);
      }
    }
  }, [selectedChat, messages, currentUserId, socketMarkAsRead]);

  // Action handlers
  const selectChat = useCallback((chat: Chat) => {
    console.log('Selecting chat:', chat._id);
    
    if (selectedChat && selectedChat._id !== chat._id) {
      leaveChat(selectedChat._id);
    }
    
    setSelectedChat(chat);
    setMessages([]); // Clear messages when switching chats
    
    // Clear typing users for previous chat
    if (selectedChat) {
      setTypingUsers(prev => ({
        ...prev,
        [selectedChat._id]: []
      }));
    }
  }, [selectedChat, leaveChat]);

  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    if (!selectedChat || !content.trim()) {
      console.warn('Cannot send message: no chat selected or empty content');
      return;
    }

    try {
      console.log('Sending message:', { chatId: selectedChat._id, content });
      
      const shouldUseSocket = isConnected;
      if (shouldUseSocket) {
        // Send via Socket.IO for real-time delivery
        socketSendMessage(selectedChat._id, content, replyTo);
      }
      
      // Also send via REST API for persistence (as backup)
      const result = await sendMessageMutation({
        chatId: selectedChat._id,
        content,
        replyTo
      }).unwrap();
      
      console.log('Message sent successfully:', result);

      if (!shouldUseSocket && result?.data) {
        const newMessage = result.data;
        setMessages(prev => {
          const exists = prev.find(m => m._id === newMessage._id);
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

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!selectedChat) {
      console.warn('Cannot mark message as read: no chat selected');
      return;
    }

    try {
      // Mark as read via Socket.IO
      socketMarkAsRead(selectedChat._id);
      
      // Also mark via REST API
      await markAsReadMutation({
        chatId: selectedChat._id,
        messageId
      }).unwrap();
      
      console.log('Message marked as read:', messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, [selectedChat, socketMarkAsRead, markAsReadMutation]);

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
    if (selectedChat) {
      leaveChat(selectedChat._id);
    }
    setSelectedChat(null);
    setMessages([]);
  }, [leaveChat, selectedChat]);

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
