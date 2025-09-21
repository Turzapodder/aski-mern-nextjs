import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (chatId: string, content: string, replyTo?: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  markAsRead: (chatId: string, messageId: string) => void;
}

interface SocketEvents {
  onMessageReceived?: (message: any) => void;
  onTypingStart?: (data: { chatId: string; user: any }) => void;
  onTypingStop?: (data: { chatId: string; user: any }) => void;
  onUserJoined?: (data: { chatId: string; user: any }) => void;
  onUserLeft?: (data: { chatId: string; user: any }) => void;
  onMessageRead?: (data: { chatId: string; messageId: string; user: any }) => void;
  onUserOnline?: (user: any) => void;
  onUserOffline?: (user: any) => void;
}

export const useSocket = (events: SocketEvents = {}): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Get JWT token from cookies
    const token = Cookies.get('accessToken');
    
    if (!token) {
      console.warn('No authentication token found');
      return;
    }

    // Initialize socket connection
    const socket = io('http://localhost:8000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Chat event handlers
    socket.on('new_message', (data) => {
      console.log('Message received:', data);
      events.onMessageReceived?.(data);
    });

    socket.on('user_typing', (data) => {
      console.log('User started typing:', data);
      events.onTypingStart?.(data);
    });

    socket.on('user_stopped_typing', (data) => {
      console.log('User stopped typing:', data);
      events.onTypingStop?.(data);
    });

    socket.on('joined_chat', (data) => {
      console.log('User joined chat:', data);
      events.onUserJoined?.(data);
    });

    socket.on('left_chat', (data) => {
      console.log('User left chat:', data);
      events.onUserLeft?.(data);
    });

    socket.on('messages_read', (data) => {
      console.log('Message marked as read:', data);
      events.onMessageRead?.(data);
    });

    socket.on('user_presence_updated', (data) => {
      console.log('User presence updated:', data);
      if (data.status === 'online') {
        events.onUserOnline?.(data);
      } else {
        events.onUserOffline?.(data);
      }
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []);

  // Socket action functions
  const sendMessage = (chatId: string, content: string, replyTo?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        chatId,
        content,
        type: 'text',
        replyTo
      });
    }
  };

  const joinChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_chat', { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_chat', { chatId });
    }
  };

  const startTyping = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { chatId });
    }
  };

  const markAsRead = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_messages_read', { chatId });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    markAsRead
  };
};

export default useSocket;