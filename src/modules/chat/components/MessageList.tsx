import React, { useEffect, useRef, useCallback, useState, useLayoutEffect } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';
import { useChatStore } from '../store/useChatStore';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string; 
  partnerAvatar?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId, 
  partnerAvatar,
  onLoadMore,
  hasMore,
  isLoadingMore 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Lấy trạng thái Typing
  const { activeConversationId, typingStatus } = useChatStore();
  const isTyping = activeConversationId ? typingStatus[activeConversationId] : false;
  
  // Các Ref dùng cho việc Tải thêm tin nhắn cũ (Infinite Scroll)
  const prevScrollHeightRef = useRef<number>(0);
  const [isFetchingOld, setIsFetchingOld] = useState(false);
  const prevMessagesLength = useRef(messages?.length || 0);

  // Hàm cuộn xuống đáy
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Lắng nghe sự kiện cuộn lên trên cùng
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop === 0 && hasMore && !isLoadingMore && onLoadMore) {
        // Lưu lại chiều cao hiện tại trước khi load thêm tin nhắn mới để bù trừ
        prevScrollHeightRef.current = container.scrollHeight;
        setIsFetchingOld(true);
        onLoadMore();
    }
  };

  // Logic giữ vị trí cuộn hoặc cuộn xuống đáy
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (isFetchingOld) {
        // Nếu vừa nạp tin nhắn cũ xong -> Giữ nguyên vị trí thanh cuộn để không bị giật
        container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
        setIsFetchingOld(false);
    } else if (messages?.length > prevMessagesLength.current) {
        // Nếu có tin nhắn MỚI (chứ không phải nạp tin cũ) -> Cuộn "xe lu" xuống đáy
        scrollToBottom();
        let attempts = 0;
        const intervalId = setInterval(() => {
            scrollToBottom();
            attempts++;
            if (attempts >= 5) clearInterval(intervalId);
        }, 100);
        return () => clearInterval(intervalId);
    }
    
    prevMessagesLength.current = messages?.length || 0;
  }, [messages, isFetchingOld, scrollToBottom]);

  if (!messages || !Array.isArray(messages)) {
    return <div className="flex-1 flex items-center justify-center text-zinc-500">...</div>;
  }

  return (
    <div 
      ref={scrollRef} 
      onScroll={handleScroll} // Lắng nghe cuộn để load thêm tin cũ
      className="absolute inset-0 h-full w-full overflow-y-auto pt-[90px] pb-4 px-4 custom-scrollbar bg-[#FAFAFA] dark:bg-[#121212] transition-colors duration-300"
    >
      {/* Nút quay quay báo hiệu đang tải thêm tin nhắn */}
      {isLoadingMore && (
          <div className="flex justify-center items-center py-2 absolute top-[80px] left-0 w-full z-20">
              <div className="w-5 h-5 border-2 border-zinc-400 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
      )}

      <div className="absolute top-[72px] left-0 w-full h-px bg-zinc-300 dark:bg-zinc-800 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] dark:shadow-none z-10" />
      
      <div className="space-y-[6px]">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          const nextMsg = messages[index + 1];
          
          const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
          
          return (
            <div key={msg.clientSideId || msg.id} className={cn("transition-all", isLastInGroup ? "mb-6" : "")}>
              <MessageBubble 
                message={msg} 
                isMe={isMe} 
                showAvatar={!isMe && isLastInGroup}
                avatarUrl={partnerAvatar}
              />
            </div>
          );
        })}
        
        {/* Hiệu ứng Đang gõ phím */}
        {isTyping && (
           <div className="flex gap-3 w-full items-end justify-start transition-all duration-300 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 shadow-sm">
                  <img src={partnerAvatar || "https://placehold.co/40x40"} alt="Typing..." className="w-full h-full object-cover opacity-70" />
              </div>
              <div className="bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-4 py-3 rounded-[20px] rounded-bl-[4px] shadow-sm flex items-center gap-1.5 h-[42px]">
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
           </div>
        )}
        
        {/* Đệm xíu không gian ở dưới đáy cho dễ thở */}
        <div className="h-6 w-full shrink-0" /> 
      </div>
    </div>
  );
};