import React from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';

// Khai báo Props nếu file fen có sãn, hoặc thêm vào
interface Props {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  avatarUrl?: string;
}

export const MessageBubble: React.FC<Props> = ({ message, isMe, showAvatar, avatarUrl }) => {

  return (
    <div className={cn(
        "flex gap-2.5 w-full group relative items-end mb-2 font-['Jua']", 
        isMe ? "justify-end" : "justify-start"
    )}>
      
      {/* Cột Avatar */}
      {!isMe && (
         <div className="w-8 h-8 flex-shrink-0 mb-1">
           {showAvatar && (
              <img 
                src={avatarUrl || "https://placehold.co/100x100"} 
                className="w-8 h-8 rounded-full object-cover shadow-sm border border-neutral-200" 
                alt="avatar"
              />
           )}
         </div>
      )}

      {/* Nội dung tin nhắn */}
      <div className={cn(
          "flex flex-col max-w-[85%] md:max-w-[70%]",
          isMe ? "items-end" : "items-start"
      )}>
        
        {/* KIỂM TRA TYPE: NẾU LÀ VOICE THÌ HIỂN THỊ AUDIO PLAYER */}
        {message.type === 'VOICE' ? (
             <div className="relative z-10 py-1">
                <audio 
                   controls 
                   src={message.content} 
                   className="max-w-[200px] sm:max-w-[250px] h-11 outline-none" 
                />
             </div>
        ) : (
            /* TRƯỜNG HỢP LÀ TEXT BÌNH THƯỜNG */
            message.content && message.content.trim() !== "" && (
                 <div className={cn(
                    "px-5 py-3 text-xl relative z-10 break-words leading-relaxed transition-all duration-200 text-blue-950",
                    isMe 
                      ? "bg-lime-100 rounded-[20px] rounded-br-sm" 
                      : "bg-yellow-50 rounded-[20px] rounded-bl-sm"
                  )}>
                    {message.content}
                  </div>
            )
        )}
        
        {/* Timestamp */}
        <div className="h-0 overflow-hidden transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 group-hover:h-5 mt-1 px-1">
            <span className="text-xs font-normal text-gray-400 select-none">
                {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>
      </div>
    </div>
  );
};