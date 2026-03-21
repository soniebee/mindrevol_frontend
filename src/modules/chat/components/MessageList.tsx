import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string; 
  partnerAvatar?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, partnerAvatar }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || !Array.isArray(messages)) {
    return <div className="flex-1 flex items-center justify-center text-zinc-500">...</div>;
  }

  return (
    <div 
      ref={scrollRef} 
      className="flex-1 overflow-y-auto pt-[90px] pb-4 px-3 md:px-4 custom-scrollbar scroll-smooth bg-[#FAFAFA] dark:bg-[#121212] relative transition-colors duration-300"
    >
      {/* Đường kẻ ngang phân cách với Header (ẩn dưới Header) */}
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
        <div className="h-4" /> 
      </div>
    </div>
  );
};