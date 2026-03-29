import React, { useState, useEffect } from 'react';
import { X, Check, Search, Loader2, Send, Users } from 'lucide-react'; // Thêm icon Users
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { friendService } from '@/modules/user/services/friend.service'; 
import { chatService } from '@/modules/chat/services/chat.service';
import { useChatStore } from '@/modules/chat/store/useChatStore'; // Thêm store để lấy Box
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postImage: string; 
}

export const ShareModal = ({ isOpen, onClose, postId, postImage }: ShareModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friendships, setFriendships] = useState<any[]>([]);
  const { conversations, fetchConversations } = useChatStore(); // Lấy danh sách hội thoại/box
  const [loadingData, setLoadingData] = useState(true);
  
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]); // Đổi tên để chứa cả friendId và boxId
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        setLoadingData(true);
        // Tải song song cả Bạn bè và các Box Chat
        const [friendsData] = await Promise.all([
          friendService.getMyFriends({ page: 0, size: 50 }),
          fetchConversations()
        ]);
        setFriendships(friendsData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isOpen, fetchConversations]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedTargets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleShare = async () => {
    if (selectedTargets.length === 0 || isSending) return;
    setIsSending(true);
    try {
      await Promise.all(
        selectedTargets.map(async (id) => {
          // 1. Kiểm tra xem id này có phải của Box Chat không
          const targetConv = conversations.find(c => c.id === id);
          const isBox = !!targetConv?.boxId;

          // 2. Truyền thẳng "id" vào hàm
          // Nếu là Box: 'id' chính là conversationId
          // Nếu là Bạn: 'id' chính là receiverId
          return chatService.sharePostToChat(id, postId, postImage, message, isBox);
        })
      );
      onClose();
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Lọc danh sách Bạn bè
  const filteredFriendships = friendships.filter(item => 
    item.friend?.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lọc danh sách Box Chat (Chỉ lấy những hội thoại có boxId)
  const filteredBoxes = conversations.filter(c => 
    !!c.boxId && (c.boxName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="text-white font-bold text-base">Chia sẻ vào Box hoặc Bạn bè</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="relative flex items-center bg-zinc-800 rounded-lg px-3 focus-within:ring-1 ring-zinc-500 transition-all">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input 
              type="text" 
              placeholder="Tìm bạn bè hoặc nhóm..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none py-2.5 pl-2" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 min-h-[200px]">
          {loadingData ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
            </div>
          ) : (
            <>
              {/* PHẦN HIỂN THỊ BOX CHAT TRƯỚC */}
              {filteredBoxes.map((box) => {
                const isSelected = selectedTargets.includes(box.id);
                return (
                  <div key={box.id} onClick={() => toggleSelect(box.id)} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center overflow-hidden text-xl">
                        {box.boxAvatar ? <span>{box.boxAvatar}</span> : <Users className="text-emerald-500 w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-400">{box.boxName}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Box Chat</span>
                      </div>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "bg-blue-600 border-blue-600" : "border-zinc-700")}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                );
              })}

              {/* PHẦN HIỂN THỊ BẠN BÈ (CODE CŨ CỦA BRO) */}
              {filteredFriendships.map((item) => {
                const friend = item.friend;
                const isSelected = selectedTargets.includes(friend.id);
                return (
                  <div key={item.id} onClick={() => toggleSelect(friend.id)} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 border border-zinc-800">
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback>{friend.fullname[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">{friend.fullname}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Bạn bè</span>
                      </div>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "bg-blue-600 border-blue-600" : "border-zinc-700")}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {selectedTargets.length > 0 && (
          <div className="p-4 border-t border-white/5 bg-zinc-900/90 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Viết lời nhắn chia sẻ..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 ring-blue-500 outline-none" 
              />
              <button 
                onClick={handleShare} 
                disabled={isSending} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                Gửi cho {selectedTargets.length} mục tiêu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};