import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, UserX, Ban, ChevronLeft, Users } from 'lucide-react'; 
import { useChatStore } from '../store/useChatStore';
import { Link } from 'react-router-dom'; 

interface Props {
  partner: any; 
  onBlock: () => void;
  onUnfriend: () => void;
}

export const MobileChatHeader: React.FC<Props> = ({ partner, onBlock, onUnfriend }) => {
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
    if (confirm(confirmMsg)) action();
    setShowMenu(false);
  };

  return (
    <div className="h-[72px] absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 bg-white/60 backdrop-blur-md border-b border-zinc-200 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={() => openChat(null)} className="p-2 -ml-2 text-zinc-600 hover:text-black">
           <ChevronLeft className="w-8 h-8" />
        </button>

        {isGroup ? (
             <div className="w-12 h-12 border-2 border-black bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                 <div className="absolute inset-0 border-[3px] border-black opacity-10 translate-x-[2px] translate-y-[2px]" />
                 {activeConversation?.boxAvatar ? (
                     <span className="text-2xl relative z-10">{activeConversation.boxAvatar}</span>
                 ) : (
                     <Users size={24} className="text-black relative z-10" />
                 )}
             </div>
        ) : (
             <div className="relative group shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-black bg-gray-200">
                 <img src={partner?.avatarUrl || "https://placehold.co/100x100"} alt="Avatar" className="w-full h-full object-cover"/>
                 {partner?.isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2px] border-black" />}
             </div>
        )}
        
        <div className="flex flex-col justify-center overflow-hidden pl-1">
          {isGroup ? (
              <>
                  <span className="font-bold text-black text-xl leading-tight truncate flex items-center gap-2" style={{ fontFamily: '"Jua", sans-serif' }}>
                      <span>{activeConversation?.boxName || "Không gian chung"}</span>
                  </span>
                  <span className="text-sm text-neutral-500 font-medium cursor-pointer hover:underline" style={{ fontFamily: '"Jua", sans-serif' }} onClick={() => window.history.back()}>Box Chat</span>
              </>
          ) : (
              <>
                  <Link to={`/profile/${partner?.id}`} className="font-bold text-black text-xl leading-tight cursor-pointer hover:underline transition-all truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                      {partner?.fullname}
                  </Link>
                  <span className="text-sm text-neutral-400" style={{ fontFamily: '"Jua", sans-serif' }}>Friend</span>
              </>
          )}
        </div>
      </div>

      {!isGroup && (
          <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full transition-all text-black hover:bg-black/5">
                  <MoreHorizontal className="w-8 h-8" />
              </button>
              {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right">
                      <div className="py-1">
                        <button onClick={() => handleAction(onUnfriend, `Hủy kết bạn với ${partner?.fullname}?`)} className="w-full text-left px-4 py-3 text-sm text-black font-bold hover:bg-zinc-100 flex items-center gap-3 transition-colors">
                            <UserX className="w-4 h-4" /> <span style={{ fontFamily: '"Jua", sans-serif' }}>Hủy kết bạn</span>
                        </button>
                        <div className="h-[2px] bg-black mx-2 my-1" />
                        <button onClick={() => handleAction(onBlock, `Chặn ${partner?.fullname}?`)} className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold hover:bg-red-50 flex items-center gap-3 transition-colors">
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