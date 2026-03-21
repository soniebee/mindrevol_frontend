import React, { useMemo } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export const ChatWindow = () => {
  const { activeConversationId, conversations } = useChatStore();
  
  // Hàm tìm kiếm Conversation thông minh hơn
  const activeConv = useMemo(() => {
      // Tìm xem có phải là 1 cuộc trò chuyện thật đã có trong DB không
      const existingConv = conversations.find(c => c.id === activeConversationId);
      if (existingConv) return existingConv;

      // Nếu là ID giả (friend_...) của người chưa từng chat, ta giả lập một Conversation object
      if (activeConversationId && activeConversationId.startsWith('friend_')) {
          const friendId = activeConversationId.split('_')[1];
          return {
              id: activeConversationId,
              partner: { id: friendId, fullname: 'Người dùng mới', avatarUrl: '' }, // Tên/Avatar tạm
              isVirtual: true // Đánh dấu đây là cuộc trò chuyện chưa tồn tại
          } as any;
      }
      return null;
  }, [activeConversationId, conversations]);

  const { 
    messages, 
    sendMessage, 
    blockUser,      
    unfriendUser,   
    currentUserId 
  } = useChat(activeConversationId, activeConv?.partner?.id);

  // [ĐÃ SỬA] Thêm hỗ trợ Sáng/Tối cho thanh cuộn (Scrollbar)
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    
    /* Chế độ Sáng (Light Mode) */
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
    
    /* Chế độ Tối (Dark Mode) */
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
  `;

  // Màn hình chờ khi chưa chọn người để chat
  if (!activeConv) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#121212] h-full transition-colors duration-300">
        <style>{scrollbarStyles}</style>
        <div className="w-24 h-24 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center border-2 border-zinc-200 dark:border-white/5 shadow-sm">
            <span className="text-4xl">👋</span>
        </div>
        <p className="text-xl font-bold tracking-wide text-zinc-800 dark:text-zinc-300" style={{ fontFamily: '"Jua", sans-serif' }}>
            Chọn một người bạn để bắt đầu
        </p>
      </div>
    );
  }

  // Màn hình Chat chính
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#121212] transition-colors duration-300 relative font-sans w-full">
      <style>{scrollbarStyles}</style>

      <ChatHeader 
        partner={activeConv.partner} 
        onBlock={blockUser}        
        onUnfriend={unfriendUser}  
      />

      <MessageList 
        messages={messages}
        currentUserId={currentUserId}
        partnerAvatar={activeConv.partner?.avatarUrl}
      />

      <ChatInput onSend={sendMessage} />
    </div>
  );
};