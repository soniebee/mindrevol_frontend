import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useVoiceCall } from '../hooks/useVoiceCall';
import { VoiceCallModal } from './VoiceCallModal'; // IMPORT VÀO ĐÂY

export const ChatWindow = () => {
  const { activeConversationId, conversations } = useChatStore();
  const activeConv = conversations.find(c => c.id === activeConversationId);

  const { messages, sendMessage, blockUser, unfriendUser, currentUserId } = useChat(activeConversationId, activeConv?.partner?.id);

  const { 
    startCall, 
    endCall, 
    incomingCall, 
    outgoingCall, 
    isInCall, 
    setIsInCall, 
    initWebRTC, 
    sendSignal, 
    remoteAudioRef 
  } = useVoiceCall(currentUserId || '');

  if (!activeConv) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center bg-white h-full w-full text-zinc-500 font-['Jua']">
        <p className="text-xl font-normal tracking-wide">Chọn một người bạn để bắt đầu</p>
      </div>
    );
  }

  // HÀM XỬ LÝ KHI BẤM NÚT "NGHE"
  const handleAcceptCall = async () => {
    // 1. Lấy ID của người gọi đến
    const targetId = incomingCall.senderId;
    
    // 2. Truyền ID vào đây
    const isReady = await initWebRTC(targetId); 
    
    if (isReady && incomingCall) {
       sendSignal({ 
         type: 'call-accept', 
         targetId: targetId, 
         senderId: currentUserId 
       });
       setIsInCall(true); // Bật giao diện call
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative font-['Jua']">
      <ChatHeader 
        partner={activeConv.partner} 
        onBlock={blockUser}        
        onUnfriend={unfriendUser}
        onStartCall={() => startCall(activeConv.partner.id)} 
      />

      <div className="flex-1 min-h-0 relative bg-white">
         <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      <ChatInput onSend={sendMessage} />

      {/* NHÉT GIAO DIỆN CUỘC GỌI VÀO ĐÂY */}
      <VoiceCallModal 
    incomingCall={incomingCall}
    outgoingCall={outgoingCall} // Truyền thêm cái này
    isInCall={isInCall}
    partnerName={activeConv.partner.fullname || 'Bạn bè'}
    remoteAudioRef={remoteAudioRef}
    onAccept={handleAcceptCall}
    onReject={() => {
       sendSignal({ type: 'call-reject', targetId: incomingCall.senderId, senderId: currentUserId });
       endCall();
    }}
    onEndCall={() => {
       const target = incomingCall ? incomingCall.senderId : outgoingCall?.targetId;
       if (target) sendSignal({ type: 'end-call', targetId: target, senderId: currentUserId });
       endCall();
    }}
    onCancelCall={() => { // Hàm hủy khi đang gọi mà người ta chưa bắt máy
       if (outgoingCall) sendSignal({ type: 'end-call', targetId: outgoingCall.targetId, senderId: currentUserId });
       endCall();
    }}
  />
      
    </div>
  );
};