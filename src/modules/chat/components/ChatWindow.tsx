import React, { useMemo, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useChat } from '../hooks/useChat';
import { useVoiceCall } from '../hooks/useVoiceCall';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { VoiceCallModal } from './VoiceCallModal';

interface ChatWindowProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { activeConversationId, conversations } = useChatStore();
  
  // 1. Khai báo Ref cái loa ở đây để dùng chung
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeConv = useMemo(() => {
      const existingConv = conversations.find(c => c.id === activeConversationId);
      if (existingConv) return existingConv;

      if (activeConversationId && activeConversationId.startsWith('friend_')) {
          const friendId = activeConversationId.split('_')[1];
          return {
              id: activeConversationId,
              partner: { id: friendId, fullname: 'Người dùng mới', avatarUrl: '' },
              isVirtual: true
          } as any;
      }
      return null;
  }, [activeConversationId, conversations]);

  const { messages, sendMessage, blockUser, unfriendUser, currentUserId, loadMoreMessages, hasMore, isLoadingMore } = useChat(activeConversationId, activeConv?.partner?.id);

  // 2. Truyền cái remoteAudioRef đã tạo ở trên vào hook
  const { startCall, endCall, incomingCall, outgoingCall, isInCall, setIsInCall, initWebRTC, sendSignal } = useVoiceCall(currentUserId || '', remoteAudioRef);

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
  `;

  if (!activeConv) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#121212] h-full transition-colors duration-300">
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

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const targetId = incomingCall.senderId;
    const isReady = await initWebRTC(targetId); 
    if (isReady) {
       sendSignal({ type: 'call-accept', targetId: targetId, senderId: currentUserId });
       setIsInCall(true);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white dark:bg-[#121212]">
      <style>{scrollbarStyles}</style>

      {/* Truyền trạng thái Sidebar xuống ChatHeader */}
      <ChatHeader 
        partner={activeConv.partner} 
        onBlock={blockUser}        
        onUnfriend={unfriendUser} 
        onStartCall={() => startCall(activeConv.partner.id)} 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 min-h-0 relative bg-zinc-50/50 dark:bg-[#121212]">
      <MessageList 
        messages={messages}
        currentUserId={currentUserId}
        partnerAvatar={activeConv.partner?.avatarUrl}
        onLoadMore={loadMoreMessages} // <-- THÊM DÒNG NÀY
        hasMore={hasMore}             // <-- THÊM DÒNG NÀY
        isLoadingMore={isLoadingMore} // <-- THÊM DÒNG NÀY
      />
  </div>

      <ChatInput onSend={sendMessage} />

      {/* 3. Truyền remoteAudioRef vào Modal để gán vào thẻ <audio> */}
      <VoiceCallModal 
        incomingCall={incomingCall}
        outgoingCall={outgoingCall}
        isInCall={isInCall}
        partnerName={activeConv.partner?.fullname || 'Bạn bè'}
        remoteAudioRef={remoteAudioRef} 
        onAccept={handleAcceptCall}
        onReject={() => {
           if (incomingCall) sendSignal({ type: 'call-reject', targetId: incomingCall.senderId, senderId: currentUserId });
           endCall();
        }}
        onEndCall={() => {
           const target = incomingCall ? incomingCall.senderId : outgoingCall?.targetId;
           if (target) sendSignal({ type: 'end-call', targetId: target, senderId: currentUserId });
           endCall();
        }}
        onCancelCall={() => {
           if (outgoingCall) sendSignal({ type: 'end-call', targetId: outgoingCall.targetId, senderId: currentUserId });
           endCall();
        }}
      />
    </div>
  );
};