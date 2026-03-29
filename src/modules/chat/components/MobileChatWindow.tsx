import React, { useMemo, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useChat } from '../hooks/useChat';
import { useVoiceCall } from '../hooks/useVoiceCall';
import { MobileChatHeader } from './MobileChatHeader';
import { MobileMessageList } from './MobileMessageList';
import { MobileChatInput } from './MobileChatInput';
import { VoiceCallModal } from './VoiceCallModal';

export const MobileChatWindow = () => {
  const { activeConversationId, conversations } = useChatStore();
  
  // 1. Khai báo Ref cái loa dùng chung cho Mobile
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // 2. Truyền remoteAudioRef vào hook
  const { 
    startCall, endCall, incomingCall, outgoingCall, 
    isInCall, setIsInCall, initWebRTC, sendSignal 
  } = useVoiceCall(currentUserId || '', remoteAudioRef);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const targetId = incomingCall.senderId;
    const isReady = await initWebRTC(targetId); 
    if (isReady) {
       sendSignal({ type: 'call-accept', targetId: targetId, senderId: currentUserId });
       setIsInCall(true);
    }
  };

  if (!activeConv) return null; 

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative font-sans w-full overflow-hidden">
      <MobileChatHeader 
          partner={activeConv.partner} 
          onBlock={blockUser} 
          onUnfriend={unfriendUser} 
          onStartCall={() => startCall(activeConv.partner.id)} 
      />
      
      <MobileMessageList 
          messages={messages} 
          currentUserId={currentUserId} 
          partnerAvatar={activeConv.partner?.avatarUrl} 
      />
      
      <MobileChatInput onSend={sendMessage} />

      {/* 3. Truyền remoteAudioRef vào Modal */}
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