import React, { useState } from 'react';
import { Search, Edit } from 'lucide-react';
import { Conversation } from '../types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns'; 
import { vi } from 'date-fns/locale';

interface ChatListProps {
  conversations: Conversation[];
  // SỬA 1: Đổi number thành string để khớp với conv.id
  activeConvId: string | null; 
  // SỬA 2: Hàm callback cũng phải nhận string
  onSelect: (convId: string) => void;
  currentUserId: string; // Thêm prop này để so sánh lastSenderId chính xác
}

export const ChatList: React.FC<ChatListProps> = ({ 
  conversations, 
  activeConvId, 
  onSelect,
  currentUserId // Nhận ID của user đang đăng nhập
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConvs = conversations.filter(c => 
    c.partner.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black border-r border-white/10 w-full md:w-[350px]">
      {/* 1. Header & Search */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-white">Tin nhắn</h2>
          <button className="text-white hover:bg-white/10 p-2 rounded-full">
            <Edit className="w-5 h-5"/>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm bạn bè..." 
            className="w-full bg-[#262626] rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
          />
        </div>
      </div>

      {/* 2. Conversation List */}
      <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
        {filteredConvs.length === 0 ? (
           <div className="text-center text-zinc-600 mt-10 text-sm">Không tìm thấy cuộc trò chuyện</div>
        ) : (
          filteredConvs.map(conv => (
            <div 
              key={conv.id}
              // conv.id là string, onSelect nhận string -> OK
              onClick={() => onSelect(conv.id)} 
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5",
                // So sánh string với string -> OK
                activeConvId === conv.id ? "bg-white/10" : "" 
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                  <img 
                    src={conv.partner.avatarUrl || "/default-avatar.png"} 
                    className="w-12 h-12 rounded-full object-cover bg-zinc-800" 
                    alt={conv.partner.fullname}
                  />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={cn("text-sm truncate pr-2", conv.unreadCount > 0 ? "font-bold text-white" : "font-medium text-zinc-200")}>
                      {conv.partner.fullname}
                    </h4>
                    {/* Time */}
                    {conv.lastMessageAt && (
                        <span className="text-[10px] text-zinc-600 shrink-0">
                            {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: vi }).replace('khoảng ', '')}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "text-white font-semibold" : "text-zinc-500")}>
                    {/* SỬA 3: So sánh string với string (dùng currentUserId thay vì số 1) */}
                    {conv.lastSenderId === currentUserId && "Bạn: "} 
                    {conv.lastMessageContent || "Bắt đầu trò chuyện"} 
                  </p>
                  
                  {/* Badge Unread */}
                  {conv.unreadCount > 0 && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};