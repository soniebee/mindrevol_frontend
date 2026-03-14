import React, { useEffect, useState } from 'react';
import { UserX, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { blockService } from '../services/block.service'; // Dùng đúng service này
import { UserSummary } from '../services/user.service';

// [FIX] Component này giờ là View con, không cần props isOpen/onClose
export const BlockedUsersModal = () => {
  const [blockedUsers, setBlockedUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockList();
  }, []);

  const loadBlockList = async () => {
    try {
      setLoading(true);
      const data = await blockService.getBlockList();
      setBlockedUsers(data);
    } catch (error) {
      console.error("Lỗi tải danh sách chặn:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (confirm("Bạn có chắc muốn bỏ chặn người dùng này?")) {
      try {
        await blockService.unblockUser(userId);
        // Refresh list
        setBlockedUsers(prev => prev.filter(user => user.id !== userId));
      } catch (error) {
        alert("Có lỗi xảy ra khi bỏ chặn.");
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-1 custom-scrollbar max-h-[400px]">
        {loading ? (
            <div className="text-center text-zinc-500 py-10 text-sm">Đang tải...</div>
        ) : blockedUsers.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 flex flex-col items-center">
                <UserX className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-sm">Bạn chưa chặn ai cả.</span>
            </div>
        ) : (
            <div className="space-y-3">
                {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                            <img 
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullname}`} 
                                className="w-10 h-10 rounded-full object-cover border border-zinc-700" 
                                alt="Avt"
                            />
                            <div>
                                <h4 className="text-sm font-bold text-white">{user.fullname}</h4>
                                <p className="text-xs text-zinc-500">@{user.handle}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUnblock(user.id)}
                            className="h-8 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        >
                            <Unlock className="w-3 h-3 mr-1"/> Bỏ chặn
                        </Button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};