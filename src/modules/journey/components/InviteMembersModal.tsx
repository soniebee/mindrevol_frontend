import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, UserPlus, Loader2, Check } from 'lucide-react';
import { journeyService } from '../services/journey.service';
import { toast } from 'react-hot-toast';
import { UserSummary } from '../types';
import { trackEvent } from '@/lib/analytics'; // [Analytics] Import

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  inviteCode: string;
}

export const InviteMembersModal: React.FC<Props> = ({ isOpen, onClose, journeyId, inviteCode }) => {
  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && journeyId) {
      loadInvitableFriends();
    }
  }, [isOpen, journeyId]);

  const loadInvitableFriends = async () => {
    setLoading(true);
    try {
      // Gọi API mới: Backend đã tự lọc những người đã tham gia
      const data = await journeyService.getInvitableFriends(journeyId);
      setFriends(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (friendId: string) => {
    setInviteLoading(friendId);
    try {
      await journeyService.inviteFriend(journeyId, friendId);
      
      // [Analytics] Đo lường: Growth
      trackEvent('invite_sent', {
         journey_id: journeyId,
         method: 'direct_invite_modal'
      });
      
      toast.success("Đã gửi lời mời!");
      setInvitedIds(prev => new Set(prev).add(friendId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi mời bạn bè");
    } finally {
      setInviteLoading(null);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    
    // [Analytics] Đo lường: Growth (Sao chép mã)
    trackEvent('invite_code_copied', {
        journey_id: journeyId,
        source: 'modal'
    });
    
    toast.success("Đã sao chép mã mời!");
  };

  if (!isOpen) return null;

  // Search local trên danh sách đã được backend trả về
  const filteredFriends = friends.filter(friend => {
    const search = searchTerm.toLowerCase();
    const name = friend.fullname ? friend.fullname.toLowerCase() : '';
    const handle = friend.handle ? friend.handle.toLowerCase() : '';
    return name.includes(search) || handle.includes(search);
  });

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 animate-in fade-in zoom-in-95">
      <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Mời bạn bè</h3>
            <p className="text-xs text-zinc-500 mt-1">Mã tham gia: <span onClick={handleCopyCode} className="text-blue-400 font-mono cursor-pointer hover:underline">{inviteCode}</span></p>
          </div>
          <button onClick={onClose}><X className="text-zinc-400 hover:text-white" /></button>
        </div>

        {/* Search */}
        <div className="p-4 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bạn bè..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500"/></div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              {searchTerm ? "Không tìm thấy kết quả." : "Bạn chưa có bạn bè nào để mời (hoặc họ đã tham gia rồi)."}
            </div>
          ) : (
            filteredFriends.map(friend => {
              const isInvited = invitedIds.has(friend.id);
              const avatarSrc = friend.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullname)}&background=random&color=fff`;
              
              return (
                <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl border border-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={avatarSrc} 
                      className="w-10 h-10 rounded-full bg-zinc-800 object-cover" 
                      alt={friend.fullname}
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullname)}`; }}
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{friend.fullname}</p>
                      <p className="text-xs text-zinc-500">@{friend.handle}</p>
                    </div>
                  </div>
                  
                  {isInvited ? (
                    <button disabled className="px-3 py-1.5 bg-green-500/10 text-green-500 text-xs rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đã mời
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInvite(friend.id)}
                      disabled={!!inviteLoading}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      {inviteLoading === friend.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <UserPlus className="w-3 h-3" />}
                      Mời
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};