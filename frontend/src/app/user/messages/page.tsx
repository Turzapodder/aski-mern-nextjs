'use client';
import React, { useState } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatRightSidebar from '@/components/chat/ChatRightSidebar';

export default function ChatPage() {
    const [showRightSidebar, setShowRightSidebar] = useState(true);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* Left Sidebar */}
            <ChatSidebar />

            {/* Main Chat Area */}
            <ChatWindow />

            {/* Right Sidebar - Receiver Info */}
            <ChatRightSidebar
                isOpen={showRightSidebar}
                onClose={() => setShowRightSidebar(false)}
            />
        </div>
    );
}
