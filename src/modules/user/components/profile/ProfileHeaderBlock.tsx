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
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-10">
      <div className="flex-shrink-0">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 ring-2 ring-black/5 dark:ring-white/10 shadow-2xl relative bg-secondary">
          <img 
            src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile.fullname}&background=random`} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      <div className="flex-1 w-full text-center md:text-left pt-2">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{userProfile.fullname}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-muted-foreground bg-secondary px-4 py-1.5 rounded-full text-sm font-medium border border-border">@{userProfile.handle}</span>
            {(isMe || userProfile.friendshipStatus === 'ACCEPTED') && (
              <button onClick={onShowFriends} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors border border-transparent hover:border-border" title="Danh sách bạn bè">
                <Users className="w-5 h-5"/>
              </button>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-base max-w-2xl mb-6 leading-relaxed px-4 md:px-0">
          {userProfile.bio || "Chưa có giới thiệu."}
        </p>

        {!isMe && (
          <div className="flex flex-row gap-3 w-full sm:w-auto justify-center md:justify-start mb-8 px-4 md:px-0">
            {userProfile.friendshipStatus === 'NONE' && (
              <Button onClick={onFriendRequest} className="flex-1 sm:flex-none h-12 bg-primary hover:bg-primary/90 text-primary-foreground border-none text-base">
                <UserPlus className="w-5 h-5 mr-2" /> Kết bạn
              </Button>
            )}
            {userProfile.friendshipStatus === 'PENDING' && (
              <Button variant="outline" disabled className="flex-1 sm:flex-none h-12 text-muted-foreground border-border text-base">
                Đã gửi lời mời
              </Button>
            )}
            {userProfile.friendshipStatus === 'ACCEPTED' && (
              <Button variant="outline" className="flex-1 sm:flex-none h-12 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 text-base">
                <UserCheck className="w-5 h-5 mr-2" /> Bạn bè
              </Button>
            )}
            <Button variant="secondary" className="flex-1 sm:flex-none h-12 text-base" onClick={() => navigate(`/chat/${userProfile.id}`)}>
              <MessageCircle className="w-5 h-5 mr-2" /> Nhắn tin
            </Button>
          </div>
        )}

        {/* CHỈ HIỂN THỊ KHỐI THỐNG KÊ KHI LÀ TRANG CỦA CHÍNH MÌNH */}
        {isMe && (
          <div className="flex items-center justify-center md:justify-start gap-8 md:gap-12 border-t border-border pt-6">
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{publicCount}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wide">Công khai</div>
            </div>
            
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{privateCount}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wide">Riêng tư</div>
            </div>

            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{userProfile.friendCount || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wide">Bạn bè</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};