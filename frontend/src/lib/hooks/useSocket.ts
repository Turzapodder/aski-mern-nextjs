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
  markAsRead: (chatId: string) => void;
}

interface SocketEvents {
  onMessageReceived?: (message: any) => void;
  onTypingStart?: (data: { chatId: string; userId: string; userName: string }) => void;
  onTypingStop?: (data: { chatId: string; userId: string }) => void;
  onUserJoined?: (data: { chatId: string; user: any }) => void;
  onUserLeft?: (data: { chatId: string; user: any }) => void;
  onMessageRead?: (data: { chatId: string; messageId: string; userId: string }) => void;
  onUserOnline?: (data: { userId: string; status: string }) => void;
  onUserOffline?: (data: { userId: string }) => void;
}

export const useSocket = (events: SocketEvents = {}): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Get JWT token from cookies - use accessToken first, then refreshToken as fallback
    const accessToken = Cookies.get('accessToken') || Cookies.get('refreshToken');
    
    if (!accessToken) {
      console.warn('No access token found for socket connection');
      return;
    }

    // Initialize socket connection
    const socket = io('http://localhost:8000', {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to chat server with ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server. Reason:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to chat server. Attempt:', attemptNumber);
      setIsConnected(true);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to chat server');
      setIsConnected(false);
    });

    // Chat event handlers
    socket.on('new_message', (data) => {
      console.log('Message received via socket:', data);
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
      console.log('Messages marked as read:', data);
      events.onMessageRead?.(data);
    });

    socket.on('user_online', (data) => {
      console.log('User came online:', data);
      events.onUserOnline?.(data);
    });

    socket.on('user_offline', (data) => {
      console.log('User went offline:', data);
      events.onUserOffline?.(data);
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []); // Remove dependencies to prevent reconnection loops

  // Socket action functions
  const sendMessage = (chatId: string, content: string, replyTo?: string) => {
    if (socketRef.current?.connected) {
      console.log('Sending message via socket:', { chatId, content });
      socketRef.current.emit('send_message', {
        chatId,
        content,
        type: 'text',
        replyTo
      });
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  };

  const joinChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      console.log('Joining chat via socket:', chatId);
      socketRef.current.emit('join_chat', { chatId });
    } else {
      console.warn('Socket not connected, cannot join chat');
    }
  };

  const leaveChat = (chatId: string) => {
    if (socketRef.current?.connected) {
      console.log('Leaving chat via socket:', chatId);
      socketRef.current.emit('leave_chat', { chatId });
    } else {
      console.warn('Socket not connected, cannot leave chat');
    }
  };

  const startTyping = (chatId: string) => {
    if (socketRef.current?.connected) {
      console.log('Started typing in chat:', chatId);
      socketRef.current.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId: string) => {
    if (socketRef.current?.connected) {
      console.log('Stopped typing in chat:', chatId);
      socketRef.current.emit('typing_stop', { chatId });
    }
  };

  const markAsRead = (chatId: string) => {
    if (socketRef.current?.connected) {
      console.log('Marking messages as read:', chatId);
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