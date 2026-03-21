import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { Bookmark, Lock, Users, BookOpen } from 'lucide-react';
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

type TabType = 'PUBLIC' | 'PRIVATE' | 'SAVED';

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const { userId: paramUserId } = useParams<{ userId: string }>(); 
  
  const isViewingOther = !!paramUserId && paramUserId !== authUser?.id;
  const currentProfileId = isViewingOther ? paramUserId : authUser?.id;

  const [activeTab, setActiveTab] = useState<TabType>('PUBLIC');
  const { userProfile, isLoading, handleFriendRequest } = useProfileData(currentProfileId, isViewingOther);
  
  const { publicJourneys, privateJourneys, savedCheckins, toggleLocalVisibility } = useProfileContent(currentProfileId, userProfile?.isMe, activeTab);
  
  const [selectedJourneyAlbum, setSelectedJourneyAlbum] = useState<UserActiveJourneyResponse | null>(null);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  
  if (isLoading) return (
      <MainLayout>
          <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-[#121212]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
      </MainLayout>
  ); 

  if (!userProfile) return <div className="text-center py-20 text-zinc-500 font-medium text-2xl">Không tìm thấy người dùng</div>;
  
  const isMe = userProfile.isMe;
  const isBlocked = !isMe && (userProfile.isBlockedByThem || userProfile.isBlockedByMe);

  return (
    <>
      <MainLayout>
        <div className="w-full min-h-screen bg-slate-50 dark:bg-[#121212] transition-colors duration-300 relative overflow-hidden">
          
          {/* Đã xóa phần chứa nút Settings ở đây */}
          
          {/* Thêm pt-8 md:pt-12 để các phần tử không bị sát lề trên */}
          <div className="px-4 md:px-8 pt-8 md:pt-12 pb-24 w-full max-w-[1024px] mx-auto relative z-10">
            
            <ProfileHeaderBlock 
              userProfile={userProfile}
              isMe={isMe || false}
              onFriendRequest={handleFriendRequest}
              onShowFriends={() => setShowFriendsModal(true)}
              publicCount={publicJourneys.length}
              privateCount={privateJourneys.length}
            />

            {isMe && (
              <div className="mb-6 md:mb-8 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between sm:justify-center px-2 sm:px-0 gap-2 md:gap-16">
                  {(['PUBLIC', 'PRIVATE', 'SAVED'] as TabType[]).map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pt-5 pb-4 text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-t-[3px] -mt-[1.5px] flex-1 sm:flex-none ${
                        activeTab === tab 
                        ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                      }`}
                    >
                      {tab === 'PUBLIC' && <Users size={16} />}
                      {tab === 'PRIVATE' && <Lock size={16} />}
                      {tab === 'SAVED' && <Bookmark size={16} />}
                      <span>
                        {tab === 'PUBLIC' ? 'Công khai' : tab === 'PRIVATE' ? 'Riêng tư' : 'Đã lưu'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="min-h-[400px]">
              {isBlocked ? (
                <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm mx-4 md:mx-0">
                  <Lock className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium text-xl">Nội dung không khả dụng</p>
                </div>
              ) : (
                <>
                  {activeTab === 'PUBLIC' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                        <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800">
                          <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" strokeWidth={1.5} />
                          <p className="text-zinc-500 font-medium text-base px-6">
                              {isMe ? "Bạn chưa có hành trình công khai nào." : 
                                (userProfile.friendshipStatus !== 'ACCEPTED' 
                                  ? "Hãy kết bạn để xem các không gian của người này." 
                                  : "Người dùng này chưa có hành trình công khai nào.")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'PRIVATE' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                        <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800">
                           <Lock className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" strokeWidth={1.5} />
                           <p className="text-zinc-500 font-medium text-base">Chưa có hành trình riêng tư nào.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'SAVED' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {savedCheckins.length > 0 ? (
                        savedCheckins.map(checkin => (
                          <div key={checkin.id} className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl md:rounded-[24px] overflow-hidden cursor-pointer group relative border border-zinc-200 dark:border-zinc-700 shadow-sm" onClick={() => setSelectedCheckin(checkin)}>
                              {checkin.thumbnailUrl || checkin.imageUrl ? (
                                  <LivePhotoViewer 
                                      imageUrl={checkin.thumbnailUrl || checkin.imageUrl} 
                                      videoUrl={checkin.videoUrl} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center p-4 text-center text-sm md:text-base font-medium text-zinc-500">
                                      {checkin.caption ? checkin.caption.substring(0, 40) + '...' : 'Bài viết'}
                                  </div>
                              )}
                              <div className="absolute top-2 right-2 md:top-3 md:right-3 p-2 bg-black/40 rounded-full backdrop-blur-md pointer-events-none">
                                  <Bookmark className="w-4 h-4 fill-white text-white" />
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center mx-4 md:mx-0">
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                <Bookmark className="w-6 h-6 text-blue-500 dark:text-zinc-500" />
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-white text-xl">Chưa có nội dung nào</span>
                            <span className="text-zinc-500 mt-2 font-medium text-base">Lưu các bài đăng để xem lại sau.</span>
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