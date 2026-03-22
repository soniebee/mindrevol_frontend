import React, { useState, useEffect, useMemo } from 'react';
// [THÊM] Import icon Crown
import { X, Shield, Trash2, Loader2, Search, Check, Crown } from 'lucide-react';
import { boxService } from '../services/box.service';
import { BoxMemberResponse } from '../types';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { toast } from 'react-hot-toast';
import { friendService } from '@/modules/user/services/friend.service'; 

interface BoxMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    boxId: string;
    ownerId: string;
    onMemberChange: () => void; // Trigger reload lại box data
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
            toast.success("Đã gửi lời mời tham gia Không gian!");
        } catch (err: any) {
            setInvitedIds(prev => {
                const next = new Set(prev);
                next.delete(friendId);
                return next;
            });
            toast.error(err?.response?.data?.message || "Không thể gửi lời mời.");
        }
    };

    const handleRemoveMember = async (userIdToRemove: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người này khỏi Không gian?")) return;
        try {
            await boxService.removeMember(boxId, userIdToRemove);
            await fetchData();
            onMemberChange();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lỗi khi xóa thành viên.");
        }
    };

    // [THÊM MỚI] Hàm chuyển quyền sở hữu
    const handleTransferOwnership = async (newOwnerId: string, newOwnerName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn chuyển quyền Chủ phòng cho ${newOwnerName}? Bạn sẽ trở thành thành viên thường.`)) return;
        
        try {
            await boxService.transferOwnership(boxId, newOwnerId);
            toast.success(`Đã chuyển quyền cho ${newOwnerName}`);
            onClose(); // Đóng modal
            onMemberChange(); // Reload trang cha để cập nhật giao diện
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lỗi khi chuyển quyền.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <style>{`
                .member-scroll::-webkit-scrollbar { width: 3px; }
                .member-scroll::-webkit-scrollbar-track { background: transparent; }
                .member-scroll::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
            `}</style>

            <div className="bg-[#18181b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[600px] max-h-[85vh] overflow-hidden">
                <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-white">Quản lý thành viên</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                {isOwner && (
                    <div className="p-4 border-b border-white/5 bg-[#121212] shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3 text-zinc-500" size={18} />
                            <input 
                                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm bạn bè để mời..."
                                className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto member-scroll p-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-zinc-500" /></div>
                    ) : (
                        <div className="p-2 space-y-6">
                            
                            {/* KHỐI GỢI Ý MỜI (Giữ nguyên code cũ) */}
                            {isOwner && filteredFriends.length > 0 && (
                                <div>
                                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 block px-2">{searchQuery ? 'Kết quả tìm kiếm' : 'Gợi ý bạn bè'}</label>
                                    <div className="space-y-1">
                                        {filteredFriends.map((friend) => {
                                            const isInvited = invitedIds.has(friend.id);
                                            return (
                                                <div key={friend.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0">
                                                            {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">{friend.fullname?.charAt(0).toUpperCase()}</div>}
                                                        </div>
                                                        <div className="flex flex-col"><span className="text-sm font-bold text-white">{friend.fullname}</span><span className="text-[11px] text-zinc-500">@{friend.handle}</span></div>
                                                    </div>
                                                    <button onClick={() => handleInvite(friend.id)} disabled={isInvited} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${isInvited ? 'bg-zinc-800 text-zinc-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                                                        {isInvited ? <><Check size={14} /> Đã gửi</> : 'Mời'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {isOwner && filteredFriends.length > 0 && <div className="h-px bg-white/5 mx-2" />}

                            {/* KHỐI THÀNH VIÊN HIỆN TẠI (Đã thêm nút Transfer Ownership) */}
                            <div>
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 block px-2">Thành viên trong Không gian ({members.length})</label>
                                <div className="space-y-1">
                                    {members.map((member) => (
                                        <div key={member.userId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 border border-white/10">
                                                    {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-sm">{member.fullname?.charAt(0).toUpperCase()}</div>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-bold text-white truncate">{member.fullname}</span>
                                                        {member.role === 'ADMIN' && <Shield size={12} className="text-yellow-500 shrink-0" />}
                                                    </div>
                                                    <span className="text-[11px] text-zinc-500">{member.userId === user?.id ? 'Là bạn' : 'Đã tham gia'}</span>
                                                </div>
                                            </div>

                                            {/* ACTIONS */}
                                            <div className="flex items-center gap-1">
                                                {/* Nút Chuyển quyền (Chỉ Owner thấy, và ko hiện trên chính mình) */}
                                                {isOwner && member.userId !== user?.id && (
                                                    <button 
                                                        onClick={() => handleTransferOwnership(member.userId, member.fullname)}
                                                        className="p-2 text-zinc-600 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Chuyển quyền chủ phòng"
                                                    >
                                                        <Crown size={16} />
                                                    </button>
                                                )}

                                                {/* Nút Kick (Chỉ Owner thấy) */}
                                                {isOwner && member.userId !== user?.id && (
                                                    <button 
                                                        onClick={() => handleRemoveMember(member.userId)}
                                                        className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Xóa khỏi Không gian"
                                                    >
                                                        <Trash2 size={16} />
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
        </div>
    );
};