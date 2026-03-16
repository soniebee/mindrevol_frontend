import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, ChevronLeft } from 'lucide-react'; // Đã thêm ChevronLeft
import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useChatStore } from '../store/useChatStore';
import { friendService, FriendshipResponse } from '@/modules/user/services/friend.service';
import { chatService } from '../services/chat.service';

export const ConversationList = () => {
  const navigate = useNavigate(); // Dùng hook này để chuyển trang
  const { user } = useAuth();
  
  const { 
    conversations, 
    activeConversationId, 
    openChat 
  } = useChatStore();

  const [friendships, setFriendships] = useState<FriendshipResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const list = await friendService.getMyFriends({ page: 0, size: 100 });
        setFriendships(list);
      } catch (error) {
        console.error("Failed to fetch friends", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const displayList = useMemo(() => {
    if (!friendships || friendships.length === 0) return [];

    let merged = friendships.map(friendshipItem => {
      const friendUser = friendshipItem.friend; 
      
      const existingConv = conversations.find(
        c => String(c.partner.id) === String(friendUser.id)
      );

      return {
        userId: friendUser.id,
        userInfo: friendUser,
        conversationId: existingConv ? existingConv.id : null,
        lastMessage: existingConv?.lastMessageContent || "Bắt đầu trò chuyện",
        lastMessageAt: existingConv?.lastMessageAt,
        unreadCount: existingConv?.unreadCount || 0,
        isSelfSender: existingConv ? String(existingConv.lastSenderId) === String(user?.id) : false
      };
    });

    merged.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA; 
    });

    if (searchTerm.trim()) {
        merged = merged.filter(item => 
            item.userInfo.fullname.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return merged;
  }, [friendships, conversations, searchTerm, user?.id]);

  const handleItemClick = async (item: any) => {
    if (item.conversationId) {
      openChat(item.conversationId); 
    } else {
      try {
        const newConv = await chatService.getOrCreateConversation(item.userId);
        if (newConv && newConv.id) {
           openChat(newConv.id);
        } else {
           window.location.reload();
        }
      } catch (error) {
        console.error("Cannot create chat", error);
      }
    }
  };

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
  `;

  return (
    <div className="flex flex-col h-full w-full bg-white font-['Jua'] border-r border-zinc-200">
      <style>{scrollbarStyles}</style>

      {/* HEADER: Đã thêm nút Back (ChevronLeft) */}
      <div className="h-[72px] shrink-0 flex items-center px-4 border-b border-zinc-200 gap-3">
        <button 
           onClick={() => navigate('/')} 
           className="w-10 h-10 bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-center text-black hover:bg-neutral-200 transition-colors shrink-0"
           title="Quay lại Trang chủ"
        >
           <ChevronLeft className="w-6 h-6 ml-[-2px]" />
        </button>
        <h2 className="text-2xl font-normal text-black mt-1">Đoạn chat</h2>
      </div>

      {/* SEARCH */}
      <div className="px-4 py-3">
          <div className="relative bg-neutral-100 rounded-[20px] border border-neutral-200">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Tìm kiếm bạn bè..."
               className="w-full bg-transparent border-none py-2.5 pl-10 pr-4 text-[16px] text-black focus:ring-0 placeholder:text-neutral-400 outline-none"
             />
          </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 space-y-1">
        {isLoading ? (
             <div className="text-center text-neutral-400 text-base mt-10">Đang tải danh sách...</div>
        ) : displayList.length === 0 ? (
           <div className="text-center text-neutral-400 mt-10 text-base leading-relaxed">
             Chưa có bạn bè nào.<br/>Hãy kết bạn để bắt đầu trò chuyện.
           </div>
        ) : (
            displayList.map((item) => {
            const isActive = String(activeConversationId) === String(item.conversationId);
            const isUnread = item.unreadCount > 0;
            
            let messagePreview = item.lastMessage;
            if (item.conversationId && item.isSelfSender && item.lastMessageAt) {
                messagePreview = `Bạn: ${item.lastMessage}`;
            }

            return (
              <button
                key={item.userId}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center p-3 rounded-[20px] transition-all duration-200 group relative",
                  "justify-start text-left", 
                  isActive ? "bg-sky-100/70 shadow-sm" : "hover:bg-neutral-100"
                )}
              >
                {/* AVATAR */}
                <div className="relative shrink-0">
                  <img 
                    src={item.userInfo.avatarUrl || `https://ui-avatars.com/api/?name=${item.userInfo.fullname}&background=random`} 
                    alt={item.userInfo.fullname}
                    className="rounded-full object-cover border border-neutral-200 transition-all w-14 h-14 bg-gray-200"
                  />
                  {item.userInfo.isOnline && (
                     <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                  {isUnread && (
                     <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </div>

                {/* INFO */}
                <div className="block ml-3 flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={cn("text-[20px] truncate", isUnread ? "text-black font-medium" : "text-black")}>
                      {item.userInfo.fullname}
                    </span>
                    {item.lastMessageAt && (
                      <span className="text-sm text-gray-400 ml-2 shrink-0">
                        {formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: false, locale: vi }).replace('khoảng ', '')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                      <p className={cn("truncate text-[16px] max-w-[180px]", isUnread ? "text-black" : "text-gray-400")}>
                        {messagePreview}
                      </p>
                      {isUnread ? (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 ml-2">
                           <span className="text-xs text-white">
                             {item.unreadCount > 9 ? '9+' : item.unreadCount}
                           </span>
                        </div>
                      ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};