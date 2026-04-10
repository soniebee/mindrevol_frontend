// File: src/modules/chat/components/SearchMessageModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { chatService } from '../services/chat.service';
import { Message } from '../types';
import { format } from 'date-fns';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useChatStore } from '../store/useChatStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

export const SearchMessageModal: React.FC<Props> = ({ isOpen, onClose, conversationId }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { user } = useAuth();
  const { conversations, jumpToMessage } = useChatStore();
  
  const currentConversation = conversations.find(c => c.id === conversationId);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await chatService.searchMessages(conversationId, keyword);
        setResults(data);
        setHasSearched(true);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, conversationId]);

  // [CẬP NHẬT] Xử lý sự kiện Click vào kết quả
  const handleResultClick = async (msgId: string) => {
    const element = document.getElementById(`msg-${msgId}`);
    
    if (element) {
      // Nếu đã có trên màn hình -> scroll tới
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-yellow-100/50', 'dark:bg-yellow-900/20');
      setTimeout(() => element.classList.remove('bg-yellow-100/50', 'dark:bg-yellow-900/20'), 2000);
      onClose(); 
    } else {
      // Nếu nằm quá xa -> Gọi Auto-fetch (Jump)
      onClose(); // Tắt modal ngay cho mượt
      await jumpToMessage(conversationId, msgId);
      
      // Chờ React render lại DOM rồi cuộn đến
      setTimeout(() => {
        const newEl = document.getElementById(`msg-${msgId}`);
        if (newEl) {
            newEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            newEl.classList.add('bg-yellow-100/50', 'dark:bg-yellow-900/20');
            setTimeout(() => newEl.classList.remove('bg-yellow-100/50', 'dark:bg-yellow-900/20'), 2000);
        }
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/20 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1E24] w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-10">
        
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100" style={{ fontFamily: '"Nunito", sans-serif' }}>Tìm kiếm tin nhắn</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              autoFocus
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập từ khóa cần tìm..." 
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl py-3 pl-10 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
            />
            {isSearching && (
               <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-[#121212]">
          {!hasSearched && !isSearching && (
             <div className="p-8 text-center text-zinc-400 text-sm">Gõ từ khóa để bắt đầu tìm kiếm...</div>
          )}
          
          {hasSearched && !isSearching && results.length === 0 && (
             <div className="p-8 text-center text-zinc-500 font-medium text-sm">Không tìm thấy kết quả nào cho "{keyword}".</div>
          )}

          {results.map((msg) => {
            const isMe = msg.senderId === user?.id;
            let displayName = "Người dùng";
            let displayAvatar = "https://placehold.co/40x40";

            if (isMe) {
                displayName = "Bạn";
                displayAvatar = user?.avatarUrl || displayAvatar;
            } else if (currentConversation && !currentConversation.boxId) {
                displayName = currentConversation.partner?.fullname || displayName;
                displayAvatar = currentConversation.partner?.avatarUrl || displayAvatar;
            } else {
                displayName = msg.senderName || "Thành viên";
                displayAvatar = msg.senderAvatar || displayAvatar;
            }

            return (
              <div 
                key={msg.id} 
                onClick={() => handleResultClick(msg.id)}
                className="p-4 border-b border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex gap-3 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                    <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[15px] text-zinc-800 dark:text-zinc-200 truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                          {displayName}
                      </span>
                      <span className="text-[12px] text-zinc-400 font-semibold shrink-0 ml-2">
                          {format(new Date(msg.createdAt), 'HH:mm - dd/MM/yyyy')}
                      </span>
                  </div>
                  <p className="text-[14px] text-zinc-600 dark:text-zinc-400 line-clamp-2" style={{ fontFamily: '"Nunito", sans-serif' }}>
                      {msg.isDeleted ? <span className="italic text-zinc-400">Tin nhắn đã bị thu hồi</span> : (msg.type === 'IMAGE' ? '[Hình ảnh]' : msg.content)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};