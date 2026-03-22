import React, { useMemo } from 'react';
import { useJourneyInvitations } from '../hooks/useJourneyInvitations';
import { Loader2, Check, X } from 'lucide-react';
import { JourneyStatus } from '../types';

interface Props {
  onSuccess?: () => void;
}

export const InvitationList: React.FC<Props> = ({ onSuccess }) => {
  const { invitations, isLoading, processingId, handleAccept, handleReject } = useJourneyInvitations(onSuccess);

  // [LOGIC MỚI] Lọc bỏ lời mời không hợp lệ
  const validInvitations = useMemo(() => {
    return invitations.filter(inv => {
        // 1. Loại bỏ nếu trạng thái lời mời là EXPIRED
        if (inv.status === 'EXPIRED') return false;

        // 2. Loại bỏ nếu hành trình đã kết thúc (dựa trên journeyStatus)
        if (inv.journeyStatus) {
            const endedStatuses = [
                JourneyStatus.COMPLETED,
                JourneyStatus.ARCHIVED,
                JourneyStatus.DROPPED
            ] as string[];
            
            // Nếu status nằm trong danh sách kết thúc -> Ẩn
            if (endedStatuses.includes(inv.journeyStatus)) {
                return false;
            }
        }
        return true;
    });
  }, [invitations]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  // Dùng danh sách đã lọc để kiểm tra độ dài
  if (validInvitations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-zinc-500 text-sm">Không có lời mời nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Render danh sách validInvitations */}
      {validInvitations.map((invitation) => (
        <div key={invitation.id} className="bg-zinc-900 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
          <div className="flex items-center gap-3">
            {/* Avatar người mời */}
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                {invitation.inviterAvatar ? (
                    <img src={invitation.inviterAvatar} alt={invitation.inviterName} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs font-bold text-zinc-500">{invitation.inviterName.charAt(0)}</span>
                )}
            </div>
            
            <div>
              <p className="text-sm text-white">
                <span className="font-bold">{invitation.inviterName}</span> mời bạn vào
              </p>
              <p className="text-blue-400 font-bold text-sm mt-0.5">{invitation.journeyName}</p>
              <p className="text-[10px] text-zinc-500 mt-1">{invitation.sentAt}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleReject(invitation.id)}
              disabled={!!processingId}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              title="Từ chối"
            >
              {processingId === invitation.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => handleAccept(invitation.id)}
              disabled={!!processingId}
              className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
              title="Chấp nhận"
            >
              {processingId === invitation.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};