import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, UserPlus, Loader2, Check, Users, Copy } from 'lucide-react';
import { journeyService } from '../services/journey.service';
import { toast } from 'react-hot-toast';
import { UserSummary } from '../types';
import { trackEvent } from '@/lib/analytics'; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  inviteCode?: string; 
}

export const InviteMembersModal: React.FC<Props> = ({ isOpen, onClose, journeyId, inviteCode = "" }) => {
  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && journeyId) loadInvitableFriends();
  }, [isOpen, journeyId]);

  const loadInvitableFriends = async () => {
    setLoading(true);
    try {
      const data = await journeyService.getInvitableFriends(journeyId);
      setFriends(data);
    } catch (error) { toast.error("Không thể tải danh sách"); } finally { setLoading(false); }
  };

  const handleInvite = async (friendId: string) => {
    setInviteLoading(friendId);
    try {
      await journeyService.inviteFriend(journeyId, friendId);
      trackEvent('invite_sent', { journey_id: journeyId, method: 'direct_invite_modal' });
      toast.success("Đã gửi lời mời!");
      setInvitedIds(prev => new Set(prev).add(friendId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi mời");
    } finally { setInviteLoading(null); }
  };

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    trackEvent('invite_code_copied', { journey_id: journeyId, source: 'modal' });
    toast.success("Đã sao chép mã mời!");
  };

  if (!isOpen) return null;

  const filteredFriends = friends.filter(friend => {
    const search = searchTerm.toLowerCase();
    return (friend.fullname?.toLowerCase() || '').includes(search) || (friend.handle?.toLowerCase() || '').includes(search);
  });

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full md:w-[480px] h-[90vh] md:h-auto bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] flex flex-col md:max-h-[85vh] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl animate-in slide-in-from-bottom-1/2 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0 bg-white dark:bg-[#121212]">
            <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
        </div>

        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[#F4EBE1] dark:border-[#2B2A29] shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-[1.4rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">Thêm bạn đồng hành</h2>
            </div>
            <button onClick={onClose} className="p-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95">
                <X size={20} strokeWidth={2.5} />
            </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-[#F4EBE1]/30 to-white dark:from-[#1A1A1A]/30 dark:to-[#0A0A0A]">
            
            {inviteCode && (
                <div className="flex items-center justify-between p-4 bg-[#F4EBE1]/80 dark:bg-[#1A1A1A] rounded-[20px] border border-[#D6CFC7]/50 dark:border-[#3A3734]">
                    <div>
                        <p className="text-[0.75rem] font-extrabold text-[#8A8580] dark:text-[#A09D9A] uppercase tracking-widest mb-1">Mã tham gia</p>
                        <p className="text-[1.3rem] font-black text-[#1A1A1A] dark:text-white tracking-[0.2em]">{inviteCode}</p>
                    </div>
                    <button onClick={handleCopyCode} className="w-12 h-12 bg-white dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center text-[#1A1A1A] dark:text-white shadow-sm hover:scale-105 active:scale-95 transition-all">
                        <Copy size={20} strokeWidth={2.5} />
                    </button>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09D9A]" strokeWidth={2.5} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm tên hoặc handle..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-[56px] bg-white dark:bg-[#1A1A1A] border border-[#D6CFC7] dark:border-[#3A3734] rounded-[20px] pl-12 pr-5 text-[1rem] font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] focus:border-[#1A1A1A] dark:focus:border-white outline-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all"
                />
            </div>

            <div className="space-y-3 pb-8">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#8A8580]" /></div>
                ) : filteredFriends.length === 0 ? (
                    <div className="text-center py-10 text-[#8A8580] font-semibold text-[1.05rem]">
                        {searchTerm ? "Không tìm thấy ai." : "Danh sách mời hiện đang trống!"}
                    </div>
                ) : (
                    filteredFriends.map(friend => {
                        const isInvited = invitedIds.has(friend.id);
                        return (
                            <div key={friend.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1A1A1A] rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-transparent hover:border-[#D6CFC7]/50 dark:hover:border-[#3A3734] transition-all">
                                <div className="flex items-center gap-4">
                                    <img src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullname)}&background=random`} className="w-12 h-12 rounded-[16px] object-cover bg-[#E2D9CE]" alt="avatar"/>
                                    <div>
                                        <p className="font-black text-[#1A1A1A] dark:text-white text-[1.05rem] leading-tight">{friend.fullname}</p>
                                        <p className="text-[0.8rem] font-bold text-[#8A8580] dark:text-[#A09D9A]">@{friend.handle}</p>
                                    </div>
                                </div>
                                {isInvited ? (
                                    <button disabled className="px-4 py-2 bg-[#E6F4EA] dark:bg-[#1C3325] text-[#2E7D32] dark:text-[#81C784] text-[0.8rem] font-extrabold uppercase tracking-widest rounded-[12px] flex items-center gap-1.5 border border-[#A5D6A7] dark:border-[#2E7D32]/50">
                                        <Check size={16} strokeWidth={3} /> Đã mời
                                    </button>
                                ) : (
                                    <button onClick={() => handleInvite(friend.id)} disabled={!!inviteLoading} className="w-[44px] h-[44px] flex items-center justify-center bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:scale-105 active:scale-95 transition-all rounded-[14px] shadow-md">
                                        {inviteLoading === friend.id ? <Loader2 size={18} className="animate-spin"/> : <UserPlus size={18} strokeWidth={2.5} className="ml-1" />}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};