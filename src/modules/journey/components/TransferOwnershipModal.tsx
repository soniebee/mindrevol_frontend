import React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, UserCheck, AlertTriangle } from 'lucide-react';
import { useTransferOwnership } from '../hooks/useTransferOwnership';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  currentUserId: string; // [FIX] Đổi sang string
  onSuccess: () => void;
}

export const TransferOwnershipModal: React.FC<Props> = ({ 
  isOpen, onClose, journeyId, currentUserId, onSuccess 
}) => {
  const { members, isLoading, isSubmitting, handleTransfer } = useTransferOwnership(
    journeyId, currentUserId, onSuccess
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 animate-in fade-in zoom-in-95">
      <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl flex flex-col max-h-[80vh]">
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-yellow-500" />
            Chuyển quyền Chủ phòng
          </h3>
          <button onClick={onClose}><X className="text-zinc-400 hover:text-white" /></button>
        </div>

        <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
          <p className="text-sm text-yellow-200 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            Sau khi chuyển, bạn sẽ mất quyền quản trị cao nhất và trở thành thành viên bình thường.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500"/></div>
          ) : members.length === 0 ? (
            <p className="text-center text-zinc-500 py-4">Nhóm chưa có thành viên nào khác để chuyển.</p>
          ) : (
            members.map(member => {
              const user = member.user;
              if (!user) return null;

              return (
                <div key={member.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl border border-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=random&color=fff`} 
                      className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
                      alt={user.fullname}
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{user.fullname}</p>
                      <p className="text-xs text-zinc-500">@{user.handle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTransfer(user.id)} // [FIX] Truyền ID string
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 text-xs rounded-lg transition-colors"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Chọn'}
                  </button>
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