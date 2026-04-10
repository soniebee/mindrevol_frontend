// File: src/modules/chat/components/ChatWindow.tsx
import React, { useMemo, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useChat } from '../hooks/useChat';
import { useVoiceCall } from '../hooks/useVoiceCall';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { VoiceCallModal } from './VoiceCallModal';
import { ForwardMessageModal } from './ForwardMessageModal'; // [IMPORT MỚI]

interface ChatWindowProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  onBackMobile?: () => void; 
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isSidebarOpen, toggleSidebar, onBackMobile }) => {
  const { activeConversationId, conversations, forwardingMessage, setForwardingMessage } = useChatStore();
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeConv = useMemo(() => {
      const existingConv = conversations.find(c => c.id === activeConversationId);
      if (existingConv) return existingConv;
      if (activeConversationId && activeConversationId.startsWith('friend_')) {
          const friendId = activeConversationId.split('_')[1];
          return { id: activeConversationId, partner: { id: friendId, fullname: 'Người dùng mới', avatarUrl: '' }, isVirtual: true } as any;
      }
      return null;
  }, [activeConversationId, conversations]);

  const { messages, sendMessage, editMessage, blockUser, unfriendUser, currentUserId, loadMoreMessages, hasMore, isLoadingMore } = useChat(activeConversationId, activeConv?.partner?.id);
  
  const { startCall, endCall, incomingCall, outgoingCall, isInCall, setIsInCall, initWebRTC, sendSignal } = useVoiceCall(currentUserId || '', remoteAudioRef);

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E1DDE8; border-radius: 20px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
  `;

  if (!activeConv) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#F0EFF5] dark:bg-[#121212] h-full transition-colors duration-300">
        <style>{scrollbarStyles}</style>
        <div className="w-24 h-24 mb-4 rounded-full bg-white/50 dark:bg-zinc-800/50 flex items-center justify-center shadow-sm">
            <span className="text-4xl">☁️</span>
        </div>
        <p className="text-xl font-bold tracking-wide text-[#756A91] dark:text-zinc-300" style={{ fontFamily: '"Jua", sans-serif' }}>
            Kết nối với một người bạn
        </p>
      </div>
    );
  }

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const isReady = await initWebRTC(incomingCall.senderId); 
    if (isReady) { sendSignal({ type: 'call-accept', targetId: incomingCall.senderId, senderId: currentUserId }); setIsInCall(true); }
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-[#F0EFF5] dark:bg-[#121212]">
      <style>{scrollbarStyles}</style>

      {/* [THÊM MỚI] Modal Chuyển tiếp tin nhắn */}
      <ForwardMessageModal 
        isOpen={!!forwardingMessage} 
        onClose={() => setForwardingMessage(null)} 
      />

      <ChatHeader 
        partner={activeConv.partner} 
        onBlock={blockUser}        
        onUnfriend={unfriendUser} 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onBackMobile={onBackMobile} 
      />

      <div className="flex-1 min-h-0 relative">
          <MessageList 
            messages={messages}
            currentUserId={currentUserId}
            partnerAvatar={activeConv.partner?.avatarUrl}
            onLoadMore={loadMoreMessages} 
            hasMore={hasMore}            
            isLoadingMore={isLoadingMore} 
          />
      </div>

      <ChatInput onSend={sendMessage} onEdit={editMessage} />

      <VoiceCallModal 
        incomingCall={incomingCall} outgoingCall={outgoingCall} isInCall={isInCall} partnerName={activeConv.partner?.fullname || 'Bạn bè'} remoteAudioRef={remoteAudioRef} 
        onAccept={handleAcceptCall}
        onReject={() => { if (incomingCall) sendSignal({ type: 'call-reject', targetId: incomingCall.senderId, senderId: currentUserId }); endCall(); }}
        onEndCall={() => { const target = incomingCall ? incomingCall.senderId : outgoingCall?.targetId; if (target) sendSignal({ type: 'end-call', targetId: target, senderId: currentUserId }); endCall(); }}
        onCancelCall={() => { if (outgoingCall) sendSignal({ type: 'end-call', targetId: outgoingCall.targetId, senderId: currentUserId }); endCall(); }}
      />
    </div>
  );
};