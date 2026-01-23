'use client';
import React, { useState } from 'react';
import Image from "next/image";
import { X, ChevronDown, ChevronUp, Image as ImageIcon, Video, FileText, Music, Link as LinkIcon, Mic } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

const ChatRightSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { selectedChat, currentUserId, onlineUsers } = useChatContext();
    const [expandedSection, setExpandedSection] = useState<string | null>('photos');

    if (!isOpen || !selectedChat) return null;

    const getChatName = () => {
        if (selectedChat.name) return selectedChat.name;
        const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant?.name || 'Unknown User';
    };

    const getChatAvatar = () => {
        if (selectedChat.avatar) return selectedChat.avatar;
        const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant?.avatar;
    };

    const isUserOnline = () => {
        if (selectedChat.type === 'group') return false;
        const otherParticipant = selectedChat.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant && onlineUsers.some(u => u._id === otherParticipant._id);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const chatName = getChatName();
    const avatar = getChatAvatar();

    const AccordionItem = ({
        id,
        title,
        icon: Icon,
        count,
        children
    }: {
        id: string;
        title: string;
        icon: any;
        count?: number;
        children?: React.ReactNode
    }) => {
        const isExpanded = expandedSection === id;

        return (
            <div className="border-b border-gray-100 last:border-0">
                <button
                    onClick={() => setExpandedSection(isExpanded ? null : id)}
                    className="w-full flex items-center justify-between py-4 px-1 hover:bg-gray-50 transition-colors rounded-lg"
                >
                    <div className="flex items-center gap-3 text-gray-600">
                        <Icon size={18} />
                        <span className="text-sm font-medium">{title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                </button>
                {isExpanded && (
                    <div className="pb-4 px-1">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-80 bg-white border-l border-gray-100 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Receiver Info</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <X size={20} />
                </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 flex flex-col items-center border-b border-gray-100">
                <div className="relative mb-4">
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt={chatName}
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-2xl object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-medium shadow-sm">
                            {getInitials(chatName)}
                        </div>
                    )}
                    {isUserOnline() && (
                        <div className="absolute bottom-[-6px] right-[-6px] w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        </div>
                    )}
                </div>
                <h4 className="text-lg font-bold text-gray-900">{chatName}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isUserOnline() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-500">{isUserOnline() ? 'Online' : 'Offline'}</span>
                </div>
            </div>

            {/* Files & Media */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Files</h5>

                <AccordionItem id="photos" title="Photos" icon={ImageIcon} count={265}>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Placeholders for now */}
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                    </div>
                </AccordionItem>

                <AccordionItem id="videos" title="Videos" icon={Video} count={13} />
                <AccordionItem id="files" title="Files" icon={FileText} count={378} />
                <AccordionItem id="audio" title="Audio files" icon={Music} count={21} />
                <AccordionItem id="links" title="Shared links" icon={LinkIcon} count={45} />
                <AccordionItem id="voice" title="Voice messages" icon={Mic} count={2589} />
            </div>
        </div>
    );
};

export default ChatRightSidebar;
