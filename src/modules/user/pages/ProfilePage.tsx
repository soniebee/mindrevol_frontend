import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { Bookmark, Lock, Users, BookOpen, Archive, Sparkles, Package } from 'lucide-react'; 
import { Checkin } from '@/modules/checkin/types';
import { UserActiveJourneyResponse } from '@/modules/journey/types';

import MainLayout from '@/components/layout/MainLayout';
import { JourneyGalleryCard } from '@/modules/journey/components/JourneyGalleryCard';
import { CheckinDetailModal } from '@/modules/checkin/components/CheckinDetailModal';
import { JourneyAlbumModal } from '@/modules/journey/components/JourneyAlbumModal';
import { FriendsModal } from '@/modules/user/components/FriendsModal';

import { useProfileData } from '../hooks/useProfileData';
import { useProfileContent } from '../hooks/useProfileContent';
import { ProfileHeaderBlock } from '../components/profile/ProfileHeaderBlock';
import { LivePhotoViewer } from '@/components/ui/LivePhotoViewer';
import { cn } from '@/lib/utils';

type TabType = 'PUBLIC' | 'PRIVATE' | 'ARCHIVED' | 'SAVED';

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const { userId: paramUserId } = useParams<{ userId: string }>(); 
  
  const isViewingOther = !!paramUserId && paramUserId !== authUser?.id;
  const currentProfileId = isViewingOther ? paramUserId : authUser?.id;

  const [activeTab, setActiveTab] = useState<TabType>('PUBLIC');
  const { userProfile, isLoading, handleFriendRequest } = useProfileData(currentProfileId, isViewingOther);
  
  const { 
      publicJourneys, 
      privateJourneys, 
      savedCheckins, 
      archivedCheckins, 
      toggleLocalVisibility,
      selectedBoxId,
      setSelectedBoxId,
      availableBoxes 
  } = useProfileContent(currentProfileId, userProfile?.isMe, activeTab);
  
  const [selectedJourneyAlbum, setSelectedJourneyAlbum] = useState<UserActiveJourneyResponse | null>(null);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  
  if (isLoading) return (
      <MainLayout>
          <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A]">
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#1A1A1A] dark:border-white border-t-transparent"></div>
          </div>
      </MainLayout>
  ); 

  if (!userProfile) return <div className="text-center py-20 text-[#8A8580] font-black text-[1.4rem]">Không tìm thấy người dùng</div>;
  
  const isMe = userProfile.isMe;
  const isBlocked = !isMe && (userProfile.isBlockedByThem || userProfile.isBlockedByMe);

  return (
    <>
      <MainLayout>
        <div className="w-full min-h-screen bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A] transition-colors duration-500 relative overflow-hidden font-quicksand">
          
          <div className="px-4 md:px-8 pt-8 md:pt-14 pb-24 w-full max-w-[1024px] mx-auto relative z-10">
            
            <ProfileHeaderBlock 
              userProfile={userProfile}
              isMe={isMe || false}
              onFriendRequest={handleFriendRequest}
              onShowFriends={() => setShowFriendsModal(true)}
              publicCount={publicJourneys.length}
              privateCount={privateJourneys.length}
            />

            {/* THANH TABS NAVIGATION */}
            {isMe && (
              <div className="mb-6 md:mb-8">
                <div className="flex justify-between sm:justify-center px-2 sm:px-0 gap-2 md:gap-12 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D6CFC7]/50 dark:bg-[#2B2A29] rounded-full z-0"></div>

                  {(['PUBLIC', 'PRIVATE', 'ARCHIVED', 'SAVED'] as TabType[]).map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                          "pb-4 text-[0.8rem] md:text-[0.85rem] font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative z-10 flex-1 sm:flex-none",
                          activeTab === tab 
                            ? "text-[#1A1A1A] dark:text-white" 
                            : "text-[#8A8580] dark:text-[#A09D9A] hover:text-[#4A4A4A] dark:hover:text-[#D6CFC7]"
                      )}
                    >
                      {tab === 'PUBLIC' && <Users size={18} strokeWidth={2.5} />}
                      {tab === 'PRIVATE' && <Lock size={18} strokeWidth={2.5} />}
                      {tab === 'ARCHIVED' && <Archive size={18} strokeWidth={2.5} />}
                      {tab === 'SAVED' && <Bookmark size={18} strokeWidth={2.5} />}
                      <span className="hidden sm:inline">
                        {tab === 'PUBLIC' ? 'Công khai' : tab === 'PRIVATE' ? 'Riêng tư' : tab === 'ARCHIVED' ? 'Lưu trữ' : 'Đã lưu'}
                      </span>
                      
                      {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A1A1A] dark:bg-white rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-in zoom-in duration-300"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BỘ LỌC THEO BOX */}
            {!isBlocked && ['PUBLIC', 'PRIVATE'].includes(activeTab) && availableBoxes.length > 0 && (
                <div className="mb-8 md:mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 px-1">
                        <button
                            onClick={() => setSelectedBoxId('ALL')}
                            className={cn(
                                "px-5 py-2.5 rounded-[20px] text-[0.9rem] font-extrabold whitespace-nowrap transition-all active:scale-95 shadow-sm border",
                                selectedBoxId === 'ALL'
                                    ? "bg-[#1A1A1A] border-[#1A1A1A] text-white dark:bg-white dark:border-white dark:text-[#1A1A1A]"
                                    : "bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md text-[#8A8580] dark:text-[#A09D9A] border-white/50 dark:border-white/5 hover:bg-white dark:hover:bg-[#2B2A29]"
                            )}
                        >
                            Tất cả hành trình
                        </button>
                        
                        {availableBoxes.map(box => (
                            <button
                                key={box.id}
                                onClick={() => setSelectedBoxId(box.id)}
                                className={cn(
                                    "px-5 py-2.5 rounded-[20px] text-[0.9rem] font-extrabold whitespace-nowrap transition-all active:scale-95 shadow-sm border flex items-center gap-2.5",
                                    selectedBoxId === box.id
                                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white dark:bg-white dark:border-white dark:text-[#1A1A1A]"
                                        : "bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md text-[#8A8580] dark:text-[#A09D9A] border-white/50 dark:border-white/5 hover:bg-white dark:hover:bg-[#2B2A29]"
                                )}
                            >
                                {box.avatar ? (
                                    box.avatar.startsWith('http') || box.avatar.startsWith('/') 
                                      ? <img src={box.avatar} alt="box" className="w-5 h-5 rounded-[6px] object-cover" />
                                      : <span className="text-[1rem] leading-none">{box.avatar}</span>
                                ) : (
                                    <Package size={16} strokeWidth={2.5} />
                                )}
                                {box.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* KHU VỰC NỘI DUNG (CONTENT TABS) */}
            <div className="min-h-[400px]">
              {isBlocked ? (
                <div className="text-center py-24 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[40px] border border-white/50 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] mx-4 md:mx-0 flex flex-col items-center">
                  <div className="w-20 h-20 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                      <Lock className="w-10 h-10 text-[#A09D9A]" strokeWidth={2.5} />
                  </div>
                  <p className="text-[#1A1A1A] dark:text-white font-black text-[1.4rem] tracking-tight">Nội dung không khả dụng</p>
                  <p className="text-[#8A8580] dark:text-[#A09D9A] font-semibold mt-2">Bạn không thể xem hồ sơ này.</p>
                </div>
              ) : (
                <>
                  {activeTab === 'PUBLIC' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {publicJourneys.length > 0 ? (
                        publicJourneys.map(journey => (
                          <JourneyGalleryCard 
                              key={journey.id} 
                              journey={journey} 
                              isMe={isMe} 
                              onJourneyClick={setSelectedJourneyAlbum}
                              onVisibilityToggle={toggleLocalVisibility} 
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-24 bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] flex flex-col items-center">
                          <div className="w-20 h-20 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                              <BookOpen className="w-10 h-10 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                          </div>
                          <p className="text-[#1A1A1A] dark:text-white font-black text-[1.2rem] px-6 tracking-tight mb-2">
                              {isMe ? "Chưa có hành trình công khai" : 
                                (userProfile.friendshipStatus !== 'ACCEPTED' 
                                  ? "Hãy kết bạn để xem không gian của người này." 
                                  : "Chưa có hành trình công khai nào.")}
                          </p>
                          <p className="text-[#8A8580] dark:text-[#A09D9A] font-semibold px-6">
                              {selectedBoxId !== 'ALL' ? 'Không có hành trình nào trong không gian này.' : 'Hành trình công khai sẽ xuất hiện tại đây.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'PRIVATE' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {privateJourneys.length > 0 ? (
                        privateJourneys.map(journey => (
                          <JourneyGalleryCard 
                              key={journey.id} 
                              journey={journey} 
                              isMe={isMe} 
                              onJourneyClick={setSelectedJourneyAlbum}
                              onVisibilityToggle={toggleLocalVisibility} 
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-24 bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] flex flex-col items-center">
                           <div className="w-20 h-20 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                               <Lock className="w-10 h-10 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                           </div>
                           <p className="text-[#1A1A1A] dark:text-white font-black text-[1.2rem] px-6 tracking-tight mb-2">Không gian cá nhân trống</p>
                           <p className="text-[#8A8580] dark:text-[#A09D9A] font-semibold px-6">
                               {selectedBoxId !== 'ALL' ? 'Không có hành trình nào trong không gian này.' : 'Chưa có hành trình riêng tư nào.'}
                           </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'ARCHIVED' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {archivedCheckins.length > 0 ? (
                        archivedCheckins.map(checkin => (
                          <div 
                            key={checkin.id} 
                            className="aspect-square bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] md:rounded-[32px] overflow-hidden group relative border border-white/50 dark:border-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
                          >
                              <div 
                                className="absolute inset-0 z-10 cursor-pointer" 
                                onClick={() => setSelectedCheckin(checkin)} 
                              />
                              
                              {checkin.thumbnailUrl || checkin.imageUrl ? (
                                  <LivePhotoViewer 
                                      imageUrl={checkin.thumbnailUrl || checkin.imageUrl} 
                                      videoUrl={checkin.videoUrl} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                  />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                      <Sparkles className="w-8 h-8 text-[#A09D9A] mb-3 opacity-50" />
                                      <span className="text-[1.05rem] font-bold text-[#1A1A1A] dark:text-white line-clamp-3 leading-snug">
                                          {checkin.caption ? checkin.caption : 'Ghi chú văn bản'}
                                      </span>
                                  </div>
                              )}
                              
                              <div className="absolute top-3 right-3 p-2 bg-black/40 rounded-[12px] backdrop-blur-md pointer-events-none z-20 shadow-sm border border-white/20">
                                  <Archive className="w-4 h-4 text-white" strokeWidth={2.5} />
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-24 bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                                <Archive className="w-10 h-10 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                            </div>
                            <span className="text-[#1A1A1A] dark:text-white font-black text-[1.2rem] px-6 tracking-tight mb-2">Kho lưu trữ trống</span>
                            <span className="text-[#8A8580] dark:text-[#A09D9A] font-semibold px-6">Những khoảnh khắc không thuộc hành trình nào sẽ nằm ở đây.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'SAVED' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {savedCheckins.length > 0 ? (
                        savedCheckins.map(checkin => (
                          <div 
                            key={checkin.id} 
                            className="aspect-square bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] md:rounded-[32px] overflow-hidden group relative border border-white/50 dark:border-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
                          >
                              <div 
                                className="absolute inset-0 z-10 cursor-pointer" 
                                onClick={() => setSelectedCheckin(checkin)} 
                              />

                              {checkin.thumbnailUrl || checkin.imageUrl ? (
                                  <LivePhotoViewer 
                                      imageUrl={checkin.thumbnailUrl || checkin.imageUrl} 
                                      videoUrl={checkin.videoUrl} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                  />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                      <Sparkles className="w-8 h-8 text-[#A09D9A] mb-3 opacity-50" />
                                      <span className="text-[1.05rem] font-bold text-[#1A1A1A] dark:text-white line-clamp-3 leading-snug">
                                          {checkin.caption ? checkin.caption : 'Ghi chú văn bản'}
                                      </span>
                                  </div>
                              )}
                              
                              <div className="absolute top-3 right-3 p-2 bg-[#1A1A1A] rounded-[12px] shadow-md pointer-events-none z-20 border border-white/10">
                                  <Bookmark className="w-4 h-4 fill-white text-white" />
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-24 bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                                <Bookmark className="w-10 h-10 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                            </div>
                            <span className="text-[#1A1A1A] dark:text-white font-black text-[1.2rem] px-6 tracking-tight mb-2">Chưa có bài đăng nào</span>
                            <span className="text-[#8A8580] dark:text-[#A09D9A] font-semibold px-6">Hãy lưu lại các kỷ niệm đẹp để xem lại sau nhé.</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </MainLayout>

      <JourneyAlbumModal 
          journey={selectedJourneyAlbum} 
          onClose={() => setSelectedJourneyAlbum(null)} 
          onCheckinClick={(checkin) => setSelectedCheckin(checkin)} 
      />
      
      {selectedCheckin && (
        <CheckinDetailModal 
          checkin={selectedCheckin} 
          onClose={() => setSelectedCheckin(null)} 
        />
      )}
      
      {showFriendsModal && (
        <FriendsModal 
          isOpen={true} 
          userId={currentProfileId} 
          onClose={() => setShowFriendsModal(false)} 
        />
      )}
    </>
  );
};

export default ProfilePage;