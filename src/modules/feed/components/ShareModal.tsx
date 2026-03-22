import React, { useState, useEffect } from 'react';
import { X, Check, Search, Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { friendService } from '@/modules/user/services/friend.service'; 
import { chatService } from '@/modules/chat/services/chat.service';
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
  const [loadingFriends, setLoadingFriends] = useState(true);
  
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchFriends = async () => {
      try {
        setLoadingFriends(true);
        const data = await friendService.getMyFriends({ page: 0, size: 50 });
        setFriendships(data);
      } catch (error) {
        console.error("Lỗi tải bạn bè:", error);
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelectFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]);
  };

  const handleShare = async () => {
    if (selectedFriends.length === 0 || isSending) return;
    setIsSending(true);
    try {
      await Promise.all(
        selectedFriends.map(friendId => chatService.sharePostToChat(friendId, postId, postImage, message))
      );
      onClose();
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredFriendships = friendships.filter(item => 
    item.friend?.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="text-white font-bold text-base">Chia sẻ</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khung tìm kiếm (Đã bỏ nút Copy Link) */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative flex items-center bg-zinc-800 rounded-lg px-3 focus-within:ring-1 ring-zinc-500 transition-all">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bạn bè..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none py-2.5 pl-2" 
            />
          </div>
        </div>

        {/* Danh sách bạn bè */}
        <div className="flex-1 overflow-y-auto px-2 py-2 min-h-[200px]">
          {loadingFriends ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
            </div>
          ) : (
            filteredFriendships.map((item) => {
              const friend = item.friend;
              const isSelected = selectedFriends.includes(friend.id);
              return (
                <div 
                  key={item.id} 
                  onClick={() => toggleSelectFriend(friend.id)} 
                  className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11 border border-zinc-800">
                      <AvatarImage src={friend.avatarUrl} />
                      <AvatarFallback>{friend.fullname[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-200">{friend.fullname}</span>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "bg-blue-600 border-blue-600" : "border-zinc-700")}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vùng nhập lời nhắn và gửi */}
        {selectedFriends.length > 0 && (
          <div className="p-4 border-t border-white/5 bg-zinc-900/90 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Viết lời nhắn..." 
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
                Gửi riêng cho {selectedFriends.length} người
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};