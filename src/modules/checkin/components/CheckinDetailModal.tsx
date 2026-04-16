import React, { useState, useEffect } from 'react';
import { X, Package, FolderInput, Loader2 } from 'lucide-react';
import { Checkin, CheckinStatus } from '../types';
import { Emotion, InteractionType, PostProps } from '@/modules/feed/types';
// GỌI COMPONENT MỚI
import { DetailPostCard } from '@/modules/feed/components/DetailPostCard';
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
  const [isLoadingJourneys, setIsLoadingJourneys] = useState(false);
  
  const [headerTarget, setHeaderTarget] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleOpenMoveMenu = async () => {
      if (!showMoveMenu && activeJourneys.length === 0) {
          setIsLoadingJourneys(true);
          try {
              const journeys = await journeyService.getUserActiveJourneys('me');
              setActiveJourneys(journeys);
          } catch (error) {
              toast.error("Không thể lấy danh sách hành trình");
          } finally {
              setIsLoadingJourneys(false);
          }
      }
      setShowMoveMenu(!showMoveMenu);
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

  const postData: any = {
    type: 'POST', 
    id: checkin.id || 'temp-id',
    userId: String(userInfo.id),
    user: {
      id: String(userInfo.id), 
      name: userInfo.name,
      avatar: userInfo.avatar
    },
    journeyId: checkin.journeyId || '', 
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-6 font-quicksand animate-in fade-in duration-200">
      
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[10000] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
      >
        <X className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <div className="absolute inset-0 z-0" onClick={onClose} />

      <div className="w-full max-w-[500px] flex flex-col items-center justify-center relative z-10 pointer-events-none">
          
          {!checkin.journeyId && (
              <div className="relative w-full mb-4 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 z-[100]">
                  <button 
                      onClick={handleOpenMoveMenu}
                      className="w-full py-3.5 px-5 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 font-bold rounded-[24px] transition-all flex items-center justify-center gap-2 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] active:scale-[0.98]"
                  >
                      <FolderInput size={20} /> 
                      <span>Chuyển vào hành trình</span>
                  </button>

                  {showMoveMenu && (
                      <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-2xl overflow-hidden max-h-[300px] flex flex-col z-[100] origin-top animate-in zoom-in-95 duration-200">
                          <div className="px-5 py-3.5 text-[0.75rem] font-extrabold text-white/50 border-b border-white/5 uppercase tracking-widest bg-black/20 shrink-0">
                              Chọn nơi đến
                          </div>
                          <div className="overflow-y-auto custom-scrollbar flex-1">
                              {isLoadingJourneys ? (
                                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
                              ) : activeJourneys.length > 0 ? (
                                  activeJourneys.map(j => (
                                      <button 
                                          key={j.id} 
                                          disabled={isMoving}
                                          onClick={() => handleMoveToJourney(j.id)} 
                                          className="w-full text-left px-5 py-4 hover:bg-white/10 transition-colors flex items-center gap-3.5 border-b border-white/5 last:border-0 disabled:opacity-50 group"
                                      >
                                          <div className="w-10 h-10 rounded-[12px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors shrink-0">
                                              <span className="text-[1.2rem] leading-none">
                                                  {j.avatar && !j.avatar.startsWith('http') ? j.avatar : '🚀'}
                                              </span>
                                          </div>
                                          <span className="text-[0.95rem] font-bold text-white truncate flex-1">{j.name}</span>
                                      </button>
                                  ))
                              ) : (
                                  <div className="px-5 py-8 text-[0.9rem] text-white/50 text-center font-medium flex flex-col items-center gap-2">
                                      <Package size={24} className="opacity-50" />
                                      Bạn chưa tham gia hành trình nào
                                  </div>
                              )}
                          </div>
                      </div>
                  )}
              </div>
          )}

          <div className="w-full pointer-events-auto relative z-10 filter drop-shadow-2xl">
             <div ref={setHeaderTarget} className="w-full absolute -top-[70px] left-0 z-20 pointer-events-none"></div>
             
             <div className="w-full relative">
                 {/* SỬ DỤNG DETAIL POST CARD MỚI */}
                 <DetailPostCard 
                   post={postData} 
                   isActive={true} 
                   headerTarget={headerTarget} 
                 />
             </div>
          </div>

      </div>
    </div>
  );
};