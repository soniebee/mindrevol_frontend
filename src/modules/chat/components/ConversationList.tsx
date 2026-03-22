import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, Users, Edit } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useChatStore } from '../store/useChatStore';
import { friendService, FriendshipResponse } from '@/modules/user/services/friend.service';
import { chatService } from '../services/chat.service';

export const ConversationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    conversations, 
    activeConversationId, 
    openChat,
    fetchConversations 
  } = useChatStore();

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
    <div className="flex flex-col h-full w-full md:w-[380px] bg-white dark:bg-[#121212] transition-colors border-r border-zinc-200 dark:border-white/10">
      
      {/* Header List */}
      <div className="p-4 pb-3 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] dark:shadow-none z-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-[28px] font-bold text-black dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>Tin nhắn</h2>
          <button className="text-black dark:text-white bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 p-2.5 rounded-full transition-colors active:scale-95">
            <Edit className="w-5 h-5"/>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Tìm kiếm bạn bè..." 
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-[20px] py-2.5 pl-10 pr-4 text-[15px] text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-black focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" 
            style={{ fontFamily: '"Jua", sans-serif' }} 
          />
        </div>
      </div>

      {/* Danh sách Chat */}
      <div className="flex-1 overflow-y-auto mt-1 px-2 custom-scrollbar">
        {isLoading ? <div className="text-center text-zinc-400 text-sm mt-10" style={{ fontFamily: '"Jua", sans-serif' }}>Đang tải...</div>
        : displayList.length === 0 ? <div className="text-center text-zinc-400 mt-10 text-sm" style={{ fontFamily: '"Jua", sans-serif' }}>Chưa có cuộc trò chuyện nào.<br/>Hãy kết bạn để bắt đầu.</div>
        : displayList.map(item => {
            const isActive = String(activeConversationId) === String(item.conversationId);
            const isUnread = item.unreadCount > 0;
            let messagePreview = item.lastMessage;
            if (item.conversationId && item.isSelfSender && item.lastMessageAt) messagePreview = `Bạn: ${item.lastMessage}`;

            return (
              <button 
                key={item.id} 
                onClick={() => handleItemClick(item)} 
                className={cn(
                  "w-full flex items-center p-3 mb-1 rounded-[24px] transition-all group justify-start",
                  isActive ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 active:scale-95"
                )}
              >
                <div className="relative shrink-0">
                  {item.isGroup ? (
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border-[3px] bg-zinc-100 dark:bg-zinc-800 overflow-hidden transition-all",
                        isActive ? "border-black dark:border-white" : "border-zinc-200 dark:border-zinc-700"
                      )}>
                          {item.avatar ? <span className="text-2xl drop-shadow-sm">{item.avatar}</span> : <Users size={24} className="text-zinc-400" />}
                      </div>
                  ) : (
                      <>
                        <img src={item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random`} alt={item.name} className={cn("rounded-full object-cover border-[3px] transition-all w-14 h-14", isActive ? "border-black dark:border-white" : "border-zinc-200 dark:border-zinc-700")} />
                        {item.isOnline && <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-[3px] border-white dark:border-[#121212] rounded-full z-10 transition-colors" />}
                      </>
                  )}
                  {isUnread && <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white dark:border-[#121212] rounded-full z-10 animate-bounce transition-colors" />}
                </div>

                <div className="block ml-3.5 flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={cn("text-[17px] truncate flex items-center gap-1.5 transition-colors", isUnread ? "font-bold text-black dark:text-white" : "font-medium text-zinc-700 dark:text-zinc-300")} style={{ fontFamily: '"Jua", sans-serif' }}>
                      {item.name}
                      {item.isGroup && <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold border border-emerald-200 dark:border-emerald-800">Box</span>}
                    </span>
                    {item.lastMessageAt && <span className="text-[11px] ml-2 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">{formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: false, locale: vi }).replace('khoảng ', '')}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                      <p className={cn("truncate text-[14px] max-w-[200px] transition-colors", isUnread ? "text-black dark:text-white font-semibold" : "text-zinc-500 dark:text-zinc-400 font-medium")} style={{ fontFamily: isUnread ? '"Jua", sans-serif' : 'inherit' }}>{messagePreview}</p>
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