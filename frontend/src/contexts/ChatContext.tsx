'use client'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';
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

interface ChatContextType {
  // State
  selectedChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  typingUsers: { [chatId: string]: User[] };
  onlineUsers: User[];
  isConnected: boolean;
  isLoading: boolean;
  
  // Actions
  selectChat: (chat: Chat) => void;
  sendMessage: (content: string, replyTo?: string) => void;
  sendFile: (file: File, replyTo?: string) => void;
  markMessageAsRead: (messageId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  refreshChats: () => void;
  refreshMessages: () => void;
  createDirectChat: (tutorId: string) => Promise<void>;
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

  // RTK Query hooks
  const { data: chatsData, isLoading: chatsLoading, refetch: refetchChats } = useGetUserChatsQuery({});
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useGetChatMessagesQuery(
    selectedChat ? { chatId: selectedChat._id } : { chatId: '' },
    { skip: !selectedChat }
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
    onMessageReceived: (data: { message: Message; chatId: string }) => {
      const message = data.message;
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      
      // Update last message in chats list
      setChats(prev => prev.map(chat => 
        chat._id === message.chat 
          ? { ...chat, lastMessage: {
              content: message.content || 'File',
              sender: message.sender,
              createdAt: message.createdAt
            }}
          : chat
      ));
    },
    
    onTypingStart: ({ chatId, userId, userName }) => {
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), { _id: userId, name: userName }].filter(
          (u, index, arr) => arr.findIndex(user2 => user2._id === u._id) === index
        )
      }));
    },
    
    onTypingStop: ({ chatId, userId }) => {
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter(u => u._id !== userId)
      }));
    },
    
    onUserOnline: ({ userId, status }) => {
      const user = { _id: userId, name: '', email: '', isActive: status === 'online' };
      setOnlineUsers(prev => {
        if (prev.find(u => u._id === user._id)) return prev;
        return [...prev, user];
      });
    },
    
    onUserOffline: ({ userId }) => {
      setOnlineUsers(prev => prev.filter(u => u._id !== userId));
    },
    
    onMessageRead: ({ chatId, userId }) => {
      setMessages(prev => prev.map(msg => 
        msg.chat === chatId && msg.sender._id !== userId
          ? {
              ...msg,
              readBy: [...msg.readBy, { user: userId, readAt: new Date() }]
            }
          : msg
      ));
    }
  });

  // Update local state when RTK Query data changes
  useEffect(() => {
    if (chatsData?.data) {
      setChats(chatsData.data.chats || []);
    }
  }, [chatsData]);

  useEffect(() => {
    if (messagesData?.data) {
      setMessages(messagesData.data.messages || []);
    }
  }, [messagesData]);

  // Join/leave chat rooms when selected chat changes
  useEffect(() => {
    if (selectedChat && isConnected) {
      joinChat(selectedChat._id);
      return () => {
        leaveChat(selectedChat._id);
      };
    }
  }, [selectedChat, isConnected, joinChat, leaveChat]);

  // Action handlers
  const selectChat = useCallback((chat: Chat) => {
    if (selectedChat) {
      leaveChat(selectedChat._id);
    }
    setSelectedChat(chat);
    setMessages([]); // Clear messages when switching chats
  }, [selectedChat, leaveChat]);

  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    if (!selectedChat || !content.trim()) return;

    try {
      // Send via Socket.IO for real-time delivery
      socketSendMessage(selectedChat._id, content, replyTo);
      
      // Also send via REST API for persistence
      await sendMessageMutation({
        chatId: selectedChat._id,
        content,
        replyTo
      }).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [selectedChat, socketSendMessage, sendMessageMutation]);

  const sendFile = useCallback(async (file: File, replyTo?: string) => {
    if (!selectedChat) return;

    try {
      await sendFileMutation({
        chatId: selectedChat._id,
        file,
        replyTo
      }).unwrap();
      
      // Refresh messages to get the new file message
      refetchMessages();
    } catch (error) {
      console.error('Failed to send file:', error);
    }
  }, [selectedChat, sendFileMutation, refetchMessages]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!selectedChat) return;

    try {
      // Mark as read via Socket.IO
      socketMarkAsRead(selectedChat._id, messageId);
      
      // Also mark via REST API
      await markAsReadMutation({
        chatId: selectedChat._id,
        messageId
      }).unwrap();
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
    refetchChats();
  }, [refetchChats]);

  const refreshMessages = useCallback(() => {
    refetchMessages();
  }, [refetchMessages]);

  const createDirectChat = useCallback(async (tutorId: string) => {
    try {
      // Check if a direct chat already exists with this tutor
      const existingChat = chats.find(
        (chat: any) => 
          chat.type === 'direct' && 
          chat.participants.some((p: any) => p._id === tutorId)
      );
      
      if (existingChat) {
        // If chat exists, just select it
        selectChat(existingChat);
        return;
      }
      
      // Create direct chat via API
      const response = await fetch('http://localhost:8000/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('accessToken=')[1]?.split(';')[0]}`
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'direct',
          tutorId
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Add new chat to local state
        setChats(prev => [data.chat, ...prev]);
        selectChat(data.chat);
        // Refresh chats to get updated list
        refetchChats();
      }
      
    } catch (error) {
      console.error('Error creating direct chat:', error);
      throw error;
    }
  }, [chats, selectChat]);

  const contextValue: ChatContextType = {
    // State
    selectedChat,
    chats,
    messages,
    typingUsers,
    onlineUsers,
    isConnected,
    isLoading: chatsLoading || messagesLoading,
    
    // Actions
    selectChat,
    sendMessage,
    sendFile,
    markMessageAsRead,
    startTyping,
    stopTyping,
    refreshChats,
    refreshMessages,
    createDirectChat
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;