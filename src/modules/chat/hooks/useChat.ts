//src/hooks/useChat
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
import { http } from '@/lib/http'; // <-- ĐÃ THÊM DÒNG NÀY ĐỂ FIX LỖI BÁO ĐỎ CHỮ http

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
  }, [conversationId, setMessages]); 

  const sendMessage = useCallback(async (content: string, type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' = 'TEXT', file?: File) => {
    if (!content.trim() && type === 'TEXT') return;
    if (!currentUserId || (!partnerId && !conversationId)) return;

    let finalContent = content;

    // UPLOAD FILE GHI ÂM LÊN BACKEND TRƯỚC KHI GỬI SOCKET
    if (file && type === 'VOICE') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await http.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            finalContent = uploadRes.data.data; // Lấy link URL thật
        } catch (error) {
            toast.error("Không thể tải lên file ghi âm");
            return; 
        }
    }

    const clientSideId = Date.now().toString(); 
    const optimisticMessage: Message = {
      id: clientSideId, clientSideId, conversationId, senderId: currentUserId,
      content: finalContent, type: type as any, createdAt: new Date().toISOString(),
    };

    addMessage(optimisticMessage);

    try {
      const realMessage = await chatService.sendMessage({ conversationId, receiverId: partnerId, content: finalContent, type, clientSideId });
      updateMessageStatus(clientSideId, 'SENT', realMessage.id);
    } catch (err) {
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