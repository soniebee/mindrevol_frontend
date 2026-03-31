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
    updateMessageStatus,
    replyingTo,        
    setReplyingTo,
    prependMessages 
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messages = (messagesMap && Array.isArray(messagesMap[conversationId])) 
    ? messagesMap[conversationId] 
    : [];

  useChatSocket(conversationId); 

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;
      if (conversationId.startsWith('friend_')) {
          setMessages(conversationId, []); 
          return;
      }

      setIsLoading(true);
      setPage(0);       // Reset trang về 0
      setHasMore(true); // Reset hasMore
      
      try {
        const data = await chatService.getMessages(conversationId, 0, 50); // Truyền page 0, size 50
        const sortedMessages = [...data].reverse();
        setMessages(conversationId, sortedMessages);
        if (data.length < 50) setHasMore(false); // Nếu ít hơn 50 tin -> hết tin nhắn cũ
      } catch (err) {
        setError("Không thể tải tin nhắn");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId, setMessages]);

  // 2. [THÊM MỚI] Hàm tải thêm tin nhắn cũ
  const loadMoreMessages = useCallback(async () => {
      if (isLoadingMore || !hasMore || !conversationId || conversationId.startsWith('friend_')) return;
      
      setIsLoadingMore(true);
      try {
          const nextPage = page + 1;
          const data = await chatService.getMessages(conversationId, nextPage, 50);
          
          if (data.length === 0) {
              setHasMore(false);
          } else {
              const sorted = [...data].reverse();
              prependMessages(conversationId, sorted); // Đẩy tin cũ lên đầu
              setPage(nextPage);
              if (data.length < 50) setHasMore(false);
          }
      } catch (err) {
          console.error("Lỗi khi tải thêm tin nhắn:", err);
      } finally {
          setIsLoadingMore(false);
      }
  }, [conversationId, page, hasMore, isLoadingMore, prependMessages]);

  const sendMessage = useCallback(async (content: string, type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE' = 'TEXT', file?: File) => {
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
    const currentReplyId = replyingTo?.id;
    const optimisticMessage: Message = {
      id: clientSideId, clientSideId, conversationId, senderId: currentUserId,
      content: finalContent, type: type as any, createdAt: new Date().toISOString(),
      replyToMsgId: currentReplyId
    };

    addMessage(optimisticMessage);
    setReplyingTo(null);

    try {
      const realMessage = await chatService.sendMessage({ conversationId, receiverId: partnerId, content: finalContent, type, clientSideId, replyToMsgId: currentReplyId });
      updateMessageStatus(clientSideId, 'SENT', realMessage.id);
    } catch (err) {
      updateMessageStatus(clientSideId, 'ERROR');
      toast.error("Gửi tin nhắn thất bại");
    }
  }, [conversationId, partnerId, currentUserId, addMessage, updateMessageStatus, replyingTo, setReplyingTo]);

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
    unfriendUser,
    loadMoreMessages, 
    hasMore, 
    isLoadingMore
  };
};