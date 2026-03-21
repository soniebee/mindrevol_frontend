import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, UserX, Ban, ChevronLeft, Users } from 'lucide-react'; 
import { useChatStore } from '../store/useChatStore';
import { Link } from 'react-router-dom'; 
import { UserAvatarLink } from '@/components/ui/UserAvatarLink'; 

interface ChatHeaderProps {
  partner: any; 
  onBlock: () => void;
  onUnfriend: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ partner, onBlock, onUnfriend }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openChat, conversations, activeConversationId } = useChatStore(); 

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const isGroup = !!activeConversation?.boxId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void, confirmMsg: string) => {
    if (confirm(confirmMsg)) {
      action();
    }
    setShowMenu(false);
  };

  return (
    <div className="h-[72px] absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-3">
        
        {/* Nút Back (Chỉ hiện trên Mobile) */}
        <button 
           onClick={() => openChat(null)} 
           className="md:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
        >
           <ChevronLeft className="w-8 h-8" />
        </button>

        {isGroup ? (
             <div className="w-12 h-12 border-2 border-black dark:border-white rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 overflow-hidden relative transition-colors">
                 <div className="absolute inset-0 border-[3px] border-black dark:border-white opacity-10 translate-x-[2px] translate-y-[2px]" />
                 {activeConversation?.boxAvatar ? (
                     <span className="text-2xl relative z-10 drop-shadow-sm">{activeConversation.boxAvatar}</span>
                 ) : (
                     <Users size={24} className="text-black dark:text-white relative z-10" />
                 )}
             </div>
        ) : (
             <div className="relative group shrink-0">
                 {/* Avatar dùng Component tái sử dụng */}
                 <UserAvatarLink 
                    userId={partner?.id} 
                    avatarUrl={partner?.avatarUrl} 
                    fullname={partner?.fullname || "Người dùng"}
                    className="w-12 h-12 border-2 border-black dark:border-white rounded-full bg-gray-200 dark:bg-zinc-800 hover:ring-2 hover:ring-offset-1 hover:ring-zinc-500 transition-all cursor-pointer block overflow-hidden"
                 />
                 {/* Chấm xanh Online */}
                 {partner?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2px] border-white dark:border-[#121212] transition-colors" />
                 )}
             </div>
        )}
        
        <div className="flex flex-col justify-center overflow-hidden pl-1">
          {isGroup ? (
              <>
                  <span className="font-bold text-black dark:text-white text-xl leading-tight truncate flex items-center gap-2 transition-colors" style={{ fontFamily: '"Jua", sans-serif' }}>
                      <span>{activeConversation?.boxName || "Không gian chung"}</span>
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium cursor-pointer hover:underline transition-colors" style={{ fontFamily: '"Jua", sans-serif' }} onClick={() => window.history.back()}>
                      Box Chat
                  </span>
              </>
          ) : (
              <>
                  <Link 
                    to={`/profile/${partner?.id}`} 
                    className="font-bold text-black dark:text-white text-xl leading-tight cursor-pointer hover:underline transition-all truncate" 
                    style={{ fontFamily: '"Jua", sans-serif' }}
                  >
                      {partner?.fullname}
                  </Link>
                  <span className="text-sm text-neutral-400 dark:text-neutral-500 transition-colors" style={{ fontFamily: '"Jua", sans-serif' }}>
                     {partner?.isOnline ? <span className="text-green-500 font-medium">Đang hoạt động</span> : "Friend"}
                  </span>
              </>
          )}
        </div>
      </div>

      {/* Menu Dấu 3 chấm */}
      {!isGroup && (
          <div className="relative" ref={menuRef}>
              <button 
                  onClick={() => setShowMenu(!showMenu)} 
                  className={`p-2 rounded-full transition-all ${showMenu ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white' : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}
              >
                  <MoreHorizontal className="w-8 h-8" />
              </button>

              {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right transition-colors">
                      <div className="py-1">
                        <button 
                            onClick={() => handleAction(onUnfriend, `Hủy kết bạn với ${partner?.fullname}?`)} 
                            className="w-full text-left px-4 py-3 text-sm text-black dark:text-white font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                        >
                            <UserX className="w-4 h-4" /> <span style={{ fontFamily: '"Jua", sans-serif' }}>Hủy kết bạn</span>
                        </button>
                        
                        {/* Đường kẻ ngang phân cách */}
                        <div className="h-[2px] bg-black dark:bg-white mx-2 my-1 transition-colors" />
                        
                        <button 
                            onClick={() => handleAction(onBlock, `Chặn ${partner?.fullname}?`)} 
                            className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 transition-colors"
                        >
                            <Ban className="w-4 h-4" /> <span style={{ fontFamily: '"Jua", sans-serif' }}>Chặn người này</span>
                        </button>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};