import React, { useEffect, useState } from 'react';
import { Shield, Loader2, UserMinus } from 'lucide-react';
import { journeyService } from '../services/journey.service';
import { JourneyParticipantResponse, JourneyRole } from '../types';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { toast } from 'react-hot-toast';

interface Props {
  journeyId: string;
  currentUserRole?: JourneyRole;
  refreshTrigger?: number; 
}

export const MemberList: React.FC<Props> = ({ journeyId, currentUserRole, refreshTrigger }) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<JourneyParticipantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kickingId, setKickingId] = useState<string | null>(null);

  useEffect(() => {
    if (journeyId) fetchMembers();
  }, [journeyId, refreshTrigger]);

  const fetchMembers = async () => {
    try {
      const data = await journeyService.getParticipants(journeyId);
      
      // ĐÃ FIX: Lọc trùng lặp user (Vì 1 người có thể vừa là BoxMember, vừa là Guest)
      // Ưu tiên giữ lại Role cao hơn (OWNER > ADMIN > MEMBER > GUEST)
      const uniqueMembersMap = new Map<string, JourneyParticipantResponse>();
      
      data.forEach(p => {
          if (!p.user) return;
          const existing = uniqueMembersMap.get(p.user.id);
          if (!existing) {
              uniqueMembersMap.set(p.user.id, p);
          } else {
              // Nếu người này đã có trong Map, ưu tiên đè lên nếu quyền cao hơn
              if (p.role === JourneyRole.OWNER || p.role === JourneyRole.ADMIN) {
                  uniqueMembersMap.set(p.user.id, p);
              }
          }
      });

      setMembers(Array.from(uniqueMembersMap.values()));
    } catch (error) {
      console.error("Failed to load members", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKick = async (targetUserId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc muốn mời ${memberName} ra khỏi nhóm không?`)) return;
    setKickingId(targetUserId);
    try {
      await journeyService.kickMember(journeyId, targetUserId);
      toast.success(`Đã mời ${memberName} ra khỏi nhóm`);
      setMembers(prev => prev.filter(m => m.user.id !== targetUserId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi không thể kick thành viên này");
    } finally {
      setKickingId(null);
    }
  };

  const canKick = (targetMember: JourneyParticipantResponse) => {
    if (!targetMember.user) return false;
    if (String(targetMember.user.id) === String(currentUser?.id)) return false; 
    if (currentUserRole === JourneyRole.OWNER) return true;
    return false;
  };

  if (isLoading) return <div className="text-center py-6"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8A8580]"/></div>;

  return (
    <div className="space-y-4 pt-6 border-t border-[#F4EBE1] dark:border-[#2B2A29]">
      <h3 className="text-[0.75rem] font-extrabold text-[#8A8580] dark:text-[#A09D9A] uppercase tracking-widest flex justify-between pl-1">
        Thành viên <span className="bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] px-2 py-0.5 rounded-[8px] text-[0.7rem] shadow-sm">{members.length}</span>
      </h3>
      
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
        {members.map(participant => {
          const user = participant.user;
          if (!user) return null;
          const avatarSrc = user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=random&color=fff`;

          return (
            <div key={participant.id} className="flex items-center justify-between p-3.5 bg-white dark:bg-[#1A1A1A] rounded-[20px] shadow-sm border border-white/50 dark:border-white/5 group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                    <img 
                      src={avatarSrc} 
                      alt={user.fullname} 
                      className="w-12 h-12 rounded-[16px] bg-[#E2D9CE] object-cover border border-[#F4EBE1] dark:border-[#2B2A29] shadow-sm" 
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}`; }}
                    />
                    {participant.role === JourneyRole.OWNER && (
                        <div className="absolute -bottom-1.5 -right-1.5 bg-[#1A1A1A] dark:bg-white rounded-full p-1 border-[2px] border-white dark:border-[#1A1A1A] shadow-sm">
                            <Shield className="w-3 h-3 text-yellow-400" fill="currentColor"/>
                        </div>
                    )}
                </div>
                <div>
                  <p className="text-[1.05rem] font-black text-[#1A1A1A] dark:text-white leading-tight mb-0.5">
                    {user.fullname}
                  </p>
                  <p className="text-[0.8rem] font-bold text-[#8A8580] dark:text-[#A09D9A]">@{user.handle}</p>
                </div>
              </div>
              
              {canKick(participant) && (
                <button 
                  onClick={() => handleKick(user.id, user.fullname)}
                  disabled={!!kickingId}
                  className="w-10 h-10 flex items-center justify-center text-[#8A8580] dark:text-[#A09D9A] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[14px] transition-all active:scale-95 border border-transparent hover:border-red-100 dark:hover:border-red-500/20" 
                  title="Mời ra khỏi nhóm"
                >
                  {kickingId === user.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <UserMinus className="w-5 h-5" strokeWidth={2.5}/>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};