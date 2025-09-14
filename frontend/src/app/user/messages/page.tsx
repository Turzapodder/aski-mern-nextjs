'use client'
import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { 
  Search, Phone, Video, MoreHorizontal, Smile, Paperclip, Send, 
  Users, Settings, Bell, Plus, File, Image as ImageIcon, MessageSquare
} from 'lucide-react'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import { useGetUserQuery } from '@/lib/services/auth'
import { formatDistanceToNow } from 'date-fns'
import TutorSearchModal from '@/components/TutorSearchModal'
import DashboardLayout from '@/components/DashboardLayout'

// Chat List Component
const ChatList = () => {
  const { chats, selectedChat, selectChat, isLoading } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showTutorSearch, setShowTutorSearch] = useState(false);

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getChatName = (chat: any) => {
    if (chat.name) return chat.name;
    if (chat.type === 'direct') {
      // For direct chats, show the other participant's name
      const otherParticipant = chat.participants.find((p: any) => p._id !== 'current_user_id');
      return otherParticipant?.name || 'Unknown User';
    }
    return 'Group Chat';
  };

  const getChatAvatar = (chat: any) => {
    const name = getChatName(chat);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Chat List Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <button 
            onClick={() => setShowTutorSearch(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No chats found' : 'No conversations yet'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div 
              key={chat._id}
              onClick={() => selectChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedChat?._id === chat._id ? 'bg-primary-100 border-r-2 border-r-primary-300' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {getChatAvatar(chat)}
                    </span>
                  </div>
                  {/* Online indicator - you can implement this based on your online users logic */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {getChatName(chat)}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage ? (
                      chat.type === 'group' ? 
                        `${chat.lastMessage.sender.name}: ${chat.lastMessage.content}` :
                        chat.lastMessage.content
                    ) : 'No messages yet'}
                  </p>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <span className="inline-block bg-primary-300 text-white text-xs rounded-full px-2 py-1 mt-1">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Tutor Search Modal */}
      <TutorSearchModal 
        isOpen={showTutorSearch}
        onClose={() => setShowTutorSearch(false)}
      />
    </div>
  );
};

// Messages Component
const MessagesArea = () => {
  const { 
    selectedChat, 
    messages, 
    sendMessage, 
    sendFile, 
    typingUsers, 
    isConnected,
    startTyping,
    stopTyping
  } = useChatContext();
  const { data: userData } = useGetUserQuery();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = userData?.user?._id;

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(message.trim());
      setMessage('');
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      sendFile(file);
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  const isOwnMessage = (senderId: string) => senderId === currentUserId;

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p>Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  const getChatName = () => {
    if (selectedChat.name) return selectedChat.name;
    if (selectedChat.type === 'direct') {
      const otherParticipant = selectedChat.participants.find(p => p._id !== currentUserId);
      return otherParticipant?.name || 'Unknown User';
    }
    return 'Group Chat';
  };

  const currentTypingUsers = typingUsers[selectedChat._id] || [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {getChatName().split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getChatName()}</h3>
              <div className="flex items-center space-x-2">
                {selectedChat.type === 'group' && (
                  <p className="text-sm text-gray-500">{selectedChat.participants.length} members</p>
                )}
                {!isConnected && (
                  <span className="text-xs text-red-500">• Disconnected</span>
                )}
                {isConnected && (
                  <span className="text-xs text-primary-300">• Connected</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Video size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Users size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = isOwnMessage(msg.sender._id);
            
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                  {!isOwn && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-xs font-medium">
                        {msg.sender.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div className={`rounded-lg px-4 py-2 ${
                    isOwn 
                      ? 'bg-primary-300 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {!isOwn && selectedChat.type === 'group' && (
                      <p className="text-xs font-medium mb-1 text-gray-600">{msg.sender.name}</p>
                    )}
                    
                    {msg.type === 'text' && msg.content && (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    
                    {msg.type === 'file' && msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-2">
                        {msg.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {attachment.mimetype.startsWith('image/') ? (
                              <ImageIcon size={16} />
                            ) : (
                              <File size={16} />
                            )}
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm underline hover:no-underline"
                            >
                              {attachment.originalName}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {currentTypingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xs">...</span>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-600">
                  {currentTypingUsers.map(u => u.name).join(', ')} {currentTypingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.docx,.doc"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Write a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Smile size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-primary-300 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Right Sidebar Component
const RightSidebar = () => {
  const { selectedChat } = useChatContext();
  const [showMembers, setShowMembers] = useState(true);
  const [showFiles, setShowFiles] = useState(true);

  if (!selectedChat) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Members Section */}
      {selectedChat.type === 'group' && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Members</h3>
            <button 
              onClick={() => setShowMembers(!showMembers)}
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
          {showMembers && (
            <div className="space-y-3">
              {selectedChat.participants.map((member) => (
                <div key={member._id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Files Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Files</h3>
          <button 
            onClick={() => setShowFiles(!showFiles)}
            className="text-gray-500 hover:text-gray-700"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
        {showFiles && (
          <div className="text-center text-gray-500">
            <p className="text-sm">No files shared yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Messages Page Component
const MessagesPageContent = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <ChatList />
      <MessagesArea />
      <RightSidebar />
    </div>
  );
};

// Main Messages Page with Provider
const MessagesPage = () => {
  return (
      <ChatProvider>
        <MessagesPageContent />
      </ChatProvider>
  );
};

export default MessagesPage;