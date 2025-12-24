'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Phone, Search, Paperclip, Mic, Send, Smile } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { format } from 'date-fns';

const ChatWindow = () => {
    const { selectedChat, messages, sendMessage, sendFile, currentUserId, onlineUsers } = useChatContext();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newMessage.trim()) {
            await sendMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            sendFile(file);
        }
    };

    if (!selectedChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-400">
                    <p>Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    const getChatName = () => {
        if (selectedChat.name) return selectedChat.name;
        const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant?.name || 'Unknown User';
    };

    const isUserOnline = () => {
        if (selectedChat.type === 'group') return false;
        const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant && onlineUsers.some(u => u._id === otherParticipant._id);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fcfcfc]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{getChatName()}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        {isUserOnline() && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                        <span className="text-sm text-green-600 font-medium">{isUserOnline() ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Search size={20} /></button>
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => {
                    const isMe = msg.sender._id === currentUserId;
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);

                    return (
                        <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            {!isMe && (
                                <div className="w-10 h-10 flex-shrink-0">
                                    {showAvatar ? (
                                        msg.sender.avatar ? (
                                            <img src={msg.sender.avatar} alt={msg.sender.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                                                {msg.sender.name[0]}
                                            </div>
                                        )
                                    ) : <div className="w-10" />}
                                </div>
                            )}

                            <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && showAvatar && (
                                    <span className="text-sm font-medium text-gray-500 mb-1 ml-1">{msg.sender.name}</span>
                                )}

                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMe
                                        ? 'bg-[#8B5CF6] text-white rounded-tr-none'
                                        : 'bg-[#F3F4F9] text-gray-700 rounded-tl-none'
                                    }`}>
                                    {/* Content render logic for text/files/images would go here */}
                                    {msg.content}
                                </div>

                                <div className="flex items-center gap-1 mt-1 px-1">
                                    {/* Read receipts and time */}
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(msg.createdAt), 'hh:mm a')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex items-center gap-3 bg-[#F3F4F9] p-2 rounded-2xl">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Paperclip size={20} />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Your message"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-sm"
                    />

                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Mic size={20} />
                    </button>

                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 text-[#8B5CF6] hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
