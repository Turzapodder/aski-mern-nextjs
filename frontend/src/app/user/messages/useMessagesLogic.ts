import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatContext } from '@/contexts/ChatContext';

export const useMessagesLogic = () => {
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

  return {
    showRightSidebar,
    setShowRightSidebar,
    selectedChat
  }
}
