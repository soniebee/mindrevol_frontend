// File: src/modules/chat/components/ConversationList.tsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, ArrowLeft, Pin, BellOff, MoreHorizontal, Trash2 } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useChatStore } from '../store/useChatStore';
import { friendService, FriendshipResponse } from '@/modules/user/services/friend.service';
import { chatService } from '../services/chat.service';

interface ConversationListProps {}

type TabType = 'ALL' | 'UNREAD' | 'GROUP';

export const ConversationList: React.FC<ConversationListProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, activeConversationId, openChat, fetchConversations, togglePin, toggleMute, hideConversation } = useChatStore();

  const [friendships, setFriendships] = useState<FriendshipResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    friendService.getMyFriends({ page: 0, size: 100 }).then(setFriendships).finally(() => setIsLoading(false));
  }, []);

  const displayList = useMemo(() => {
    let friendListItems = friendships.map(f => {
      const existingConv = conversations.find(c => !c.boxId && String(c.partner?.id) === String(f.friend.id));
      return {
        id: existingConv ? existingConv.id : `friend_${f.friend.id}`, 
        isGroup: false, 
        userId: f.friend.id,
        name: f.friend.fullname || 'Người dùng', 
        avatar: f.friend.avatarUrl, 
        isOnline: f.friend.isOnline,
        conversationId: existingConv?.id || null, 
        lastMessage: existingConv?.lastMessageContent || "Bắt đầu trò chuyện",
        lastMessageAt: existingConv?.lastMessageAt, 
        unreadCount: existingConv?.unreadCount || 0,
        isSelfSender: existingConv ? String(existingConv.lastSenderId) === String(user?.id) : false,
        isPinned: existingConv?.isPinned || false,
        isMuted: existingConv?.isMuted || false
      };
    });

    const boxConversations = conversations.filter(c => c.boxId && c.boxName).map(c => ({
        id: c.id, 
        isGroup: true, 
        boxId: c.boxId, 
        name: c.boxName || 'Không gian', 
        avatar: c.boxAvatar || null,
        isOnline: false, 
        conversationId: c.id, 
        lastMessage: c.lastMessageContent || "Chưa có tin nhắn",
        lastMessageAt: c.lastMessageAt, 
        unreadCount: c.unreadCount || 0, 
        isSelfSender: String(c.lastSenderId) === String(user?.id),
        isPinned: c.isPinned || false,
        isMuted: c.isMuted || false
    }));

    const friendIds = new Set(friendships.map(f => String(f.friend.id)));
    const otherConversations = conversations.filter(c => !c.boxId && c.partner && !friendIds.has(String(c.partner.id))).map(c => ({
        id: c.id, 
        isGroup: false, 
        userId: c.partner!.id, 
        name: c.partner!.fullname || 'Người dùng',
        avatar: c.partner!.avatarUrl, 
        isOnline: false, 
        conversationId: c.id, 
        lastMessage: c.lastMessageContent || "Chưa có tin nhắn",
        lastMessageAt: c.lastMessageAt, 
        unreadCount: c.unreadCount || 0, 
        isSelfSender: String(c.lastSenderId) === String(user?.id),
        isPinned: c.isPinned || false,
        isMuted: c.isMuted || false
    }));

    let merged = [...boxConversations, ...friendListItems, ...otherConversations].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0) - (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0);
    });

    if (searchTerm.trim()) {
        merged = merged.filter(item => (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (activeTab === 'UNREAD') {
        merged = merged.filter(item => item.unreadCount > 0 && !item.isMuted);
    } else if (activeTab === 'GROUP') {
        merged = merged.filter(item => item.isGroup);
    }

    return merged;
  }, [friendships, conversations, searchTerm, activeTab, user?.id]);

  const handleItemClick = async (item: any) => {
    if (item.conversationId) { await openChat(item.conversationId); } 
    else {
      try {
        const newConv = await chatService.getOrCreateConversation(item.userId);
        if (newConv?.id) { await fetchConversations(); await openChat(newConv.id); }
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F7F6FA]/60 dark:bg-[#121212]/80 backdrop-blur-xl transition-colors border-r border-[#E1DDE8] dark:border-zinc-800">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="md:hidden w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-3xl text-zinc-800 dark:text-white font-jua">Tin nhắn</h2>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
          <input 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm người đồng hành..." 
            className="w-full bg-white dark:bg-zinc-900 rounded-[24px] py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-4 focus:ring-[#E1DDE8]/50 dark:focus:ring-zinc-700 shadow-sm text-zinc-700 dark:text-zinc-200 font-bold placeholder:text-zinc-400 transition-all border border-transparent"
            style={{ fontFamily: '"Nunito", sans-serif' }}
          />
        </div>

        <div className="flex items-center gap-2 mt-4 px-1 pb-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('ALL')}
            className={cn(
              "px-4 py-1.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap",
              activeTab === 'ALL' ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm" : "bg-white/50 text-zinc-500 hover:bg-white dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
            style={{ fontFamily: '"Nunito", sans-serif' }}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('UNREAD')}
            className={cn(
              "px-4 py-1.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap",
              activeTab === 'UNREAD' ? "bg-blue-500 text-white shadow-sm shadow-blue-500/20" : "bg-white/50 text-zinc-500 hover:bg-white dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
            style={{ fontFamily: '"Nunito", sans-serif' }}
          >
            Chưa đọc
          </button>
          <button
            onClick={() => setActiveTab('GROUP')}
            className={cn(
              "px-4 py-1.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap",
              activeTab === 'GROUP' ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm" : "bg-white/50 text-zinc-500 hover:bg-white dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
            style={{ fontFamily: '"Nunito", sans-serif' }}
          >
            Nhóm chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
        {isLoading ? <div className="text-center text-zinc-400 text-sm mt-10" style={{ fontFamily: '"Nunito", sans-serif' }}>Đang kết nối...</div>
        : displayList.length === 0 ? <div className="text-center text-zinc-400 mt-10 text-[15px] font-semibold" style={{ fontFamily: '"Nunito", sans-serif' }}>
            {activeTab === 'UNREAD' ? 'Bạn đã đọc hết tin nhắn rồi 🎉' : activeTab === 'GROUP' ? 'Chưa có nhóm trò chuyện nào.' : 'Chưa có ai ở đây cả.'}
        </div>
        : displayList.map(item => {
            const isActive = String(activeConversationId) === String(item.conversationId);
            const isUnread = item.unreadCount > 0 && !item.isMuted; 
            let messagePreview = item.lastMessage;
            if (item.conversationId && item.isSelfSender && item.lastMessageAt) messagePreview = `Bạn: ${item.lastMessage}`;

            return (
              <div key={item.id} className="relative group">
                  <div 
                    onClick={() => handleItemClick(item)} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-[28px] cursor-pointer transition-all active:scale-[0.98]",
                      isActive ? "bg-white dark:bg-zinc-800 shadow-[0_8px_24px_rgba(146,136,173,0.12)] border border-[#F0EFF5] dark:border-zinc-700" : "hover:bg-white/50 dark:hover:bg-zinc-800/50 border border-transparent"
                    )}
                  >
                    <div className="relative shrink-0">
                      {item.isGroup ? (
                          <div className="w-14 h-14 rounded-[20px] bg-[#F0EFF5] dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                              {item.avatar?.startsWith('http') ? (
                                  <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                  <span className="text-2xl">{item.avatar || '☁️'}</span>
                              )}
                          </div>
                      ) : (
                          <img src={item.avatar || `https://ui-avatars.com/api/?name=${item.name || 'U'}&background=random`} alt={item.name} className="w-14 h-14 rounded-[20px] object-cover" />
                      )}
                      {isUnread && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white dark:border-zinc-800 rounded-full animate-bounce" />}
                      {item.isOnline && !item.isGroup && !isUnread && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800" />}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-jua text-[18px] text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                            {item.name}
                            {item.isMuted && <BellOff className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                            {item.isPinned && <Pin className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />}
                            {item.lastMessageAt && <span className="text-[12px] font-bold text-[#9288AD] bg-[#F7F6FA] dark:bg-zinc-800 px-2 py-0.5 rounded-full whitespace-nowrap">{formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: false, locale: vi }).replace('khoảng ', '')}</span>}
                        </div>
                      </div>
                      <p className={cn("text-[14px] truncate transition-colors pr-2", isUnread ? "text-zinc-800 dark:text-white font-bold" : "text-zinc-500 dark:text-zinc-400 font-semibold")} style={{ fontFamily: '"Nunito", sans-serif' }}>{messagePreview}</p>
                    </div>
                  </div>

                  {item.conversationId && (
                      <div className={cn("absolute right-2 top-1/2 -translate-y-1/2 transition-opacity z-10", menuOpenId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }} 
                            className="p-2 bg-white dark:bg-zinc-700 rounded-full shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-500 dark:text-zinc-300"
                          >
                              <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {menuOpenId === item.id && (
                              <div ref={menuRef} className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#1E1E24] shadow-xl border border-zinc-100 dark:border-zinc-800 rounded-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 origin-top-right">
                                  <button onClick={(e) => { e.stopPropagation(); togglePin(item.conversationId!); setMenuOpenId(null); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"><Pin className="w-4 h-4 text-zinc-400"/> {item.isPinned ? 'Bỏ ghim' : 'Ghim hội thoại'}</button>
                                  <button onClick={(e) => { e.stopPropagation(); toggleMute(item.conversationId!); setMenuOpenId(null); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"><BellOff className="w-4 h-4 text-zinc-400"/> {item.isMuted ? 'Bật thông báo' : 'Tắt thông báo'}</button>
                                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                                  <button onClick={(e) => { e.stopPropagation(); hideConversation(item.conversationId!); setMenuOpenId(null); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"><Trash2 className="w-4 h-4"/> Xóa đoạn chat</button>
                              </div>
                          )}
                      </div>
                  )}
              </div>
            );
        })}
      </div>
    </div>
  );
};