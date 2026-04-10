// File: src/modules/chat/components/ChatHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, UserX, Ban, Users, PanelLeft, ArrowLeft, Search, User } from 'lucide-react'; 
import { useChatStore } from '../store/useChatStore';
import { Link, useNavigate } from 'react-router-dom'; 
import { UserAvatarLink } from '@/components/ui/UserAvatarLink'; 
import { SearchMessageModal } from './SearchMessageModal';

interface ChatHeaderProps {
  partner: any; 
  onBlock: () => void;
  onUnfriend: () => void;
  isSidebarOpen?: boolean; 
  toggleSidebar?: () => void; 
  onBackMobile?: () => void; 
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ partner, onBlock, onUnfriend, isSidebarOpen, toggleSidebar, onBackMobile }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { conversations, activeConversationId, closeChat } = useChatStore(); 
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

  return (
    <>
      <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
        <div className="bg-white/95 dark:bg-[#2A2731]/95 backdrop-blur-xl px-3 py-2.5 rounded-[28px] shadow-[0_12px_40px_rgba(117,106,145,0.25)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 pointer-events-auto border-2 border-[#E1DDE8] dark:border-[#4A4559] w-fit min-w-[320px] max-w-full">
            
            {/* Nút Back trên Mobile */}
            {onBackMobile && (
                <button 
                  onClick={() => {
                      closeChat();
                      onBackMobile();
                  }} 
                  className="md:hidden w-10 h-10 rounded-full bg-[#F7F6FA] dark:bg-[#3B3645] flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-200 transition-transform active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}

            {/* Nút Toggle Sidebar */}
            {!isSidebarOpen && toggleSidebar && (
                <button onClick={toggleSidebar} className="hidden md:flex w-10 h-10 rounded-full bg-[#F7F6FA] dark:bg-[#3B3645] items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-200 transition-transform active:scale-95" title="Mở danh sách">
                    <PanelLeft className="w-5 h-5" />
                </button>
            )}

            {/* AVATAR TRẠNG THÁI */}
            <div className="relative shrink-0 ml-1">
                {isGroup ? (
                    <div className="w-12 h-12 bg-[#E1DDE8] dark:bg-[#3B3645] rounded-[20px] flex items-center justify-center overflow-hidden border border-white dark:border-zinc-600 shadow-sm">
                        {activeConversation?.boxAvatar ? (
                            activeConversation.boxAvatar.startsWith('http') ? (
                                <img src={activeConversation.boxAvatar} alt="Box Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl">{activeConversation.boxAvatar}</span>
                            )
                        ) : (
                            <Users className="w-6 h-6 text-[#756A91] dark:text-zinc-300" />
                        )}
                    </div>
                ) : (
                    <UserAvatarLink 
                        userId={partner?.id} 
                        avatarUrl={partner?.avatarUrl} 
                        fullname={partner?.fullname || "Người dùng"}
                        className="w-12 h-12 rounded-[20px] object-cover border-2 border-white dark:border-[#4A4559] shadow-sm block overflow-hidden"
                    />
                )}
                {partner?.isOnline && !isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#2A2731]" />
                )}
            </div>

            {/* THÔNG TIN CHI TIẾT */}
            <div className="flex flex-col pr-4 border-r border-zinc-200 dark:border-[#4A4559] flex-1 min-w-0">
                {isGroup ? (
                    <>
                        <span className="font-bold text-zinc-800 dark:text-zinc-50 text-[17px] leading-tight truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                            {activeConversation?.boxName || "Không gian chung"}
                        </span>
                        <span className="text-[11px] font-bold text-[#9288AD] dark:text-[#B0A7C4] mt-0.5">Không gian kết nối</span>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-zinc-800 dark:text-zinc-50 text-[17px] leading-tight truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                                {partner?.fullname}
                            </span>
                            <span className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 truncate lowercase" style={{ fontFamily: '"Nunito", sans-serif' }}>
                                @{partner?.handle || partner?.fullname?.replace(/\s/g, '').toLowerCase() || 'user'}
                            </span>
                        </div>
                        
                        <button 
                            onClick={() => navigate(`/profile/${partner?.id}`)}
                            className="flex items-center gap-1 mt-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors w-fit"
                            style={{ fontFamily: '"Nunito", sans-serif' }}
                        >
                            <User className="w-3 h-3" /> Xem trang cá nhân
                        </button>
                    </>
                )}
            </div>

            {/* CÁC NÚT CÔNG CỤ */}
            <div className="flex gap-1 pl-1 shrink-0 relative pr-1" ref={menuRef}>
                
                <button 
                  onClick={() => setShowSearchModal(true)} 
                  className="w-10 h-10 rounded-full bg-[#F7F6FA] dark:bg-[#3B3645] hover:bg-[#E1DDE8] dark:hover:bg-[#4A4559] flex items-center justify-center text-[#756A91] dark:text-zinc-200 transition-colors active:scale-95"
                  title="Tìm kiếm tin nhắn"
                >
                    <Search className="w-4 h-4" />
                </button>

                <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full bg-[#F7F6FA] dark:bg-[#3B3645] hover:bg-[#E1DDE8] dark:hover:bg-[#4A4559] flex items-center justify-center text-[#756A91] dark:text-zinc-200 transition-colors active:scale-95">
                    <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMenu && !isGroup && (
                    <div className="absolute right-0 top-full mt-3 w-52 bg-white dark:bg-[#2A2731] border-2 border-[#E1DDE8] dark:border-[#4A4559] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right">
                        <div className="py-1">
                            <button onClick={() => { if(confirm(`Hủy kết bạn với ${partner?.fullname}?`)) onUnfriend(); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-zinc-800 dark:text-zinc-100 font-bold hover:bg-[#F7F6FA] dark:hover:bg-[#3B3645] flex items-center gap-3 transition-colors">
                                <UserX className="w-4 h-4 text-[#9288AD]" /> <span style={{ fontFamily: '"Jua", sans-serif' }}>Hủy kết bạn</span>
                            </button>
                            <div className="h-[1px] bg-[#E1DDE8] dark:bg-[#4A4559] mx-2 my-1" />
                            <button onClick={() => { if(confirm(`Chặn ${partner?.fullname}?`)) onBlock(); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors">
                                <Ban className="w-4 h-4" /> <span style={{ fontFamily: '"Jua", sans-serif' }}>Chặn người này</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {activeConversationId && (
        <SearchMessageModal 
          isOpen={showSearchModal} 
          onClose={() => setShowSearchModal(false)} 
          conversationId={activeConversationId} 
        />
      )}
    </>
  );
};