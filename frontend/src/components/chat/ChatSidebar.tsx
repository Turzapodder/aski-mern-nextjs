'use client';
import React, { useMemo, useState } from 'react';
import Image from "next/image";
import { Search } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const ChatSidebar = () => {
    const {
        chats,
        selectChat,
        selectedChat,
        currentUserId,
        onlineUsers,
        chatsLoading,
        chatsError,
        typingUsers,
        isConnected
    } = useChatContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredChats = chats.filter(chat => {
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase();
        const chatName = chat.name || chat.participants.find(p => p._id !== currentUserId)?.name || 'Chat';
        const lastMessage = chat.lastMessage?.content || '';
        return (
            chatName.toLowerCase().includes(query) ||
            lastMessage.toLowerCase().includes(query)
        );
    });

    const unreadTotal = useMemo(
        () => chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0),
        [chats]
    );

    const visibleChats = filteredChats.filter((chat) => {
        if (filter === 'unread') {
            return (chat.unreadCount || 0) > 0;
        }
        return true;
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
        <div className="w-full md:w-80 h-full flex flex-col bg-white border-r border-gray-100 min-w-0">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Inbox</p>
                        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                    </div>
                    {!isConnected && (<div
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase bg-amber-100 text-amber-700`}
                    >
                        Network Offline
                    </div>)}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span>{chats.length} chats</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>{unreadTotal} unread</span>
                </div>
            </div>

            {/* Search Header */}
            <div className="p-5 pb-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#F3F4F9] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-gray-600 placeholder-gray-400"
                    />
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('unread')}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${filter === 'unread' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Unread {unreadTotal > 0 ? `(${unreadTotal})` : ''}
                    </button>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-3 space-y-2">
                {chatsLoading && (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="rounded-2xl border border-gray-100 bg-white p-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-2/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!chatsLoading && Boolean(chatsError) && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        Unable to load chats right now.
                    </div>
                )}

                {!chatsLoading && !Boolean(chatsError) && visibleChats.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                        <p className="text-sm font-semibold text-gray-900">No conversations yet</p>
                        <p className="mt-2 text-xs text-gray-500">
                            Proposals and assignment messages will appear here.
                        </p>
                    </div>
                )}

                {!chatsLoading && !Boolean(chatsError) && visibleChats.map((chat) => {
                    const isActive = selectedChat?._id === chat._id;
                    const chatName = getChatName(chat);
                    const avatar = getChatAvatar(chat);
                    const isOnline = isUserOnline(chat);
                    const lastMessage = chat.lastMessage;
                    const typing = typingUsers[chat._id] || [];
                    const previewText = typing.length
                        ? `${typing[0]?.name || "Someone"} is typing...`
                        : lastMessage?.content
                            ? lastMessage.content
                            : lastMessage?.type === 'offer'
                                ? 'Custom offer'
                                : lastMessage?.type
                                    ? 'Attachment'
                                    : 'No messages yet';

                    return (
                        <button
                            key={chat._id}
                            onClick={() => selectChat(chat)}
                            className={`group w-full text-left p-3 rounded-2xl cursor-pointer transition-all duration-200 ${isActive
                                ? 'bg-gray-900 text-white shadow-lg shadow-black/5'
                                : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {avatar ? (
                                        <Image
                                            src={avatar}
                                            alt={chatName}
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
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
                                            <span className={`text-xs whitespace-nowrap ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                                                {format(new Date(lastMessage.createdAt), 'h:mm a')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <p className={`text-xs truncate max-w-[160px] ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {previewText}
                                        </p>
                                        {typeof chat.unreadCount === 'number' && chat.unreadCount > 0 && (
                                            <div className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#FF6B6B] text-white text-[10px] font-bold px-1">
                                                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatSidebar;
