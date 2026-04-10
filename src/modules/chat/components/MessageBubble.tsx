// File: src/modules/chat/components/MessageBubble.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { Reply, Trash2, Edit2, SmilePlus, MoreVertical, Forward, Pin } from 'lucide-react'; 
import { useChatStore } from '../store/useChatStore'; 
import { useAuth } from '@/modules/auth/store/AuthContext';
import { chatService } from '../services/chat.service';

interface Props {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  avatarUrl?: string;
}

const renderContentWithMentions = (content: string) => {
    if (!content) return "";
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) return <span key={index} className="text-[#9288AD] dark:text-white underline font-bold cursor-pointer">{part}</span>;
      return part;
    });
};
  
const ChatAvatar = ({ show, url, isMe }: { show: boolean, url?: string, isMe: boolean }) => {
    if (isMe) return null; 
    return (
      <div className="w-9 h-9 flex-shrink-0">
         {show ? (
            <img src={url || "https://placehold.co/40x40"} alt="Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm bg-white border border-zinc-100 dark:border-zinc-800" />
         ) : <div className="w-9 h-9" />}
      </div>
    );
};
  
const MessageImage = ({ src, isMe }: { src: string, isMe: boolean }) => (
    <div className={cn("mb-1 relative z-0 cursor-pointer transition-all hover:scale-[1.01]", isMe ? "mr-0" : "ml-0")}>
      <div className={cn("relative overflow-hidden aspect-square shadow-sm w-72 rounded-[20px] border border-black/5 dark:border-white/10")}>
          <img src={src} alt="Image" className="w-full h-full object-cover" />
      </div>
    </div>
);
  
const RepliedMessagePreview = ({ messageId, conversationId, currentUserId }: { messageId: string, conversationId: string, currentUserId?: string }) => {
      const messages = useChatStore(state => state.messages[conversationId] || []);
      const conversation = useChatStore(state => state.conversations.find(c => c.id === conversationId));
      const originalMsg = messages.find(m => String(m.id) === String(messageId));
  
      if (originalMsg) {
          const isMeOrigin = originalMsg.senderId === currentUserId;
          const displayName = isMeOrigin ? "Bạn" : (conversation?.partner?.id === originalMsg.senderId ? conversation?.partner?.fullname : "Người dùng");
          const previewText = originalMsg.isDeleted ? 'Tin nhắn đã bị thu hồi' : (originalMsg.type === 'IMAGE' ? '[Hình ảnh]' : originalMsg.type === 'VOICE' ? '[Ghi âm]' : originalMsg.content);
  
          return (
              <div className="mb-1.5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity flex items-center gap-2 p-2 rounded-[16px] bg-black/5 dark:bg-white/10 w-fit border border-black/5 dark:border-white/5">
                  <Reply className="w-3 h-3 text-zinc-500 dark:text-zinc-300" />
                  <div className="text-[12.5px] truncate max-w-[200px] text-zinc-600 dark:text-zinc-200 font-semibold flex gap-1" style={{ fontFamily: '"Nunito", sans-serif' }}>
                      <span className="font-bold shrink-0">{displayName}:</span>
                      <span className="truncate">{previewText}</span>
                  </div>
              </div>
          );
      }
      return null;
};

export const MessageBubble: React.FC<Props> = ({ message, isMe, showAvatar, avatarUrl }) => {
  const [showTime, setShowTime] = useState(false);
  const [showReacts, setShowReacts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const reactRef = useRef<HTMLDivElement>(null);
  
  const { setReplyingTo, setEditingMessage, setForwardingMessage, conversations, updateMessage } = useChatStore();
  const { user } = useAuth(); 
  const currentUserId = user?.id;

  const replyImage = message.metadata?.replyToImage;
  const isEdited = message.metadata?.isEdited;
  
  const conversation = conversations.find(c => c.id === message.conversationId);
  const isGroup = !!conversation?.boxId;

  const isPinned = message.isPinned !== undefined ? message.isPinned : (message as any).pinned;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
      if (reactRef.current && !reactRef.current.contains(event.target as Node)) setShowReacts(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (confirm('Bạn muốn thu hồi tin nhắn này?')) {
      try { await chatService.deleteMessage(message.id); } catch (e) { console.error(e); }
    }
  };

  const handleReact = async (icon: string) => {
    try { await chatService.reactToMessage(message.id, icon); setShowReacts(false); } catch (e) { console.error(e); }
  };

  const handleTogglePin = async () => {
    setShowMenu(false);
    updateMessage({ ...message, isPinned: !isPinned });
    try {
        await chatService.togglePinMessage(message.id);
    } catch (e) {
        console.error(e);
        updateMessage({ ...message, isPinned: isPinned });
    }
  };

  const reactionCounts = Object.values(message.reactions || {}).reduce((acc: any, reaction) => {
      acc[reaction] = (acc[reaction] || 0) + 1; return acc;
  }, {});

  return (
    <div className={cn("flex flex-col w-full group relative", isMe ? "items-end" : "items-start")}>
      <div className={cn("flex gap-2.5 w-full items-end", isMe ? "justify-end" : "justify-start")}>
        <ChatAvatar show={showAvatar} url={avatarUrl} isMe={isMe} />
        
        <div className={cn("flex flex-col max-w-[75%] relative", isMe ? "items-end" : "items-start")}>
          
          {!message.isDeleted && (
              <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-20", isMe ? "-left-[72px]" : "-right-[72px]")}>
                
                <div className="relative" ref={reactRef}>
                    <button onClick={() => setShowReacts(!showReacts)} className="p-1.5 bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 rounded-full text-zinc-400 hover:text-yellow-500 active:scale-90" title="Thả cảm xúc"><SmilePlus className="w-4 h-4" /></button>
                    {showReacts && (
                        <div className={cn("absolute bottom-full mb-2 bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 rounded-full flex gap-1 p-1 z-50", isMe ? "right-0" : "left-0")}>
                            {['❤️', '😂', '😮', '😢', '👍'].map(emoji => (
                                <button key={emoji} onClick={() => handleReact(emoji)} className="w-8 h-8 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-90">{emoji}</button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 active:scale-90">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMenu && (
                        <div className={cn("absolute top-full mt-1 bg-white dark:bg-[#1E1E24] shadow-xl border border-zinc-100 dark:border-zinc-800 rounded-xl flex flex-col py-1.5 w-[150px] z-50", isMe ? "right-0" : "left-0")}>
                            <button onClick={() => { setReplyingTo(message); setShowMenu(false); }} className="px-3 py-2.5 text-left text-[14px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"><Reply className="w-4 h-4 text-zinc-400"/> Trả lời</button>
                            <button onClick={() => { setForwardingMessage(message); setShowMenu(false); }} className="px-3 py-2.5 text-left text-[14px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"><Forward className="w-4 h-4 text-zinc-400"/> Chuyển tiếp</button>
                            <button onClick={handleTogglePin} className="px-3 py-2.5 text-left text-[14px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"><Pin className="w-4 h-4 text-zinc-400"/> {isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}</button>
                            {isMe && message.type === 'TEXT' && <button onClick={() => { setEditingMessage(message); setShowMenu(false); }} className="px-3 py-2.5 text-left text-[14px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2.5 transition-colors"><Edit2 className="w-4 h-4"/> Chỉnh sửa</button>}
                            {isMe && <button onClick={() => { handleDelete(); setShowMenu(false); }} className="px-3 py-2.5 text-left text-[14px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors"><Trash2 className="w-4 h-4"/> Thu hồi</button>}
                        </div>
                    )}
                </div>
              </div>
          )}

          {message.replyToMsgId && <RepliedMessagePreview messageId={message.replyToMsgId} conversationId={message.conversationId} currentUserId={currentUserId} />}
          {!message.isDeleted && replyImage && <MessageImage src={replyImage} isMe={isMe} />}
          
          {message.isDeleted ? (
              <div className="px-4 py-2.5 text-[15px] italic text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-[24px] bg-transparent" style={{ fontFamily: '"Nunito", sans-serif' }}>Tin nhắn đã bị thu hồi</div>
          ) : message.type === 'VOICE' ? (
               <div className="relative z-10 py-1"><audio controls src={message.content} className="max-w-[250px] h-10 outline-none rounded-full" /></div>
          ) : (
              message.content && message.content.trim() !== "" && (
                   <div onClick={() => setShowTime(!showTime)} className={cn(
                      "px-4 py-2.5 text-[15.5px] shadow-[0_4px_16px_rgba(146,136,173,0.08)] dark:shadow-none break-words leading-relaxed transition-all duration-200 inline-block cursor-pointer active:scale-[0.98] relative",
                      message.type === 'IMAGE' ? "bg-transparent p-0 shadow-none border-none" : 
                      isMe ? "bg-white text-zinc-800 dark:bg-[#756A91] dark:text-white rounded-[24px] rounded-br-[6px] border border-zinc-100 dark:border-[#756A91] font-sans font-semibold" 
                           : "bg-[#FFF5E8] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-[24px] rounded-bl-[6px] border border-[#FFF5E8] dark:border-zinc-700 font-sans font-semibold" 
                    )} style={{ fontFamily: '"Nunito", sans-serif' }}>
                      
                      {!isMe && isGroup && message.type !== 'IMAGE' && <div className="text-[11px] text-[#9288AD] mb-0.5 font-bold">{message.senderName || "Thành viên"}</div>}
                      
                      {message.type === 'IMAGE' ? (
                          <div className="rounded-[20px] overflow-hidden border border-zinc-200 dark:border-zinc-700 max-w-[250px]">
                              <img src={message.content} alt="Attachment" className="w-full h-auto object-cover" loading="lazy" />
                          </div>
                      ) : (
                          renderContentWithMentions(message.content)
                      )}

                      {isPinned && (
                          <div className={cn("absolute -top-2 flex items-center justify-center w-5 h-5 bg-white dark:bg-zinc-800 rounded-full shadow-md border border-zinc-100 dark:border-zinc-700 z-10", isMe ? "-right-2" : "-left-2")}>
                              <Pin className="w-3 h-3 text-blue-500 fill-blue-500" />
                          </div>
                      )}

                      {Object.keys(reactionCounts).length > 0 && (
                          <div className={cn("absolute -bottom-3 flex gap-0.5 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded-full shadow-md border border-zinc-100 dark:border-zinc-700 text-[12px] z-10", isMe ? "left-2" : "right-2")}>
                              {Object.entries(reactionCounts).map(([reaction, count]) => (
                                  <span key={reaction} className="flex items-center space-x-0.5"><span>{reaction}</span>{Number(count) > 1 && <span className="text-[10px] font-bold text-zinc-500">{String(count)}</span>}</span>
                              ))}
                          </div>
                      )}
                   </div>
              )
          )}
        </div>
      </div>

      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out flex items-center", showTime ? "h-5 opacity-100 mt-2" : "h-0 opacity-0 mt-0", isMe ? "pr-1" : "pl-[46px]" )}>
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 select-none flex items-center gap-1" style={{ fontFamily: '"Nunito", sans-serif' }}>
              {isMe && <span>{message.status === 'SEEN' ? 'Đã xem' : 'Đã gửi'}</span>}
              {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              {isEdited && <span className="italic ml-1">(Đã chỉnh sửa)</span>}
          </span>
      </div>
    </div>
  );
};