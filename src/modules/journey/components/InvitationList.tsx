import React, { useMemo } from 'react';
import { useJourneyInvitations } from '../hooks/useJourneyInvitations';
import { Loader2, Check, X } from 'lucide-react';
import { JourneyStatus } from '../types';

interface Props {
  onSuccess?: () => void;
}

export const InvitationList: React.FC<Props> = ({ onSuccess }) => {
  const { invitations, isLoading, processingId, handleAccept, handleReject } = useJourneyInvitations(onSuccess);

  const validInvitations = useMemo(() => {
    return invitations.filter(inv => {
        if (inv.status === 'EXPIRED') return false;
        if (inv.journeyStatus) {
            const endedStatuses = [JourneyStatus.COMPLETED, JourneyStatus.ARCHIVED, JourneyStatus.DROPPED] as string[];
            if (endedStatuses.includes(inv.journeyStatus)) return false;
        }
        return true;
    });
  }, [invitations]);

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#8A8580]" /></div>;
  }

  if (validInvitations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8A8580] dark:text-[#A09D9A] font-bold text-[1.05rem]">Chưa có lời mời nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validInvitations.map((invitation) => (
        <div key={invitation.id} className="bg-white dark:bg-[#1A1A1A] border border-white/50 dark:border-white/5 rounded-[24px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 rounded-[18px] bg-[#F4EBE1] dark:bg-[#2B2A29] flex items-center justify-center overflow-hidden shadow-sm">
                {invitation.inviterAvatar ? (
                    <img src={invitation.inviterAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[1.2rem] font-black text-[#1A1A1A] dark:text-white">{invitation.inviterName.charAt(0)}</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.95rem] text-[#8A8580] dark:text-[#A09D9A] font-semibold truncate">
                <span className="font-black text-[#1A1A1A] dark:text-white">{invitation.inviterName}</span> mời bạn vào
              </p>
              <p className="text-[1.2rem] text-blue-600 dark:text-blue-400 font-black truncate leading-tight mt-0.5">{invitation.journeyName}</p>
              <p className="text-[0.75rem] font-extrabold text-[#A09D9A] uppercase tracking-widest mt-1.5">{invitation.sentAt}</p>
            </div>
          </div>

          <div className="flex gap-2.5 w-full md:w-auto mt-2 md:mt-0">
            <button 
              onClick={() => handleAccept(invitation.id)}
              disabled={!!processingId}
              className="flex-1 md:flex-none h-12 md:w-14 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[16px] flex items-center justify-center transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              {processingId === invitation.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <Check size={22} strokeWidth={3} />}
            </button>
            <button 
              onClick={() => handleReject(invitation.id)}
              disabled={!!processingId}
              className="flex-1 md:flex-none h-12 md:w-14 bg-[#F4EBE1] dark:bg-[#2B2A29] text-[#1A1A1A] dark:text-white hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 rounded-[16px] flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              {processingId === invitation.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <X size={22} strokeWidth={3} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};