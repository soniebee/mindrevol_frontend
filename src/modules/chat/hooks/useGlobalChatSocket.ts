//src/hooks/useGlobalChatSocket
import { useEffect } from 'react';
import { socket } from '@/lib/socket'; 
import { useChatStore } from '../store/useChatStore';

export const useGlobalChatSocket = () => {
  const { conversations, addMessage } = useChatStore();

  useEffect(() => {
    if (!conversations || conversations.length === 0) return;

    // Lặp qua TẤT CẢ các cuộc hội thoại trong danh sách và cắm "ăng-ten" lắng nghe
    const subscriptions = conversations.map((conv) => {
      const topic = `/topic/chat.${conv.id}`;
      return socket.subscribe(topic, (msg: any) => {
        addMessage(msg); // Ném tin nhắn vào Store, Store sẽ tự xử lý việc đẩy list lên top!
      });
    });

    // Cleanup: Rút ăng-ten khi tắt app hoặc danh sách bị đổi
    return () => {
      subscriptions.forEach((sub) => sub?.unsubscribe());
    };
  }, [conversations, addMessage]);
};