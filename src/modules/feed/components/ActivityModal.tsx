import React from 'react';
import { X, Loader2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePostActivities } from '../hooks/usePostActivities';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#18181b] md:rounded-2xl rounded-t-3xl border-t md:border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-[#18181b]/90 backdrop-blur-xl sticky top-0 z-10">
          <h3 className="text-zinc-100 font-bold text-[17px] tracking-tight">Hoạt động mới</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-0 min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-zinc-500 animate-spin" /></div>
          ) : activities.length > 0 ? (
            <div className="flex flex-col">
                {activities.map((item) => (
                  <div 
                    key={item.id} 
                    // [ĐÃ SỬA]: Nếu là Cảm xúc thì căn giữa (items-center), nếu là bình luận thì căn trên (items-start)
                    className={`flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${item.type === 'REACTION' ? 'items-center' : 'items-start'}`}
                  >
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img 
                        src={item.userAvatar || `https://ui-avatars.com/api/?name=${item.userFullName}&background=random`} 
                        alt={item.userFullName} 
                        className="w-10 h-10 rounded-full object-cover border border-zinc-800 shadow-sm" 
                      />
                      {/* Icon góc cho Bình luận */}
                      {item.type === 'COMMENT' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-800 rounded-full flex items-center justify-center shadow-md border border-[#18181b]">
                          <MessageCircle size={9} className="text-blue-400 fill-blue-400/20" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      {item.type === 'REACTION' ? (
                        // [ĐÃ SỬA] Dành cho REACTION: Chỉ hiển thị tên người dùng trên 1 dòng
                        <p className="text-[15px] font-semibold text-zinc-100 truncate pr-2">
                            {item.userFullName}
                        </p>
                      ) : (
                        // Dành cho COMMENT: Hiển thị Tên + Thời gian + Nội dung
                        <div className="flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[14px] font-bold text-zinc-100 truncate pr-2">
                                  {item.userFullName}
                              </p>
                              <span className="text-[11px] text-zinc-600 font-medium whitespace-nowrap shrink-0 mt-0.5">
                                  {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ''}
                              </span>
                            </div>
                            <div className="text-[14px] leading-relaxed break-words text-zinc-300 mt-0.5">
                                {parseContent(item.content)}
                            </div>
                        </div>
                      )}
                    </div>

                    {/* Emoji to nằm sát lề phải dành cho REACTION */}
                    {item.type === 'REACTION' && (
                      <div className="shrink-0 flex items-center justify-center pl-2">
                        <span className="text-[24px] drop-shadow-md animate-in zoom-in duration-300">
                          {item.emoji}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
               <div className="w-14 h-14 bg-zinc-800/50 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-zinc-500" />
               </div>
               <p className="text-zinc-300 font-medium">Chưa có hoạt động nào</p>
               <p className="text-zinc-500 text-sm mt-1">Hãy là người đầu tiên tương tác!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};