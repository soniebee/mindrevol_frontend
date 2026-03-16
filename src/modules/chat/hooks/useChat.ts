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
import { http } from '@/lib/http';

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
      if (!conversationId || !partnerId) return;
      setIsLoading(true);
      try {
        const data = await chatService.getMessages(partnerId);
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
  }, [conversationId, partnerId, setMessages]);

  const sendMessage = useCallback(async (content: string, type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' = 'TEXT', file?: File) => {
    if (!content.trim() && type === 'TEXT') return;
    if (!partnerId || !currentUserId) return;

    let finalContent = content;

    // KHI CÓ FILE GHI ÂM (HOẶC ẢNH) THÌ PHẢI UPLOAD LÊN SERVER TRƯỚC
    if (file && type === 'VOICE') {
        try {
            // Dùng FormData để gói file gửi lên Backend
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadRes = await http.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // SỬA CHỖ NÀY: Lấy đúng chuỗi URL trả về từ FileController (uploadRes.data.data)
            finalContent = uploadRes.data.data; 

        } catch (error) {
            console.error("Lỗi upload file ghi âm:", error);
            toast.error("Không thể tải lên file ghi âm");
            return; // Dừng luôn không gửi tin nhắn nếu upload lỗi
        }
    }

    const clientSideId = Date.now().toString(); 
    const optimisticMessage: Message = {
      id: clientSideId, 
      clientSideId: clientSideId,
      conversationId: conversationId,
      senderId: currentUserId,
      content: finalContent, // Gửi link thật (đã upload) lên server
      type: type as any, 
      createdAt: new Date().toISOString(),
    } as any;

    addMessage(optimisticMessage);

    try {
      const realMessage = await chatService.sendMessage({
        receiverId: partnerId,
        content: finalContent, // Đảm bảo content là URL thật dạng chuỗi
        type,
        clientSideId 
      });
      updateMessageStatus(clientSideId, 'SENT', realMessage.id);
    } catch (err) {
      console.error("Send message failed", err);
      updateMessageStatus(clientSideId, 'ERROR');
      toast.error("Gửi tin nhắn thất bại");
    }
  }, [conversationId, partnerId, currentUserId, addMessage, updateMessageStatus]);

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