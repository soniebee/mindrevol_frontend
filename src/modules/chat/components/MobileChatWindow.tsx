import React, { useMemo } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useChat } from '../hooks/useChat';
import { MobileChatHeader } from './MobileChatHeader';
import { MobileMessageList } from './MobileMessageList';
import { MobileChatInput } from './MobileChatInput';

export const MobileChatWindow = () => {
  const { activeConversationId, conversations } = useChatStore();
  
  const activeConv = useMemo(() => {
      const existingConv = conversations.find(c => c.id === activeConversationId);
      if (existingConv) return existingConv;
      if (activeConversationId && activeConversationId.startsWith('friend_')) {
          return {
              id: activeConversationId,
              partner: { id: activeConversationId.split('_')[1], fullname: 'Người dùng mới', avatarUrl: '' },
              isVirtual: true
          } as any;
      }
      return null;
  }, [activeConversationId, conversations]);

  const { messages, sendMessage, blockUser, unfriendUser, currentUserId } = useChat(activeConversationId, activeConv?.partner?.id);

  if (!activeConv) return null; // Nếu không có conv, layout cha sẽ không render cái này

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative font-sans w-full">
      <MobileChatHeader partner={activeConv.partner} onBlock={blockUser} onUnfriend={unfriendUser} />
      <MobileMessageList messages={messages} currentUserId={currentUserId} partnerAvatar={activeConv.partner?.avatarUrl} />
      <MobileChatInput onSend={sendMessage} />
    </div>
  );
};