import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Phone } from 'lucide-react'; // Thêm icon Phone
import { UserSummary } from '../types';
import { useChatStore } from '../store/useChatStore';
import { Link } from 'react-router-dom';

interface ChatHeaderProps {
  partner: UserSummary;
  onBlock: () => void;
  onUnfriend: () => void;
  onStartCall?: () => void; // Thêm prop này để kích hoạt gọi WebRTC
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ partner, onBlock, onUnfriend, onStartCall }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openChat } = useChatStore();

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
    // Dùng shrink-0 w-full để biến khối này thành 1 hàng cố định không bao giờ bị ép nhỏ
    <div className="h-[72px] w-full shrink-0 z-20 flex items-center justify-between px-4 bg-white/90 backdrop-blur-xl border-b border-zinc-200 font-['Jua'] shadow-sm">
      <div className="flex items-center gap-4">
        
        {/* Nút Back tròn */}
        <button 
           onClick={() => openChat(null)} 
           className="w-10 h-10 bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-center text-black hover:bg-neutral-200 transition-colors"
        >
           <ChevronLeft className="w-6 h-6 ml-[-2px]" />
        </button>

        {/* Avatar & Tên */}
        <div className="flex items-center gap-3">
           <div className="relative group shrink-0">
             <img 
                src={partner.avatarUrl || "https://placehold.co/100x100"} 
                className="w-12 h-12 bg-gray-200 rounded-full object-cover border border-neutral-200"
                alt={partner.fullname}
             />
             {partner.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
             )}
           </div>
           <div className="flex flex-col justify-center">
             <Link to={`/profile/${partner.id}`} className="text-black text-xl font-normal hover:underline">
                 {partner.fullname || 'Cindy'}
             </Link>
             <span className="text-neutral-400 text-xs font-normal">Friend</span>
           </div>
        </div>
      </div>

      {/* Cụm nút bên phải: Gọi điện + Menu */}
      <div className="flex items-center gap-2">
          {/* Nút Gọi điện (Mới thêm) */}
          <button 
              onClick={onStartCall}
              className="w-10 h-10 bg-slate-100 rounded-full border border-neutral-200 flex items-center justify-center text-blue-500 hover:bg-slate-200 transition-colors"
              title="Gọi thoại"
          >
              <Phone className="w-5 h-5" fill="currentColor" />
          </button>

          {/* Nút Menu tròn */}
          <div className="relative" ref={menuRef}>
              <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 bg-slate-100 rounded-full border border-neutral-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200 transition-colors"
              >
                  <div className="w-4 h-[1.5px] bg-black" />
                  <div className="w-4 h-[1.5px] bg-black" />
              </button>

              {/* Menu Dropdown */}
              {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50 text-base">
                      <div className="py-1">
                        <button onClick={onUnfriend} className="w-full text-left px-4 py-3 text-black hover:bg-neutral-100">Hủy kết bạn</button>
                        <div className="h-[1px] bg-neutral-200 mx-2"></div>
                        <button onClick={onBlock} className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50">Chặn người này</button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};