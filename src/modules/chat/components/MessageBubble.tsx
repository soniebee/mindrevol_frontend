import React, { useState } from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  avatarUrl?: string;
}

// 1. Tách Component hiển thị Avatar
const ChatAvatar = ({ show, url, isMe }: { show: boolean, url?: string, isMe: boolean }) => {
  if (isMe) return null; 
  return (
    <div className="w-10 h-10 flex-shrink-0">
       {show ? (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 cursor-pointer shadow-sm">
              <img src={url || "https://placehold.co/40x40"} alt="Avatar" className="w-full h-full object-cover" />
          </div>
       ) : <div className="w-10 h-10" />}
    </div>
  );
};

// 2. Ảnh Reply
const MessageImage = ({ src, isMe }: { src: string, isMe: boolean }) => (
  <div className={cn(
    "mb-2 relative z-0 cursor-pointer transition-all hover:scale-[1.01]",
    isMe ? "mr-0" : "ml-0"
  )}>
    <div 
        className="absolute inset-0 rounded-[32px] opacity-50 blur-2xl scale-95 translate-y-4 z-[-1]"
        style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    />
    <div className={cn(
        "relative overflow-hidden aspect-square border border-white/10 shadow-xl bg-[#18181b]",
        "w-72 md:w-80", "rounded-[24px]" 
    )}>
        <img src={src} alt="Reply" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <p className="text-[11px] text-white/95 font-medium pl-1 drop-shadow-md">💬 Đã trả lời</p>
        </div>
    </div>
  </div>
);

// 3. Component Thẻ Chia sẻ bài viết (Neo-brutalism nhẹ)
const PostSharePreview = ({ postId, isMe }: { postId: string, isMe: boolean }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/post/${postId}`)} 
      className="mb-2 w-72 md:w-80 bg-sky-100/70 dark:bg-sky-900/30 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-none p-3 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 border border-transparent hover:border-sky-200 dark:hover:border-sky-700"
    >
      <div className="w-16 h-16 bg-zinc-300 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0">
        <img src="https://placehold.co/64x64" className="w-full h-full object-cover" alt="Thumb" />
      </div>
      <div className="flex-1 flex flex-col justify-center">
          <span className="text-gray-400 text-xs font-normal" style={{ fontFamily: '"Jua", sans-serif' }}>Quoted moment</span>
          <span className="text-black dark:text-white text-lg font-normal leading-tight truncate" style={{ fontFamily: '"Jua", sans-serif' }}>Shared Post</span>
          <span className="text-sky-700 dark:text-sky-400 text-xs font-normal mt-1 flex items-center gap-1" style={{ fontFamily: '"Jua", sans-serif' }}>Nhấp để xem <ExternalLink className="w-3 h-3" /></span>
      </div>
    </div>
  );
};

// 4. Component Bong bóng Chat chính
export const MessageBubble: React.FC<Props> = ({ message, isMe, showAvatar, avatarUrl }) => {
  const [showTime, setShowTime] = useState(false);
  const replyImage = message.metadata?.replyToImage;
  const isSharedPost = message.metadata?.contentType === 'SHARE_POST';
  const sharedPostId = message.metadata?.sharedPostId;

  return (
    <div className={cn("flex flex-col w-full group", isMe ? "items-end" : "items-start")}>
      
      <div className={cn("flex gap-3 w-full items-end", isMe ? "justify-end" : "justify-start")}>
        <ChatAvatar show={showAvatar} url={avatarUrl} isMe={isMe} />
        
        <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%] mb-1", isMe ? "items-end" : "items-start")}>
          
          {replyImage && <MessageImage src={replyImage} isMe={isMe} />}
          {isSharedPost && sharedPostId && <div onClick={() => setShowTime(!showTime)}><PostSharePreview postId={sharedPostId} isMe={isMe} /></div>}
          
          {message.content && message.content.trim() !== "" && (
               <div 
                onClick={() => setShowTime(!showTime)} 
                className={cn(
                  "px-5 py-3 text-[17px] shadow-sm break-words leading-relaxed border transition-all duration-200 inline-block cursor-pointer active:scale-[0.98]",
                  isMe 
                    ? "bg-lime-100 text-blue-950 dark:bg-lime-900/50 dark:text-lime-50 rounded-[20px] rounded-br-[4px] border-transparent" 
                    : "bg-yellow-50 text-blue-950 dark:bg-zinc-800 dark:text-zinc-100 rounded-[20px] rounded-bl-[4px] border-transparent" 
                )}
                style={{ fontFamily: '"Jua", sans-serif' }}
               >
                  {message.content}
               </div>
          )}
        </div>
      </div>

      {/* Hiển thị thời gian khi click */}
      <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out flex items-center", 
          showTime ? "h-5 opacity-100 mb-1" : "h-0 opacity-0 mb-0", 
          isMe ? "pr-2" : "pl-[52px]" 
      )}>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 select-none flex items-center gap-1">
              {isMe && <span className="text-[10px]">Đã gửi</span>}
              {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
      </div>

    </div>
  );
};