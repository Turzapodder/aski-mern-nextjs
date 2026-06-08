import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatContext } from '@/contexts/ChatContext';

export type MobileView = 'list' | 'chat' | 'details';

export const useMessagesLogic = () => {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const searchParams = useSearchParams();
  const { chats, selectChat, selectedChat, clearSelectedChat } = useChatContext();

  useEffect(() => {
    if (!chats.length) return;

    const chatId = searchParams.get('chatId');
    if (chatId) {
      if (selectedChat?._id === chatId) return;
      const target = chats.find((chat) => chat._id === chatId);
      if (target) {
        selectChat(target);
        setMobileView('chat');
      }
      return;
    }

    if (!selectedChat) {
      selectChat(chats[0]);
    }
  }, [chats, searchParams, selectChat, selectedChat]);

  const handleSelectChat = useCallback(
    (chat: any) => {
      selectChat(chat);
      setMobileView('chat');
    },
    [selectChat]
  );

  const handleBackToList = useCallback(() => {
    clearSelectedChat();
    setMobileView('list');
  }, [clearSelectedChat]);

  const handleOpenDetails = useCallback(() => {
    setMobileView('details');
  }, []);

  const handleCloseDetails = useCallback(() => {
    setMobileView('chat');
  }, []);

  return {
    showRightSidebar,
    setShowRightSidebar,
    selectedChat,
    mobileView,
    setMobileView,
    handleSelectChat,
    handleBackToList,
    handleOpenDetails,
    handleCloseDetails,
  };
};
