import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { Checkin, CheckinStatus } from '../types';
import { Emotion, InteractionType, PostProps } from '@/modules/feed/types';
import { JourneyPostCard } from '@/modules/feed/components/JourneyPostCard';
import { journeyService } from '@/modules/journey/services/journey.service';
import { checkinService } from '@/modules/checkin/services/checkin.service';
import toast from 'react-hot-toast';

interface Props {
  checkin: Checkin;
  onClose: () => void;
}

export const CheckinDetailModal: React.FC<Props> = ({ checkin, onClose }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [activeJourneys, setActiveJourneys] = useState<any[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  
  // [QUAN TRỌNG] State để gắn Header của PostCard
  const [headerTarget, setHeaderTarget] = useState<HTMLDivElement | null>(null);

  const handleOpenMoveMenu = async () => {
      setShowMoveMenu(!showMoveMenu);
      if (activeJourneys.length === 0) {
          try {
              const journeys = await journeyService.getUserActiveJourneys('me');
              setActiveJourneys(journeys);
          } catch (error) {
              console.error("Lỗi lấy danh sách hành trình:", error);
          }
      }
  };

  const handleMoveToJourney = async (journeyId: string) => {
      try {
          setIsMoving(true);
          await checkinService.updateCheckin(checkin.id, { journeyId: journeyId });
          toast.success('Đã chuyển bài đăng vào Hành trình!');
          setShowMoveMenu(false);
          onClose(); 
          window.location.reload(); 
      } catch (error) {
          toast.error('Có lỗi xảy ra khi chuyển bài');
      } finally {
          setIsMoving(false);
      }
  };

  const mapStatus = (status: string | CheckinStatus): PostProps['status'] => {
    const s = String(status || '').toUpperCase();
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
          id: item.userId || 'unknown',
          name: name,
          avatar: item.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
  };

  const userInfo = getUserInfo(checkin);

  // [SỬA LỖI] Xử lý an toàn mảng thời gian của Spring Boot
  let safeTimestamp = 'Vừa xong';
  try {
      if (checkin.createdAt) {
          const d = Array.isArray(checkin.createdAt) 
            ? new Date(checkin.createdAt[0], checkin.createdAt[1]-1, checkin.createdAt[2], checkin.createdAt[3]||0, checkin.createdAt[4]||0)
            : new Date(checkin.createdAt);
          safeTimestamp = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
  } catch (e) {
      console.warn("Lỗi parse ngày tháng:", e);
  }

  // [BẢO VỆ DỮ LIỆU CỨNG] Đảm bảo không trường nào bị null gây crash
  const postData: any = {
    type: 'POST', 
    id: checkin.id || 'temp-id',
    userId: String(userInfo.id),
    user: {
      id: String(userInfo.id), 
      name: userInfo.name,
      avatar: userInfo.avatar
    },
    journeyId: checkin.journeyId || '', // Không truyền chuỗi lạ, để rỗng an toàn
    image: checkin.imageUrl || checkin.thumbnailUrl || '',
    videoUrl: checkin.videoUrl, 
    caption: checkin.caption || '', 
    status: mapStatus(checkin.status),
    interactionType: InteractionType.GROUP_DISCUSS,
    emotion: mapEmotion(checkin.emotion), 
    activityName: checkin.activityName,        
    locationName: checkin.locationName,        
    timestamp: safeTimestamp,
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

      <div className="w-full max-w-[550px] md:max-w-[600px] flex flex-col items-center justify-center relative z-10 pointer-events-none">
          
          {/* Nút chuyển Hành trình */}
          {!checkin.journeyId && (
              <div className="relative w-full mb-4 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
                  <button 
                      onClick={handleOpenMoveMenu}
                      className="w-full py-3 px-4 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/20 shadow-lg"
                  >
                      <Package size={18} /> Chuyển bài viết này vào Hành trình
                  </button>

                  {showMoveMenu && (
                      <div className="absolute top-full mt-2 left-0 right-0 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar z-50 origin-top animate-in zoom-in-95 duration-200">
                          <div className="px-4 py-3 text-xs font-bold text-zinc-400 border-b border-white/5 uppercase tracking-wider bg-black/20">
                              Chọn hành trình đích
                          </div>
                          {activeJourneys.map(j => (
                              <button 
                                  key={j.id} 
                                  disabled={isMoving}
                                  onClick={() => handleMoveToJourney(j.id)} 
                                  className="w-full text-left px-4 py-3.5 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 disabled:opacity-50"
                              >
                                  <span className="text-lg leading-none">{j.avatar || '🚀'}</span>
                                  <span className="text-sm font-bold text-white truncate">{j.name}</span>
                              </button>
                          ))}
                          {activeJourneys.length === 0 && (
                              <div className="px-4 py-6 text-sm text-zinc-500 text-center font-medium">
                                  Bạn chưa tham gia hành trình nào
                              </div>
                          )}
                      </div>
                  )}
              </div>
          )}

          {/* Vị trí render Header Content */}
          <div ref={setHeaderTarget} className="w-full pointer-events-auto z-20"></div>

          {/* Post Card */}
          <div className="pointer-events-auto w-full relative z-10">
             <JourneyPostCard 
               post={postData} 
               isActive={true} 
               headerTarget={headerTarget} 
             />
          </div>
      </div>
    </div>
  );
};