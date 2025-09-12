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
    socket.on('messageReceived', (message) => {
      console.log('Message received:', message);
      events.onMessageReceived?.(message);
    });

    socket.on('typingStart', (data) => {
      console.log('User started typing:', data);
      events.onTypingStart?.(data);
    });

    socket.on('typingStop', (data) => {
      console.log('User stopped typing:', data);
      events.onTypingStop?.(data);
    });

    socket.on('userJoined', (data) => {
      console.log('User joined chat:', data);
      events.onUserJoined?.(data);
    });

    socket.on('userLeft', (data) => {
      console.log('User left chat:', data);
      events.onUserLeft?.(data);
    });

    socket.on('messageRead', (data) => {
      console.log('Message marked as read:', data);
      events.onMessageRead?.(data);
    });

    socket.on('userOnline', (user) => {
      console.log('User came online:', user);
      events.onUserOnline?.(user);
    });

    socket.on('userOffline', (user) => {
      console.log('User went offline:', user);
      events.onUserOffline?.(user);
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
      socketRef.current.emit('sendMessage', {
        chatId,
        content,
        replyTo
      });
    }
  };

  const joinChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinChat', { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveChat', { chatId });
    }
  };

  const startTyping = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { chatId });
    }
  };

  const stopTyping = (chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stopTyping', { chatId });
    }
  };

  const markAsRead = (chatId: string, messageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markAsRead', { chatId, messageId });
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