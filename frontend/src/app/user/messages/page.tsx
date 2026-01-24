'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatRightSidebar from '@/components/chat/ChatRightSidebar';
import { useChatContext } from '@/contexts/ChatContext';

export default function ChatPage() {
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const searchParams = useSearchParams();
    const { chats, selectChat, selectedChat } = useChatContext();

    useEffect(() => {
        if (!chats.length) return;

        const chatId = searchParams.get('chatId');
        if (chatId) {
            if (selectedChat?._id === chatId) return;
            const target = chats.find((chat) => chat._id === chatId);
            if (target) {
                selectChat(target);
            }
            return;
        }

        if (!selectedChat) {
            selectChat(chats[0]);
        }
    }, [chats, searchParams, selectChat, selectedChat]);

    return (
        <div className="flex h-[100dvh] md:h-[calc(100vh-64px)] overflow-hidden bg-[#f5f6f8]">
            {/* Left Sidebar */}
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 min-w-0`}>
                <ChatSidebar />
            </div>

            {/* Main Chat Area */}
            <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0`}>
                <ChatWindow />
            </div>

            {/* Right Sidebar - Receiver Info */}
            <div className="hidden xl:flex">
                <ChatRightSidebar
                    isOpen={showRightSidebar}
                    onClose={() => setShowRightSidebar(false)}
                />
            </div>
        </div>
    );
}
