// File: src/modules/chat/components/MessageList.tsx
import React, { useEffect, useRef, useCallback, useState, useLayoutEffect } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';
import { useChatStore } from '../store/useChatStore';
import { isSameDay, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Pin, ChevronDown, ChevronUp, X, ArrowDown, User } from 'lucide-react';
import { chatService } from '../services/chat.service';
import { useNavigate } from 'react-router-dom';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string; 
  partnerAvatar?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, partnerAvatar, onLoadMore, hasMore, isLoadingMore }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { activeConversationId, typingStatus, pinnedMessages, updateMessage, isViewingHistory, backToPresent, conversations } = useChatStore();
  const isTyping = activeConversationId ? typingStatus[activeConversationId] : false;
  
  const currentPinnedMessages = activeConversationId ? (pinnedMessages[activeConversationId] || []) : [];
  const [showAllPinned, setShowAllPinned] = useState(false);

  const prevScrollHeightRef = useRef<number>(0);
  const [isFetchingOld, setIsFetchingOld] = useState(false);

  const isViewingHistoryActive = activeConversationId ? !!isViewingHistory[activeConversationId] : false;

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const partner = activeConversation?.partner;
  const isGroup = !!activeConversation?.boxId;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current && !isFetchingOld && !isViewingHistoryActive) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isFetchingOld, isViewingHistoryActive]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop <= 10 && hasMore && !isLoadingMore && onLoadMore) {
        prevScrollHeightRef.current = container.scrollHeight;
        setIsFetchingOld(true);
        onLoadMore(); 
    }
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    if (isFetchingOld && !isLoadingMore) {
        container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
        setIsFetchingOld(false);
    } else if (!isFetchingOld && !isLoadingMore) {
        scrollToBottom();
    }
  }, [messages.length, isLoadingMore]);

  useEffect(() => {
     scrollToBottom();
  }, [activeConversationId]);

  const scrollToMessage = (msgId: string) => {
      const element = document.getElementById(`msg-${msgId}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
          setTimeout(() => element.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'), 2000);
      }
  };

  const handleUnpinFromBanner = async (e: React.MouseEvent, pMsg: Message) => {
    e.stopPropagation(); 
    updateMessage({ ...pMsg, isPinned: false });
    try {
        await chatService.togglePinMessage(pMsg.id);
    } catch (err) {
        updateMessage({ ...pMsg, isPinned: true });
        console.error(err);
    }
  };

  const renderWelcomeProfile = (isCenter: boolean = false) => (
      <div className={cn("flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500", isCenter ? "h-[60%]" : "pt-12 pb-10")}>
          {isGroup ? (
              <div className="w-24 h-24 bg-[#E1DDE8] dark:bg-[#3B3645] rounded-full overflow-hidden flex items-center justify-center mb-4 shadow-lg border-4 border-white dark:border-zinc-800">
                  {activeConversation?.boxAvatar?.startsWith('http') ? (
                      <img src={activeConversation.boxAvatar} alt="Box Avatar" className="w-full h-full object-cover" />
                  ) : (
                      <span className="text-4xl">{activeConversation?.boxAvatar || '👥'}</span>
                  )}
              </div>
          ) : (
              <img 
                  src={partnerAvatar || "https://placehold.co/100x100"} 
                  alt="Avatar" 
                  className="w-28 h-28 rounded-full object-cover mb-4 shadow-xl border-4 border-white dark:border-zinc-800"
              />
          )}
          
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-50 mb-1 text-center px-4" style={{ fontFamily: '"Jua", sans-serif' }}>
              {isGroup ? (activeConversation?.boxName || "Không gian chung") : partner?.fullname}
          </h2>
          
          {!isGroup && partner && (
              <p className="text-[15px] font-semibold text-zinc-500 dark:text-zinc-400 mb-6 lowercase" style={{ fontFamily: '"Nunito", sans-serif' }}>
                  @{partner.handle || partner.fullname?.replace(/\s/g, '').toLowerCase() || 'user'}
              </p>
          )}

          {isGroup ? (
              <p className="text-[14px] text-zinc-500 text-center max-w-sm px-6 bg-white/50 dark:bg-zinc-800/50 py-2.5 rounded-2xl font-semibold" style={{ fontFamily: '"Nunito", sans-serif' }}>
                  Điểm bắt đầu của không gian trò chuyện
              </p>
          ) : (
              <button 
                  onClick={() => navigate(`/profile/${partner?.id}`)}
                  className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-6 py-2.5 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700 font-bold text-[14px] transition-all active:scale-95"
                  style={{ fontFamily: '"Nunito", sans-serif' }}
              >
                  <User className="w-4 h-4" /> Xem trang cá nhân
              </button>
          )}
      </div>
  );

  if (!messages || !Array.isArray(messages)) {
    return <div className="flex-1 flex items-center justify-center text-zinc-500 font-semibold" style={{ fontFamily: '"Nunito", sans-serif' }}>Đang tải kết nối...</div>;
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#F0EFF5] dark:bg-[#121212] transition-colors duration-300">
        
        {currentPinnedMessages.length > 0 && (
            <div className="absolute top-[80px] left-0 right-0 z-30 px-4 flex justify-center">
                <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md shadow-md border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden transition-all duration-300">
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50" onClick={() => setShowAllPinned(!showAllPinned)}>
                        <div className="flex items-center gap-3 overflow-hidden flex-1" onClick={(e) => { e.stopPropagation(); scrollToMessage(currentPinnedMessages[0].id); }}>
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <Pin className="w-4 h-4 text-blue-500 fill-blue-500" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[12px] font-bold text-blue-500">Tin nhắn ghim ({currentPinnedMessages.length})</span>
                                <span className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-200 truncate" style={{ fontFamily: '"Nunito", sans-serif' }}>
                                    {currentPinnedMessages[0].type === 'IMAGE' ? '[Hình ảnh]' : currentPinnedMessages[0].content}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <button onClick={(e) => handleUnpinFromBanner(e, currentPinnedMessages[0])} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors" title="Bỏ ghim">
                                <X className="w-4 h-4"/>
                            </button>
                            <button className="p-1 text-zinc-400">
                                {showAllPinned ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    {showAllPinned && currentPinnedMessages.length > 1 && (
                        <div className="border-t border-zinc-100 dark:border-zinc-700 max-h-40 overflow-y-auto custom-scrollbar">
                            {currentPinnedMessages.slice(1).map((pMsg, idx) => (
                                <div key={pMsg.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-b border-zinc-50 dark:border-zinc-700/50 last:border-0 group">
                                    <div className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer" onClick={() => scrollToMessage(pMsg.id)}>
                                        <div className="w-8 h-8 shrink-0 flex justify-center items-center"><span className="text-zinc-300 text-xs font-bold">{idx + 2}</span></div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[14px] font-semibold text-zinc-600 dark:text-zinc-300 truncate block" style={{ fontFamily: '"Nunito", sans-serif' }}>
                                                {pMsg.type === 'IMAGE' ? '[Hình ảnh]' : pMsg.content}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={(e) => handleUnpinFromBanner(e, pMsg)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full opacity-0 group-hover:opacity-100 transition-all" title="Bỏ ghim">
                                        <X className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        <div ref={scrollRef} onScroll={handleScroll} className="w-full h-full overflow-y-auto overflow-x-hidden pt-[140px] pb-32 px-3 md:px-6 custom-scrollbar relative">
            
            {isLoadingMore && (
                <div className="flex justify-center items-center py-4 w-full">
                    <div className="w-6 h-6 border-2 border-[#E1DDE8] border-t-[#756A91] rounded-full animate-spin"></div>
                </div>
            )}
            
            {messages.length === 0 ? (
                renderWelcomeProfile(true)
            ) : (
                <div className="flex flex-col space-y-[6px]">
                    {!hasMore && messages.length > 0 && renderWelcomeProfile(false)}

                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUserId;
                        const nextMsg = messages[index + 1];
                        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                        const prevMsg = messages[index - 1];
                        const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));
                        
                        return (
                            <React.Fragment key={msg.clientSideId || msg.id}>
                                {showDateSeparator && (
                                    <div className="flex justify-center my-6">
                                        <span className="bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-[12px] font-bold px-3 py-1 rounded-full" style={{ fontFamily: '"Nunito", sans-serif' }}>
                                            {format(new Date(msg.createdAt), "dd 'tháng' MM, yyyy", { locale: vi })}
                                        </span>
                                    </div>
                                )}

                                <div id={`msg-${msg.id}`} className={cn("transition-all duration-500 rounded-xl", isLastInGroup ? "mb-3" : "")}>
                                    <MessageBubble message={msg} isMe={isMe} showAvatar={!isMe && isLastInGroup} avatarUrl={partnerAvatar} />
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
                
            {isTyping && (
                <div className="flex gap-2.5 w-full items-end justify-start transition-all duration-300 mb-6 mt-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white shadow-sm">
                        <img src={partnerAvatar || "https://placehold.co/40x40"} alt="Typing..." className="w-full h-full object-cover opacity-70" />
                    </div>
                    <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-[24px] rounded-bl-[6px] shadow-sm flex items-center gap-1.5 h-[38px]">
                        <span className="w-1.5 h-1.5 bg-[#9288AD] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#9288AD] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#9288AD] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            )}
        </div>

        {isViewingHistoryActive && (
            <button 
                onClick={() => activeConversationId && backToPresent(activeConversationId)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/20 font-bold text-[14px] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-5"
                style={{ fontFamily: '"Nunito", sans-serif' }}
            >
                <ArrowDown className="w-4 h-4" /> Về hiện tại
            </button>
        )}
    </div>
  );
};