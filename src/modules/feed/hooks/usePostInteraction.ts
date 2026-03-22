// src/modules/feed/hooks/usePostInteraction.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JourneyPost, InteractionType } from '../types';
import { feedService } from '../services/feed.service';

// Hook này nhận vào một bài Post và trả về các hàm xử lý tương tác
export const usePostInteraction = (post: JourneyPost) => {
  const navigate = useNavigate();

  // State nội bộ để cập nhật giao diện tức thì (Optimistic UI)
  // Giúp app cảm giác mượt hơn, không cần chờ server phản hồi
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);

  /**
   * Xử lý khi user bấm nút Tim/Like
   */
  const handleToggleReaction = async () => {
    // 1. Lưu trạng thái cũ để rollback nếu lỗi
    const previousIsLiked = isLiked;
    
    // 2. Cập nhật UI ngay lập tức
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setReactionCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      // 3. Gọi API ngầm bên dưới
      await feedService.toggleReaction(post.id, 'HEART');
    } catch (error) {
      // 4. Nếu lỗi, khôi phục lại trạng thái cũ
      console.error("Lỗi thả tim:", error);
      setIsLiked(previousIsLiked);
      setReactionCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
    }
  };

  /**
   * Xử lý khi user bấm nút "Trả lời" (Reply)
   * Logic rẽ nhánh quan trọng nằm ở đây!
   */
  const handleReplyClick = () => {
    const type = post.interactionType;

    if (type === InteractionType.GROUP_DISCUSS) {
      // TRƯỜNG HỢP 1: Bình luận công khai (Giống Facebook)
      // Logic: Mở một Drawer/Modal bình luận
      // Bạn có thể dùng một Global State hoặc truyền callback, 
      // ở đây tôi ví dụ dispatch một Custom Event để component cha (HomePage) bắt được
      const event = new CustomEvent('open-comments', { detail: { checkinId: post.id } });
      window.dispatchEvent(event);
      
    } else if (type === InteractionType.PRIVATE_REPLY) {
      // TRƯỜNG HỢP 2: Chat riêng tư (Giống Locket)
      // Logic: Điều hướng sang màn hình Chat, kèm theo thông tin bài post để reply
      navigate(`/chat/${post.userId}`, { 
        state: { 
          replyToCheckinId: post.id,
          replyThumbnail: post.thumbnailUrl 
        } 
      });
    } else {
      console.warn("Hành trình này không cho phép tương tác.");
    }
  };

  return {
    isLiked,
    reactionCount,
    handleToggleReaction,
    handleReplyClick
  };
};