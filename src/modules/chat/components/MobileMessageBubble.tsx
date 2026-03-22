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

const ChatAvatar = ({ show, url, isMe }: { show: boolean, url?: string, isMe: boolean }) => {
  if (isMe) return null; 
  return (
    <div className="w-10 h-10 flex-shrink-0">
       {show ? (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer shadow-sm">
              <img src={url || "https://placehold.co/40x40"} alt="Avatar" className="w-full h-full object-cover" />
          </div>
       ) : <div className="w-10 h-10" />}
    </div>
  );
};

const PostSharePreview = ({ postId, isMe }: { postId: string, isMe: boolean }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/post/${postId}`)} className="mb-2 w-72 md:w-80 bg-sky-100/70 rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-3 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 border border-transparent hover:border-sky-200">
      <div className="w-16 h-16 bg-zinc-300 rounded-xl overflow-hidden shrink-0"><img src="https://placehold.co/64x64" className="w-full h-full object-cover" alt="Thumb" /></div>
      <div className="flex-1 flex flex-col justify-center">
          <span className="text-gray-400 text-xs font-normal" style={{ fontFamily: '"Jua", sans-serif' }}>Quoted moment</span>
          <span className="text-black text-lg font-normal leading-tight truncate" style={{ fontFamily: '"Jua", sans-serif' }}>Shared Post</span>
          <span className="text-sky-700 text-xs font-normal mt-1 flex items-center gap-1" style={{ fontFamily: '"Jua", sans-serif' }}>Nhấp để xem <ExternalLink className="w-3 h-3" /></span>
      </div>
    </div>
  );
};

export const MobileMessageBubble: React.FC<Props> = ({ message, isMe, showAvatar, avatarUrl }) => {
  const [showTime, setShowTime] = useState(false);
  const isSharedPost = message.metadata?.contentType === 'SHARE_POST';
  const sharedPostId = message.metadata?.sharedPostId;

  return (
    <div className={cn("flex flex-col w-full group", isMe ? "items-end" : "items-start")}>
      <div className={cn("flex gap-3 w-full items-end", isMe ? "justify-end" : "justify-start")}>
        <ChatAvatar show={showAvatar} url={avatarUrl} isMe={isMe} />
        <div className={cn("flex flex-col max-w-[85%] mb-4", isMe ? "items-end" : "items-start")}>
          {isSharedPost && sharedPostId && <div onClick={() => setShowTime(!showTime)}><PostSharePreview postId={sharedPostId} isMe={isMe} /></div>}
          {message.content && message.content.trim() !== "" && (
               <div 
                onClick={() => setShowTime(!showTime)} 
                className={cn(
                  "px-5 py-3 text-xl shadow-sm break-words leading-relaxed border transition-all duration-200 inline-block cursor-pointer active:scale-[0.98]",
                  isMe ? "bg-lime-100 text-blue-950 rounded-[20px] rounded-br-[4px] border-transparent" : "bg-yellow-50 text-blue-950 rounded-[20px] rounded-bl-[4px] border-transparent" 
                )}
                style={{ fontFamily: '"Jua", sans-serif' }}
               >
                  {message.content}
               </div>
          )}
        </div>
      </div>
      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out flex items-center", showTime ? "h-4 opacity-100 mb-1" : "h-0 opacity-0 mb-0", isMe ? "pr-2" : "pl-[52px]" )}>
          <span className="text-[11px] font-medium text-zinc-400 select-none">
              {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
      </div>
    </div>
  );
};