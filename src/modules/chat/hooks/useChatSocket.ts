//src/hooks/useChatSocket
import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { socket } from '@/lib/socket'; 
import { useChatStore } from '../store/useChatStore';
import { Message } from '../types';

// [FIX] Cho phép nhận string | null
export const useChatSocket = (conversationId: string | null) => {
  const { user } = useAuth();
  const { addMessage, setTyping, markConversationAsSeen } = useChatStore();
  useEffect(() => {
    // Nếu không có user hoặc chưa chọn hội thoại thì không làm gì cả
    if (!user || !conversationId) return;

    // 1. Kênh nhận tin nhắn
    const topic = `/topic/chat.${conversationId}`;
    const msgSub = socket.subscribe(topic, (msg: Message) => addMessage(msg));

    // 2. Kênh đang gõ (Typing)
    const typingSub = socket.subscribe(`/user/queue/typing`, (payload: any) => {
        if (payload.conversationId === conversationId && payload.senderId !== user.id) {
            setTyping(conversationId, payload.isTyping);
        }
    });

    // 3. [THÊM MỚI] Kênh lắng nghe "Đã xem" (Read Receipt)
    const readSub = socket.subscribe(`/user/queue/read-receipt`, (payload: any) => {
        // Khi đối phương (khác user.id) đã đọc đoạn chat này
        if (payload.conversationId === conversationId && payload.readerId !== user.id) {
            markConversationAsSeen(conversationId);
        }
    });
    return () => {
      msgSub?.unsubscribe();
      typingSub?.unsubscribe();
      readSub?.unsubscribe(); // Hủy đăng ký
    };
  }, [user, conversationId, addMessage, setTyping, markConversationAsSeen]);
};