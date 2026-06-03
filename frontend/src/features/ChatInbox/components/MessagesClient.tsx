'use client';

import React from 'react';
import ChatSidebar from '@/features/ChatInbox/components/ChatSidebar';
import ChatWindow from '@/features/ChatInbox/components/ChatWindow';
import ChatRightSidebar from '@/features/ChatInbox/components/ChatRightSidebar';
import { useMessagesLogic } from '../hooks/useMessagesLogic';

export const MessagesClient = () => {
  const { showRightSidebar, setShowRightSidebar, selectedChat } = useMessagesLogic();

  return (
    <div className="flex h-full overflow-hidden bg-[#f5f6f8]">
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
        <ChatRightSidebar isOpen={showRightSidebar} onClose={() => setShowRightSidebar(false)} />
      </div>
    </div>
  );
};
