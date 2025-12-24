'use client';
import React, { useState } from 'react';
import { Search, Pin, MoreHorizontal } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { format } from 'date-fns';

const ChatSidebar = () => {
    const { chats, selectChat, selectedChat, currentUserId, onlineUsers } = useChatContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChats = chats.filter(chat => {
        if (!searchTerm) return true;
        const chatName = chat.name || chat.participants.find(p => p._id !== currentUserId)?.name || 'Chat';
        return chatName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getChatName = (chat: any) => {
        if (chat.name) return chat.name;
        const otherParticipant = chat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant?.name || 'Unknown User';
    };

    const getChatAvatar = (chat: any) => {
        if (chat.avatar) return chat.avatar;
        const otherParticipant = chat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant?.avatar;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isUserOnline = (chat: any) => {
        if (chat.type === 'group') return false; // Or logic for group
        const otherParticipant = chat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant && onlineUsers.some(u => u._id === otherParticipant._id);
    };

    return (
        <div className="w-80 h-full flex flex-col bg-white border-r border-gray-100">
            {/* Search Header */}
            <div className="p-5">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#F3F4F9] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-gray-600 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-3 space-y-2">
                {filteredChats.map((chat) => {
                    const isActive = selectedChat?._id === chat._id;
                    const chatName = getChatName(chat);
                    const avatar = getChatAvatar(chat);
                    const isOnline = isUserOnline(chat);
                    const lastMessage = chat.lastMessage;

                    return (
                        <div
                            key={chat._id}
                            onClick={() => selectChat(chat)}
                            className={`group p-3 rounded-2xl cursor-pointer transition-all duration-200 ${isActive ? 'bg-[#2B2B2B] text-white shadow-lg shadow-black/5' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {avatar ? (
                                        <img src={avatar} alt={chatName} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'bg-primary-100 text-primary-600'
                                            }`}>
                                            {getInitials(chatName)}
                                        </div>
                                    )}
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                            {chatName}
                                        </h3>
                                        {lastMessage && (
                                            <span className={`text-xs whitespace-nowrap ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {format(new Date(lastMessage.createdAt), 'h:mm a')} {/* Use simple format for now */}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className={`text-xs truncate max-w-[140px] ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {lastMessage?.content || 'No messages yet'}
                                        </p>
                                        {chat.unreadCount! > 0 && (
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FF6B6B] text-white text-[10px] font-bold">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                        {/* Pin icon if needed, purely visual for now based on design */}
                                        {/* {chat.isPinned && <Pin size={14} className="text-secondary transform rotate-45" />} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatSidebar;
