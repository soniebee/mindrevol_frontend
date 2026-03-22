import React, { useEffect, useState } from 'react';
import { Shield, Loader2, UserMinus } from 'lucide-react';
import { journeyService } from '../services/journey.service';
import { JourneyParticipantResponse, JourneyRole } from '../types';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { toast } from 'react-hot-toast';

interface Props {
  journeyId: string;
  currentUserRole?: JourneyRole;
  refreshTrigger?: number; // [NEW]
}

export const MemberList: React.FC<Props> = ({ journeyId, currentUserRole, refreshTrigger }) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<JourneyParticipantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kickingId, setKickingId] = useState<string | null>(null);

  // [NEW] Thêm refreshTrigger vào dependency array
  useEffect(() => {
    if (journeyId) fetchMembers();
  }, [journeyId, refreshTrigger]);

  const fetchMembers = async () => {
    try {
      // setIsLoading(true); // Có thể comment dòng này nếu không muốn hiện loading spinner mỗi lần refresh nhẹ
      const data = await journeyService.getParticipants(journeyId);
      setMembers(data);
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

  if (isLoading) return <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-500"/></div>;

  return (
    <div className="space-y-3 pt-2 border-t border-white/5">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between">
        Thành viên <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px]">{members.length}</span>
      </h3>
      
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {members.map(participant => {
          const user = participant.user;
          if (!user) return null;
          const avatarSrc = user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=random&color=fff`;

          return (
            <div key={participant.id} className="flex items-center justify-between p-2.5 bg-zinc-900/50 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
              <div className="flex items-center gap-3">
                <img 
                  src={avatarSrc} 
                  alt={user.fullname} 
                  className="w-9 h-9 rounded-full bg-zinc-800 object-cover border border-white/5" 
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}`; }}
                />
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-1.5">
                    {user.fullname}
                    {participant.role === JourneyRole.OWNER && <Shield className="w-3 h-3 text-yellow-500" fill="currentColor"/>}
                  </p>
                  <p className="text-xs text-zinc-500">@{user.handle}</p>
                </div>
              </div>
              
              {canKick(participant) && (
                <button 
                  onClick={() => handleKick(user.id, user.fullname)}
                  disabled={!!kickingId}
                  className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" 
                  title="Mời ra khỏi nhóm"
                >
                  {kickingId === user.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <UserMinus className="w-4 h-4"/>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};