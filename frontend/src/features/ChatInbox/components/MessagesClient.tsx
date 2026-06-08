'use client';

import React from 'react';
import ChatSidebar from '@/features/ChatInbox/components/ChatSidebar';
import ChatWindow from '@/features/ChatInbox/components/ChatWindow';
import ChatRightSidebar from '@/features/ChatInbox/components/ChatRightSidebar';
import { useMessagesLogic } from '../hooks/useMessagesLogic';

export const MessagesClient = () => {
  const {
    showRightSidebar,
    setShowRightSidebar,
    selectedChat,
    mobileView,
    handleSelectChat,
    handleBackToList,
    handleOpenDetails,
    handleCloseDetails,
  } = useMessagesLogic();

  return (
    <div className="flex h-full overflow-hidden bg-[#f5f6f8]">
      {/* Left Sidebar — always visible on md+, toggle on mobile */}
      <div
        className={`${
          mobileView === 'list' ? 'flex' : 'hidden'
        } md:flex w-full md:w-80 min-w-0`}
      >
        <ChatSidebar onSelectChat={handleSelectChat} />
      </div>

      {/* Main Chat Area — always visible on md+, toggle on mobile */}
      <div
        className={`${
          mobileView === 'chat' ? 'flex' : 'hidden'
        } md:flex flex-1 min-w-0`}
      >
        <ChatWindow
          onBackToList={handleBackToList}
          onOpenDetails={handleOpenDetails}
        />
      </div>

      {/* Right Sidebar — always visible on xl+, full-screen overlay on mobile */}
      {/* Desktop: standard side panel */}
      <div className="hidden xl:flex">
        <ChatRightSidebar
          isOpen={showRightSidebar}
          onClose={() => setShowRightSidebar(false)}
        />
      </div>

      {/* Mobile/Tablet: full-screen details view */}
      <div
        className={`${
          mobileView === 'details' ? 'flex' : 'hidden'
        } xl:hidden w-full`}
      >
        <ChatRightSidebar
          isOpen={true}
          onClose={handleCloseDetails}
          isMobileFullScreen
        />
      </div>
    </div>
  );
};
