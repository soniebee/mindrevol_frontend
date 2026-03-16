import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string; 
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
  `;

  if (!messages || !Array.isArray(messages)) {
    return <div className="h-full flex items-center justify-center text-zinc-500 font-['Jua']">...</div>;
  }

  return (
    // Dùng h-full và overflow-y-auto để đoạn này tự cuộn mượt mà
    <div 
      ref={scrollRef} 
      className="h-full w-full overflow-y-auto pt-4 px-2 pb-4 custom-scrollbar scroll-smooth"
    >
      <style>{scrollbarStyles}</style>
      
      <div className="space-y-[2px] flex flex-col min-h-full">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          const nextMsg = messages[index + 1];
          
          const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
          
          return (
            <div key={msg.clientSideId || msg.id} className={cn("transition-all", isLastInGroup ? "mb-3" : "")}>
              <MessageBubble 
                message={msg} 
                isMe={isMe} 
                showAvatar={isLastInGroup && !isMe} // ĐÃ THÊM THUỘC TÍNH NÀY VÀO ĐỂ FIX LỖI
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};