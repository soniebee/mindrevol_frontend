import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePostActivities } from '../hooks/usePostActivities';
import { cn } from '@/lib/utils';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const parseContent = (content?: string | null) => {
  if (!content) return "";
  try {
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      const parsed = JSON.parse(content);
      return parsed.content || content;
    }
  } catch (e) {
    // Ignore error
  }
  return content;
};

export const ActivityModal = ({ isOpen, onClose, postId }: ActivityModalProps) => {
  const { activities, isLoading } = usePostActivities(postId, isOpen);

  // --- DRAG TO DISMISS ---
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const onDragStart = (clientY: number) => { dragStartY.current = clientY; setIsDragging(true); };
  const onDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onDragEnd = () => {
    setIsDragging(false);
    if (dragY > 150) { onClose(); setTimeout(() => setDragY(0), 300); } 
    else { setDragY(0); }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
      
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* MODAL CONTAINER */}
      <div 
        className={cn(
          "relative w-full md:w-[480px] h-[90vh] md:h-auto bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95",
          !isDragging ? "transition-transform duration-300 ease-out" : ""
        )}
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : 'none' }}
      >
        
        {/* KHU VỰC ĐỂ KÉO (DRAG HANDLE) */}
        <div 
            className="w-full shrink-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md cursor-grab active:cursor-grabbing touch-none z-30"
            onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
            onTouchEnd={onDragEnd}
            onMouseDown={(e) => onDragStart(e.clientY)}
            onMouseMove={(e) => onDragMove(e.clientY)}
            onMouseUp={onDragEnd}
            onMouseLeave={() => { if (isDragging) onDragEnd(); }}
        >
            <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
            </div>

            <div className="flex items-center justify-between px-6 md:px-8 py-3 md:py-5 border-b border-[#F4EBE1] dark:border-[#2B2A29]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center shadow-sm">
                        <MessageCircle className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[#1A1A1A] dark:text-white text-[1.4rem] font-black tracking-tight pointer-events-none">
                        Hoạt động
                    </h2>
                </div>
                <button 
                    onMouseDown={e => e.stopPropagation()}
                    onTouchStart={e => e.stopPropagation()}
                    onClick={onClose} 
                    className="p-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95 cursor-pointer"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>
        </div>

        {/* DANH SÁCH HOẠT ĐỘNG */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar bg-gradient-to-b from-[#F4EBE1]/30 to-white dark:from-[#1A1A1A]/30 dark:to-[#0A0A0A]">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#8A8580] animate-spin" /></div>
          ) : activities.length > 0 ? (
            <div className="flex flex-col gap-3 pb-8">
                {activities.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                        "flex gap-4 p-4 bg-white dark:bg-[#1A1A1A] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-white/50 dark:border-white/5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all",
                        item.type === 'REACTION' ? 'items-center' : 'items-start'
                    )}
                  >
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img 
                        src={item.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userFullName)}&background=random&color=fff`} 
                        alt={item.userFullName} 
                        className="w-12 h-12 rounded-[16px] object-cover bg-[#E2D9CE] shadow-sm border border-[#F4EBE1] dark:border-[#2B2A29]" 
                      />
                      {/* Icon góc cho Bình luận */}
                      {item.type === 'COMMENT' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1A1A1A] dark:bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-[#1A1A1A]">
                          <MessageCircle size={10} strokeWidth={3} className="text-white dark:text-[#1A1A1A]" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      {item.type === 'REACTION' ? (
                        // Dành cho REACTION: Căn giữa, text đậm
                        <p className="text-[1.05rem] font-black text-[#1A1A1A] dark:text-white truncate pr-2 pt-0.5">
                            {item.userFullName}
                        </p>
                      ) : (
                        // Dành cho COMMENT: Tên + Nội dung + Thời gian
                        <div className="flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[1.05rem] font-black text-[#1A1A1A] dark:text-white truncate pr-2">
                                  {item.userFullName}
                              </p>
                              <span className="text-[0.75rem] font-extrabold uppercase tracking-widest text-[#A09D9A] whitespace-nowrap shrink-0 mt-1">
                                  {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ''}
                              </span>
                            </div>
                            <div className="text-[0.95rem] font-semibold leading-relaxed break-words text-[#4A4A4A] dark:text-[#D6CFC7] mt-1 bg-[#F4EBE1]/50 dark:bg-[#2B2A29]/50 p-3 rounded-[16px]">
                                {parseContent(item.content)}
                            </div>
                        </div>
                      )}
                    </div>

                    {/* Emoji to nằm sát lề phải dành cho REACTION */}
                    {item.type === 'REACTION' && (
                      <div className="shrink-0 flex items-center justify-center pl-2">
                        <span className="text-[2rem] drop-shadow-md animate-in zoom-in duration-300 hover:scale-110 transition-transform cursor-default">
                          {item.emoji}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-70">
               <div className="w-16 h-16 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[20px] flex items-center justify-center mb-4 shadow-inner border border-white/50 dark:border-transparent">
                  <Sparkles className="w-8 h-8 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
               </div>
               <p className="text-[1.1rem] font-black text-[#1A1A1A] dark:text-white mb-1">Chưa có hoạt động nào</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};