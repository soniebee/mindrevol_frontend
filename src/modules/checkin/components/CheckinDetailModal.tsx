import React from 'react';
import { X } from 'lucide-react';
import { Checkin, CheckinStatus } from '../types';
import { Emotion, InteractionType, PostProps } from '@/modules/feed/types';
import { JourneyPostCard } from '@/modules/feed/components/JourneyPostCard';

interface Props {
  checkin: Checkin;
  onClose: () => void;
}

export const CheckinDetailModal: React.FC<Props> = ({ checkin, onClose }) => {
  
  const mapStatus = (status: string | CheckinStatus): PostProps['status'] => {
    const s = String(status).toUpperCase();
    if (s === 'COMEBACK' || s === CheckinStatus.COMEBACK) return 'comeback';
    if (s === 'FAILED' || s === CheckinStatus.FAILED) return 'failed';
    if (s === 'REST' || s === CheckinStatus.REST) return 'rest';
    return 'completed'; 
  };

  const mapEmotion = (emo?: string): Emotion => {
    if (!emo) return Emotion.NORMAL;
    const key = Object.keys(Emotion).find(k => k === emo.toUpperCase());
    return key ? (Emotion as any)[key] : Emotion.NORMAL;
  }

  const getUserInfo = (item: any) => {
      if (item.user) {
          const name = item.user.fullname || item.user.name || "Người dùng";
          return {
              id: item.user.id || item.userId,
              name: name,
              avatar: item.user.avatarUrl || item.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          };
      }
      const name = item.userFullName || "Người dùng";
      return {
          id: item.userId,
          name: name,
          avatar: item.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
  };

  const userInfo = getUserInfo(checkin);

  const postData: PostProps & { videoUrl?: string } = {
    type: 'POST', 
    id: checkin.id,
    userId: String(userInfo.id),
    user: {
      id: String(userInfo.id), 
      name: userInfo.name,
      avatar: userInfo.avatar
    },
    image: checkin.imageUrl || checkin.thumbnailUrl,
    videoUrl: checkin.videoUrl, 
    caption: checkin.caption, 
    status: mapStatus(checkin.status),
    interactionType: InteractionType.GROUP_DISCUSS,
    emotion: mapEmotion(checkin.emotion), 
    activityName: checkin.activityName,        
    locationName: checkin.locationName,        
    taskName: undefined,
    timestamp: new Date(checkin.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    reactionCount: checkin.reactionCount || 0,
    commentCount: checkin.commentCount || 0,
    latestReactions: checkin.latestReactions || [] 
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-[1000] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* [ĐÃ SỬA]: Tăng width (max-w-[550px] md:max-w-[600px]) và loại bỏ aspect-square để bài đăng to và rõ hơn */}
      <div className="w-full max-w-[550px] md:max-w-[600px] flex items-center justify-center relative z-10 pointer-events-none">
          <div className="pointer-events-auto w-full">
             <JourneyPostCard 
                post={postData} 
                isActive={true} 
             />
          </div>
      </div>
    </div>
  );
};