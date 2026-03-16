import React from 'react';
import { Users, UserPlus, MessageCircle, UserCheck } from 'lucide-react';
import { UserProfile } from '../../services/user.service';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface Props {
  userProfile: UserProfile;
  isMe: boolean;
  onFriendRequest: () => void;
  onShowFriends: () => void;
  publicCount: number;
  privateCount: number;
}

export const ProfileHeaderBlock: React.FC<Props> = ({ 
  userProfile, isMe, onFriendRequest, onShowFriends, publicCount, privateCount 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
      <div className="flex-shrink-0">
        <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 ring-2 ring-black/5 dark:ring-white/10 shadow-2xl relative bg-secondary">
          <img 
            src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile.fullname}&background=random`} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      <div className="flex-1 text-center md:text-left pt-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{userProfile.fullname}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-muted-foreground bg-secondary px-3 py-1 rounded-full text-sm font-medium border border-border">@{userProfile.handle}</span>
            {(isMe || userProfile.friendshipStatus === 'ACCEPTED') && (
              <button onClick={onShowFriends} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors border border-transparent hover:border-border" title="Danh sách bạn bè">
                <Users className="w-5 h-5"/>
              </button>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mb-5 leading-relaxed">
          {userProfile.bio || "Chưa có giới thiệu."}
        </p>

        {!isMe && (
          <div className="flex gap-3 justify-center md:justify-start mb-6">
            {userProfile.friendshipStatus === 'NONE' && (
              <Button onClick={onFriendRequest} className="bg-primary hover:bg-primary/90 text-primary-foreground border-none">
                <UserPlus className="w-4 h-4 mr-2" /> Kết bạn
              </Button>
            )}
            {userProfile.friendshipStatus === 'PENDING' && (
              <Button variant="outline" disabled className="text-muted-foreground border-border">
                Đã gửi lời mời
              </Button>
            )}
            {userProfile.friendshipStatus === 'ACCEPTED' && (
              <Button variant="outline" className="text-green-600 dark:text-green-500 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10">
                <UserCheck className="w-4 h-4 mr-2" /> Bạn bè
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate(`/chat/${userProfile.id}`)}>
              <MessageCircle className="w-4 h-4 mr-2" /> Nhắn tin
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center md:justify-start gap-6 md:gap-10 border-t border-border pt-4">
          <div className="text-center md:text-left">
            <div className="text-xl md:text-2xl font-bold text-foreground">{publicCount}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Công khai</div>
          </div>
          
          {/* Chỉ hiển thị tab Riêng tư nếu là trang của chính mình */}
          {isMe && (
             <div className="text-center md:text-left">
               <div className="text-xl md:text-2xl font-bold text-foreground">{privateCount}</div>
               <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Riêng tư</div>
             </div>
          )}

          <div className="text-center md:text-left">
            <div className="text-xl md:text-2xl font-bold text-foreground">{userProfile.friendCount || 0}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bạn bè</div>
          </div>
        </div>
      </div>
    </div>
  );
};