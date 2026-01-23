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

  // Get current user
  const { data: userData } = useGetUserQuery();
  const currentUserId = userData?.user?._id || null;

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
    onMessageReceived: (data: any) => {
      console.log('Received new message:', data);
      const message = data.message || data;
      
      // Only add message if it's for the currently selected chat
      if (selectedChat && message.chat === selectedChat._id) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.find(m => m._id === message._id);
          if (exists) return prev;
          
          return [...prev, message];
        });
      }
      
      // Update last message in chats list regardless of selected chat
      setChats(prev => prev.map(chat => 
        chat._id === message.chat 
          ? { 
              ...chat, 
              lastMessage: {
                content: message.content || 'File',
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
    }
  });

  // Update local state when RTK Query data changes
  useEffect(() => {
    if (chatsData?.data?.chats) {
      console.log('Updating chats from API:', chatsData.data.chats.length);
      setChats(chatsData.data.chats);
    }
  }, [chatsData]);

  useEffect(() => {
    if (messagesData?.data?.messages) {
      console.log('Updating messages from API:', messagesData.data.messages.length);
      setMessages(messagesData.data.messages);
    }
  }, [messagesData]);

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
      const unreadMessages = messages.filter(msg => 
        msg.sender._id !== currentUserId && 
        !msg.readBy.some(r => r.user === currentUserId)
      );
      
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
      
      // Send via Socket.IO for real-time delivery
      socketSendMessage(selectedChat._id, content, replyTo);
      
      // Also send via REST API for persistence (as backup)
      const result = await sendMessageMutation({
        chatId: selectedChat._id,
        content,
        replyTo
      }).unwrap();
      
      console.log('Message sent successfully:', result);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [selectedChat, socketSendMessage, sendMessageMutation]);

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
      
      // Refresh messages to get the new file message
      refetchMessages();
    } catch (error) {
      console.error('Failed to send file:', error);
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

  const createDirectChat = useCallback(async (tutorId: string) => {
    try {
      console.log('Creating direct chat with tutor:', tutorId);
      
      // Check if a direct chat already exists with this tutor
      const existingChat = chats.find(
        (chat: any) => 
          chat.type === 'direct' && 
          chat.participants.some((p: any) => p.user._id === tutorId || p.user === tutorId)
      );
      
      if (existingChat) {
        console.log('Direct chat already exists:', existingChat._id);
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
        console.log('Direct chat created successfully:', data.chat);
        // Add new chat to local state
        setChats(prev => [data.chat, ...prev]);
        selectChat(data.chat);
        // Refresh chats to get updated list
        refetchChats();
      } else {
        throw new Error(data.message || 'Failed to create chat');
      }
      
    } catch (error) {
      console.error('Error creating direct chat:', error);
      throw error;
    }
  }, [chats, selectChat, refetchChats]);

  const contextValue: ChatContextType = {
    // State
    selectedChat,
    chats,
    messages,
    typingUsers,
    onlineUsers,
    isConnected,
    isLoading: chatsLoading || messagesLoading,
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
    createDirectChat
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
