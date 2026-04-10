import React, { useState, useEffect, useMemo } from 'react';
import { X, Shield, Trash2, Loader2, Search, Check, Crown } from 'lucide-react';
import { boxService } from '../services/box.service';
import { BoxMemberResponse } from '../types';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { toast } from 'react-hot-toast';
import { friendService } from '@/modules/user/services/friend.service'; 
import { createPortal } from 'react-dom';

interface BoxMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    boxId: string;
    ownerId: string;
    onMemberChange: () => void; 
}

export const BoxMembersModal: React.FC<BoxMembersModalProps> = ({ 
    isOpen, onClose, boxId, ownerId, onMemberChange 
}) => {
    const { user } = useAuth();
    const isOwner = user?.id === ownerId;

    const [members, setMembers] = useState<BoxMemberResponse[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set()); 

    useEffect(() => {
        if (isOpen && boxId) {
            fetchData();
        }
    }, [isOpen, boxId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [membersData, friendsResponse] = await Promise.all([
                boxService.getBoxMembers(boxId, 0, 50),
                friendService.getMyFriends()
            ]);
            setMembers(membersData.content || []);
            const extractedFriends = (friendsResponse || []).map(item => item.friend);
            setFriends(extractedFriends);
        } catch (error) {
            console.error("Lỗi tải dữ liệu", error);
        } finally {
            setIsLoading(false);
        }
    };

    const invitableFriends = useMemo(() => {
        return friends.filter(friend => !members.some(m => m.userId === friend.id));
    }, [friends, members]);

    const filteredFriends = useMemo(() => {
        if (!searchQuery.trim()) return invitableFriends;
        return invitableFriends.filter(f => 
            f.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (f.handle && f.handle.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [invitableFriends, searchQuery]);

    const handleInvite = async (friendId: string) => {
        try {
            setInvitedIds(prev => new Set(prev).add(friendId));
            await boxService.inviteMember(boxId, friendId); 
            toast.success("Đã gửi lời mời!");
        } catch (err: any) {
            setInvitedIds(prev => {
                const next = new Set(prev);
                next.delete(friendId);
                return next;
            });
            toast.error(err?.response?.data?.message || "Lỗi khi gửi lời mời.");
        }
    };

    const handleRemoveMember = async (userIdToRemove: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi Box không?")) return;
        try {
            await boxService.removeMember(boxId, userIdToRemove);
            await fetchData();
            onMemberChange();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lỗi khi xóa thành viên.");
        }
    };

    const handleTransferOwnership = async (newOwnerId: string, newOwnerName: string) => {
        if (!window.confirm(`Chuyển quyền chủ Box cho ${newOwnerName}? Bạn sẽ trở thành thành viên bình thường.`)) return;
        
        try {
            await boxService.transferOwnership(boxId, newOwnerId);
            toast.success(`Đã chuyển quyền cho ${newOwnerName}`);
            onClose(); 
            onMemberChange(); 
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lỗi khi chuyển quyền.");
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6">
            
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            <div className="relative w-full md:w-[500px] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col h-[85vh] md:h-[650px] md:max-h-[85vh] animate-in slide-in-from-bottom-1/2 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
                
                <div className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0">
                    <div className="w-12 h-1.5 bg-zinc-300 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 md:py-6 shrink-0">
                    <h2 className="text-[1.4rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">Quản lý thành viên</h2>
                    <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {isOwner && (
                    <div className="px-6 pb-4 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-5 top-[18px] text-[#A09D9A]" size={18} strokeWidth={2.5} />
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm bạn bè..."
                                className="w-full pl-12 pr-5 py-4 bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border-2 border-transparent focus:border-[#D6CFC7] dark:focus:border-[#4A4D55] rounded-[24px] text-[0.95rem] font-bold outline-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)]" 
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#A09D9A]" /></div>
                    ) : (
                        <div className="space-y-6">
                            
                            {/* KHỐI GỢI Ý MỜI */}
                            {isOwner && filteredFriends.length > 0 && (
                                <div>
                                    <label className="text-[0.8rem] font-extrabold text-[#8A8580] uppercase tracking-wider mb-3 block ml-2">
                                        {searchQuery ? 'Kết quả tìm kiếm' : 'Gợi ý kết bạn'}
                                    </label>
                                    <div className="space-y-2">
                                        {filteredFriends.map((friend) => {
                                            const isInvited = invitedIds.has(friend.id);
                                            return (
                                                <div key={friend.id} className="flex items-center justify-between p-3 rounded-[20px] hover:bg-[#F4EBE1] dark:hover:bg-[#1A1A1A] transition-colors border border-transparent dark:border-[#2B2A29]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-[14px] bg-[#E2D9CE] dark:bg-[#3A3734] shrink-0 overflow-hidden flex items-center justify-center">
                                                            {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[1rem] font-black text-[#1A1A1A] dark:text-white">{friend.fullname?.charAt(0).toUpperCase()}</span>}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.95rem] font-extrabold text-[#1A1A1A] dark:text-white">{friend.fullname}</span>
                                                            <span className="text-[0.8rem] font-bold text-[#8A8580]">@{friend.handle}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleInvite(friend.id)} 
                                                        disabled={isInvited} 
                                                        className={`px-4 py-2 rounded-[16px] text-[0.85rem] font-extrabold transition-all flex items-center gap-1.5 active:scale-95 ${isInvited ? 'bg-zinc-200 dark:bg-zinc-800 text-[#8A8580]' : 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.1)]'}`}
                                                    >
                                                        {isInvited ? <><Check size={14} strokeWidth={3} /> Đã gửi</> : 'Mời'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {isOwner && filteredFriends.length > 0 && <div className="h-px bg-[#D6CFC7]/50 dark:bg-white/5 mx-2" />}

                            {/* KHỐI THÀNH VIÊN HIỆN TẠI */}
                            <div>
                                <label className="text-[0.8rem] font-extrabold text-[#8A8580] uppercase tracking-wider mb-3 block ml-2">
                                    Thành viên Box ({members.length})
                                </label>
                                <div className="space-y-2">
                                    {members.map((member) => (
                                        <div key={member.userId} className="flex items-center justify-between p-3 rounded-[20px] hover:bg-[#F4EBE1] dark:hover:bg-[#1A1A1A] transition-colors group border border-transparent dark:border-[#2B2A29]">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-11 h-11 rounded-[14px] bg-[#E2D9CE] dark:bg-[#3A3734] shrink-0 overflow-hidden flex items-center justify-center">
                                                    {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[1rem] font-black text-[#1A1A1A] dark:text-white">{member.fullname?.charAt(0).toUpperCase()}</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[0.95rem] font-extrabold text-[#1A1A1A] dark:text-white truncate">{member.fullname}</span>
                                                        {member.role === 'ADMIN' && <Shield size={14} className="text-amber-500 shrink-0" />}
                                                    </div>
                                                    <span className="text-[0.8rem] font-bold text-[#8A8580]">{member.userId === user?.id ? 'Bạn' : 'Đã tham gia'}</span>
                                                </div>
                                            </div>

                                            {/* ACTIONS */}
                                            <div className="flex items-center gap-1">
                                                {isOwner && member.userId !== user?.id && (
                                                    <button 
                                                        onClick={() => handleTransferOwnership(member.userId, member.fullname)}
                                                        className="p-2.5 text-[#A09D9A] hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-[14px] transition-colors md:opacity-0 md:group-hover:opacity-100"
                                                        title="Chuyển quyền chủ Box"
                                                    >
                                                        <Crown size={18} strokeWidth={2.5} />
                                                    </button>
                                                )}

                                                {isOwner && member.userId !== user?.id && (
                                                    <button 
                                                        onClick={() => handleRemoveMember(member.userId)}
                                                        className="p-2.5 text-[#A09D9A] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[14px] transition-colors md:opacity-0 md:group-hover:opacity-100"
                                                        title="Xóa khỏi Box"
                                                    >
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};