import { useEffect, useState, useCallback } from 'react';
import { useChatStore } from '../store/useChatStore';
import { chatService } from '../services/chat.service';
import { blockService } from '@/modules/user/services/block.service'; 
import { friendService } from '@/modules/user/services/friend.service'; 
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useChatSocket } from './useChatSocket';
import { Message } from '../types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useChat = (conversationId: any, partnerId: any) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const navigate = useNavigate();

  const { 
    messages: messagesMap, 
    addMessage, 
    setMessages, 
    updateMessageStatus 
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages = (messagesMap && Array.isArray(messagesMap[conversationId])) 
    ? messagesMap[conversationId] 
    : [];

  useChatSocket(conversationId); 

  useEffect(() => {
    const fetchMessages = async () => {
      // Bỏ qua nếu là ID giả (người chưa từng chat)
      if (!conversationId) return;
      if (conversationId.startsWith('friend_')) {
          setMessages(conversationId, []); 
          return;
      }

      setIsLoading(true);
      try {
        // [ĐÃ SỬA] Gọi API bằng conversationId thay vì partnerId
        const data = await chatService.getMessages(conversationId);
        const sortedMessages = [...data].reverse();
        setMessages(conversationId, sortedMessages);
      } catch (err) {
        console.error("Failed to load messages", err);
        setError("Không thể tải tin nhắn");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId, setMessages]); // Bỏ partnerId khỏi dependencies

  const sendMessage = useCallback(async (content: string, type: 'TEXT' | 'IMAGE' = 'TEXT') => {
    if (!content.trim() && type === 'TEXT') return;
    if (!currentUserId || !conversationId) return; 

    const clientSideId = Date.now().toString(); 
    const optimisticMessage: Message = {
      id: clientSideId, 
      clientSideId: clientSideId,
      conversationId: conversationId,
      senderId: currentUserId,
      content: content,
      type: type as any, 
      createdAt: new Date().toISOString(),
    } as any;

    addMessage(optimisticMessage);

    try {
      await chatService.sendMessage({
        conversationId: conversationId, // [THÊM MỚI] Gửi id cuộc trò chuyện xuống Backend
        receiverId: partnerId || "",    // Vẫn gửi kèm dự phòng
        content,
        type,
        clientSideId 
      });
    } catch (err) {
      console.error("Send message failed", err);
      updateMessageStatus(clientSideId, 'ERROR');
      toast.error("Gửi tin nhắn thất bại");
    }
  }, [conversationId, partnerId, currentUserId, addMessage, updateMessageStatus]);

  // Logic Chặn
  const blockUser = async () => { 
    if (!partnerId) return;
    try {
        await blockService.blockUser(partnerId);
        toast.success("Đã chặn người dùng");
        navigate('/messages');
    } catch (error: any) {
        console.error("Block user error:", error);
        toast.error(error.response?.data?.message || "Lỗi khi chặn người dùng");
    }
  };

  // Logic Hủy kết bạn
  const unfriendUser = async () => { 
    if (!partnerId) return;
    try {
        await friendService.unfriend(partnerId);
        toast.success("Đã hủy kết bạn");
        window.location.reload();
    } catch (error: any) {
        console.error("Unfriend error:", error);
        toast.error(error.response?.data?.message || "Lỗi khi hủy kết bạn");
    }
  };

  return {
    messages,
    isLoading,
    error,
    currentUserId,
    sendMessage,
    blockUser,   
    unfriendUser 
  };
};