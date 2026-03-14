import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { Settings, Bookmark } from 'lucide-react';
import { Checkin } from '@/modules/checkin/types';
import { UserActiveJourneyResponse } from '@/modules/journey/types';

import MainLayout from '@/components/layout/MainLayout';
import { JourneyGalleryCard } from '@/modules/journey/components/JourneyGalleryCard';
import { RecapAlbumCard } from '@/modules/user/components/RecapAlbumCard';
import { CheckinDetailModal } from '@/modules/checkin/components/CheckinDetailModal';
import { RecapDetailModal } from '@/modules/user/components/RecapDetailModal';
import { FriendsModal } from '@/modules/user/components/FriendsModal';
import { SettingsModal } from '@/modules/user/components/SettingsModal';

// Import Custom Hooks và Components vừa tách
import { useProfileData } from '../hooks/useProfileData';
import { useProfileContent } from '../hooks/useProfileContent';
import { ProfileHeaderBlock } from '../components/profile/ProfileHeaderBlock';

type TabType = 'ACTIVE' | 'FINISHED' | 'SAVED';

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const { userId: paramUserId } = useParams<{ userId: string }>(); 
  
  const isViewingOther = !!paramUserId && paramUserId !== authUser?.id;
  const currentProfileId = isViewingOther ? paramUserId : authUser?.id;

  // 1. Gọi Hooks
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');
  const { userProfile, isLoading, handleFriendRequest } = useProfileData(currentProfileId, isViewingOther);
  const { activeJourneys, finishedJourneys, savedCheckins } = useProfileContent(currentProfileId, userProfile?.isMe, activeTab);
  
  // 2. Quản lý Modal
  const [selectedRecapJourney, setSelectedRecapJourney] = useState<UserActiveJourneyResponse | null>(null);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  if (isLoading) return null; // Hoặc một component Loading Skeleton
  if (!userProfile) return <div className="text-center py-20 text-muted-foreground">Không tìm thấy người dùng</div>;
  
  const isMe = userProfile.isMe;
  const isBlocked = !isMe && (userProfile.isBlockedByThem || userProfile.isBlockedByMe);

  return (
    <MainLayout>
      <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300">
        
        {/* NÚT CÀI ĐẶT GÓC PHẢI */}
        <div className="sticky top-0 z-50 flex items-center justify-end p-4 bg-gradient-to-b from-background via-background/90 to-transparent pointer-events-none pb-8 transition-colors duration-300">
            {isMe && (
              <button 
                 onClick={() => setShowSettingsModal(true)}
                 className="p-2.5 bg-zinc-200/50 dark:bg-black/60 hover:bg-zinc-300/80 dark:hover:bg-black/80 backdrop-blur-xl rounded-full text-foreground transition-all border border-black/5 dark:border-white/10 pointer-events-auto"
              >
                 <Settings className="w-6 h-6" />
              </button>
            )}
        </div>

        <div className="px-4 md:px-8 pb-20 w-full max-w-6xl mx-auto -mt-4">
          
          {/* PROFILE INFO HEADER */}
          <ProfileHeaderBlock 
            userProfile={userProfile}
            isMe={isMe || false}
            onFriendRequest={handleFriendRequest}
            onShowFriends={() => setShowFriendsModal(true)}
            activeCount={activeJourneys.length}
            finishedCount={finishedJourneys.length}
          />

          {/* TABS */}
          <div className="border-b border-border mb-8">
            <div className="flex gap-8 justify-center md:justify-start">
              {(['ACTIVE', 'FINISHED', ...(isMe ? ['SAVED'] : [])] as TabType[]).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm md:text-base font-bold transition-all relative flex items-center gap-1.5 ${
                    activeTab === tab 
                    ? `text-${tab === 'FINISHED' ? 'purple-600 dark:text-purple-400' : 'primary'} after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-${tab === 'FINISHED' ? 'purple-600 dark:bg-purple-500' : 'primary'}` 
                    : 'text-muted-foreground hover:text-foreground/80'
                  }`}
                >
                  {tab === 'SAVED' && <Bookmark className="w-4 h-4" />}
                  {tab === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : tab === 'FINISHED' ? 'ĐÃ KẾT THÚC' : 'ĐÃ LƯU'}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="min-h-[400px]">
            {isBlocked ? (
              <div className="text-center py-20 bg-secondary/30 rounded-xl border border-border">
                <p className="text-muted-foreground">Nội dung không khả dụng.</p>
              </div>
            ) : (
              <>
                {/* ACTIVE TAB */}
                {activeTab === 'ACTIVE' && (
                  <div className="space-y-8">
                    {activeJourneys.length > 0 ? (
                      activeJourneys.map(journey => (
                        <JourneyGalleryCard key={journey.id} journey={journey} isMe={isMe} onCheckinClick={setSelectedCheckin} />
                      ))
                    ) : (
                      <div className="text-muted-foreground text-center py-10">{isMe ? "Bạn chưa tham gia hành trình nào." : "Người dùng này chưa có hành trình nào."}</div>
                    )}
                  </div>
                )}

                {/* FINISHED TAB */}
                {activeTab === 'FINISHED' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {finishedJourneys.length > 0 ? (
                      finishedJourneys.map(journey => (
                        <RecapAlbumCard key={journey.id} journey={journey} onClick={() => setSelectedRecapJourney(journey)} />
                      ))
                    ) : (
                      <div className="text-muted-foreground text-center py-10 col-span-full">Chưa có hành trình nào kết thúc.</div>
                    )}
                  </div>
                )}

                {/* SAVED TAB */}
                {activeTab === 'SAVED' && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {savedCheckins.length > 0 ? (
                      savedCheckins.map(checkin => (
                        <div key={checkin.id} className="aspect-square bg-secondary rounded-md md:rounded-xl overflow-hidden cursor-pointer group relative border border-border/50" onClick={() => setSelectedCheckin(checkin)}>
                            {checkin.thumbnailUrl || checkin.imageUrl ? (
                                <img src={checkin.thumbnailUrl || checkin.imageUrl} alt="Saved" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs md:text-sm text-muted-foreground bg-background">
                                    {checkin.caption ? checkin.caption.substring(0, 40) + '...' : 'Bài viết'}
                                </div>
                            )}
                            <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white backdrop-blur-sm">
                                <Bookmark className="w-3 h-3 fill-white" />
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-center py-20 col-span-full flex flex-col items-center justify-center w-full">
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4"><Bookmark className="w-6 h-6 opacity-40" /></div>
                          <span className="font-semibold text-foreground">Chưa có nội dung nào</span>
                          <span className="text-sm mt-1">Lưu các bài đăng để xem lại sau.</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ALL MODALS */}
          {selectedRecapJourney && <RecapDetailModal journeyId={selectedRecapJourney.id} journeyName={selectedRecapJourney.name} onClose={() => setSelectedRecapJourney(null)} onCheckinClick={setSelectedCheckin} />}
          {selectedCheckin && <CheckinDetailModal checkin={selectedCheckin} onClose={() => setSelectedCheckin(null)} />}
          {showFriendsModal && <FriendsModal isOpen={true} userId={currentProfileId} onClose={() => setShowFriendsModal(false)} />}
          <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;