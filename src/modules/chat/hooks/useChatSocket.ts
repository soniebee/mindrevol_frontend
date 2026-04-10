// File: src/modules/chat/hooks/useChatSocket.ts
import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { socket } from '@/lib/socket'; 
import { useChatStore } from '../store/useChatStore';
import { Message } from '../types';

export const useChatSocket = (conversationId: string | null) => {
  const { user } = useAuth();
  const { addMessage, setTyping, markConversationAsSeen } = useChatStore();

  useEffect(() => {
    if (!user || !conversationId) return;

    // 1. Kênh nhận tin nhắn (Tin mới, Sửa, Thu hồi, React đều bắn vào đây)
    const topic = `/topic/chat.${conversationId}`;
    const msgSub = socket.subscribe(topic, (msg: Message) => {
        addMessage(msg); // Hàm addMessage bên store đã xử lý: nếu tồn tại thì update, chưa thì add
    });

    // 2. Kênh đang gõ (Typing)
    const typingSub = socket.subscribe(`/topic/chat.${conversationId}.typing`, (payload: any) => {
        if (payload.senderId !== user.id) {
            setTyping(conversationId, payload.isTyping);
        }
    });

    // 3. Kênh lắng nghe "Đã xem" (Read Receipt)
    const readSub = socket.subscribe(`/topic/chat.${conversationId}.read`, (payload: any) => {
        if (payload.readerId !== user.id) {
            markConversationAsSeen(conversationId);
        }
    });

    return () => {
      msgSub?.unsubscribe();
      typingSub?.unsubscribe();
      readSub?.unsubscribe();
    };
  }, [user, conversationId, addMessage, setTyping, markConversationAsSeen]);
};