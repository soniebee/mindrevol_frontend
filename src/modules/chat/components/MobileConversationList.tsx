import React, { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, Users, Edit, ArrowLeft } from 'lucide-react'; // Thêm ArrowLeft
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useChatStore } from '../store/useChatStore';
import { friendService, FriendshipResponse } from '@/modules/user/services/friend.service';
import { chatService } from '../services/chat.service';

export const MobileConversationList = () => {
  const { user } = useAuth();
  const { conversations, openChat, fetchConversations } = useChatStore();
  const navigate = useNavigate(); // Khởi tạo navigate

  const [friendships, setFriendships] = useState<FriendshipResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    friendService.getMyFriends({ page: 0, size: 100 })
      .then(setFriendships)
      .finally(() => setIsLoading(false));
  }, []);

  const displayList = useMemo(() => {
    let friendListItems = friendships.map(f => {
      const existingConv = conversations.find(c => !c.boxId && String(c.partner?.id) === String(f.friend.id));
      return {
        id: existingConv ? existingConv.id : `friend_${f.friend.id}`,
        isGroup: false,
        userId: f.friend.id,
        name: f.friend.fullname,
        avatar: f.friend.avatarUrl,
        isOnline: f.friend.isOnline,
        conversationId: existingConv?.id || null,
        lastMessage: existingConv?.lastMessageContent || "Bắt đầu trò chuyện",
        lastMessageAt: existingConv?.lastMessageAt,
        unreadCount: existingConv?.unreadCount || 0,
        isSelfSender: existingConv ? String(existingConv.lastSenderId) === String(user?.id) : false
      };
    });

    const boxConversations = conversations.filter(c => c.boxId).map(c => ({
        id: c.id, isGroup: true, boxId: c.boxId, name: c.boxName || "Không gian chung", 
        avatar: c.boxAvatar || null, isOnline: false, conversationId: c.id,
        lastMessage: c.lastMessageContent || "Chưa có tin nhắn",
        lastMessageAt: c.lastMessageAt, unreadCount: c.unreadCount || 0,
        isSelfSender: String(c.lastSenderId) === String(user?.id)
    }));

    let merged = [...boxConversations, ...friendListItems].sort((a, b) => 
        (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0) - (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0)
    );

    if (searchTerm.trim()) merged = merged.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return merged;
  }, [friendships, conversations, searchTerm, user?.id]);

  const handleItemClick = async (item: any) => {
    if (item.conversationId) {
      await openChat(item.conversationId); 
    } else {
      try {
        const newConv = await chatService.getOrCreateConversation(item.userId);
        if (newConv?.id) { await fetchConversations(); await openChat(newConv.id); }
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-4 pb-3 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] z-10">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-4 px-1">
          <div className="flex items-center gap-2">
            {/* Nút quay lại trang chủ */}
            <button 
              onClick={() => navigate('/')} 
              className="p-2 -ml-2 text-black hover:bg-zinc-100 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[28px] font-bold text-black" style={{ fontFamily: '"Jua", sans-serif' }}>Tin nhắn</h2>
          </div>
          <button className="text-black bg-zinc-100 hover:bg-zinc-200 p-2.5 rounded-full transition-colors active:scale-95">
            <Edit className="w-5 h-5"/>
          </button>
        </div>

        {/* --- TÌM KIẾM --- */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm bạn bè..." className="w-full bg-zinc-100 border border-transparent rounded-[20px] py-2.5 pl-10 pr-4 text-[15px] text-black focus:outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition-all placeholder:text-zinc-400" style={{ fontFamily: '"Jua", sans-serif' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-1 px-2">
        {isLoading ? <div className="text-center text-zinc-400 text-sm mt-10" style={{ fontFamily: '"Jua", sans-serif' }}>Đang tải...</div>
        : displayList.length === 0 ? <div className="text-center text-zinc-400 mt-10 text-sm" style={{ fontFamily: '"Jua", sans-serif' }}>Chưa có cuộc trò chuyện nào.<br/>Hãy kết bạn để bắt đầu.</div>
        : displayList.map(item => {
            const isUnread = item.unreadCount > 0;
            let messagePreview = item.lastMessage;
            if (item.conversationId && item.isSelfSender && item.lastMessageAt) messagePreview = `Bạn: ${item.lastMessage}`;

            return (
              <button key={item.id} onClick={() => handleItemClick(item)} className="w-full flex items-center p-3 mb-1 rounded-[24px] transition-all hover:bg-zinc-50 active:scale-95 group justify-start">
                <div className="relative shrink-0">
                  {item.isGroup ? (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-[3px] border-zinc-200 bg-zinc-100 overflow-hidden">
                          {item.avatar ? <span className="text-2xl drop-shadow-sm">{item.avatar}</span> : <Users size={24} className="text-zinc-400" />}
                      </div>
                  ) : (
                      <>
                        <img src={item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random`} alt={item.name} className="rounded-full object-cover border-[3px] border-zinc-200 w-14 h-14" />
                        {item.isOnline && <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full z-10" />}
                      </>
                  )}
                  {isUnread && <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full z-10 animate-bounce" />}
                </div>

                <div className="block ml-3.5 flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={cn("text-[17px] truncate flex items-center gap-1.5", isUnread ? "font-bold text-black" : "font-medium text-zinc-700")} style={{ fontFamily: '"Jua", sans-serif' }}>
                      {item.name}
                      {item.isGroup && <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold border border-emerald-200">Box</span>}
                    </span>
                    {item.lastMessageAt && <span className="text-[11px] ml-2 shrink-0 font-medium text-zinc-400">{formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: false, locale: vi }).replace('khoảng ', '')}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                      <p className={cn("truncate text-[14px] max-w-[200px]", isUnread ? "text-black font-semibold" : "text-zinc-500 font-medium")} style={{ fontFamily: isUnread ? '"Jua", sans-serif' : 'inherit' }}>{messagePreview}</p>
                      {isUnread && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 ml-2"><span className="text-[10px] font-bold text-white">{item.unreadCount > 9 ? '9+' : item.unreadCount}</span></div>}
                  </div>
                </div>
              </button>
            );
        })}
        <div className="h-6" />
      </div>
    </div>
  );
};