import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { socket } from '@/lib/socket'; 
import { useChatStore } from '../store/useChatStore';
import { Message } from '../types';

// [FIX] Cho phép nhận string | null
export const useChatSocket = (conversationId: string | null) => {
  const { user } = useAuth();
  const { addMessage } = useChatStore();

  useEffect(() => {
    // Nếu không có user hoặc chưa chọn hội thoại thì không làm gì cả
    if (!user || !conversationId) return;

    // Topic khớp với backend: /topic/chat.{id}
    const topic = `/topic/chat.${conversationId}`;
    
    // console.log("Subscribing to chat topic:", topic); 

    const msgSub = socket.subscribe(topic, (msg: Message) => {
      addMessage(msg);
    });

    return () => {
      msgSub?.unsubscribe();
    };
  }, [user, conversationId, addMessage]);
};