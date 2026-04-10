import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { HomeFeed } from '@/modules/feed/components/HomeFeed'; 

import { MobileHomeHeader } from '@/components/layout/Navigation/MobileHomeHeader';
import { MobileActiveJourneyList } from '@/modules/journey/components/MobileActiveJourneyList';
import { Flame, Archive } from 'lucide-react';
import { journeyService } from '@/modules/journey/services/journey.service';

// Import hooks
import { useProfileData } from '@/modules/user/hooks/useProfileData';
import { useProfileContent } from '@/modules/user/hooks/useProfileContent';

// IMPORT MODAL VỪA TẠO
import { ArchivedCheckinsModal } from '@/modules/checkin/components/ArchivedCheckinsModal';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // State quản lý Modal Lưu trữ
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Lấy dữ liệu Profile (để lấy currentStreak)
  const { userProfile } = useProfileData("me", false);
  
  // Lấy nội dung Profile (để lấy danh sách archivedCheckins)
  const { archivedCheckins } = useProfileContent("me", true, "ARCHIVED");

  useEffect(() => {
    const initDesktopView = async () => {
      if (window.innerWidth >= 768 && !searchParams.get('journeyId')) {
        try {
          const activeList = await journeyService.getUserActiveJourneys("me");
          if (activeList && activeList.length > 0) {
            setSearchParams({ journeyId: activeList[0].id }, { replace: true });
          }
        } catch (error) {
          console.error("Failed to auto-select journey", error);
        }
      }
    };

    initDesktopView();

    const handleResize = () => {
      if (window.innerWidth >= 768 && !searchParams.get('journeyId')) {
        initDesktopView();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const journeyIdFromUrl = searchParams.get('journeyId');
    if (journeyIdFromUrl) setSelectedJourneyId(journeyIdFromUrl);
    else setSelectedJourneyId(null);

    const handleJourneySelected = (e: any) => {
      const id = e.detail;
      setSelectedJourneyId(id);
      setSearchParams({ journeyId: id });
    };

    window.addEventListener('JOURNEY_SELECTED', handleJourneySelected);
    return () => window.removeEventListener('JOURNEY_SELECTED', handleJourneySelected);
  }, [searchParams, setSearchParams]);

  const handleJourneySelect = (id: string) => {
    const newId = selectedJourneyId === id ? null : id;
    setSelectedJourneyId(newId);
    if (newId) setSearchParams({ journeyId: newId });
    else {
      searchParams.delete('journeyId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleBackToHome = () => {
      setSelectedJourneyId(null);
      searchParams.delete('journeyId');
      setSearchParams(searchParams, { replace: true });
  };

  return (
    <MainLayout>
      <div className="flex flex-col flex-1 w-full h-full bg-zinc-50 dark:bg-[#121212] relative transition-colors duration-300">
        
        {/* =================================================================
            1. GIAO DIỆN MOBILE
            ================================================================= */}
        <div className="flex md:hidden flex-col w-full h-full">
            {!selectedJourneyId ? (
                // 1. TRANG ACTION: Cuộn full màn hình, pb-[90px] đẩy content cuối lên trên Navbar
                <div className="flex flex-col w-full h-full overflow-y-auto pb-[90px] scrollbar-hide">
                    <div className="shrink-0 w-full">
                        <MobileHomeHeader />
                        <MobileActiveJourneyList onJourneySelect={handleJourneySelect} selectedId={selectedJourneyId} />
                    </div>
                    
                    {/* ACTIONS */}
                    <div className="w-full px-6 -pt-2 mb-8">
                        <h2 className="text-[#1A1A1A] dark:text-white text-[1.4rem] font-black tracking-tight mb-5">
                            Hoạt động của bạn 
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Ô Chuỗi (Streak) */}
                            <button 
                                onClick={() => navigate('/streak')} 
                                className="relative overflow-hidden flex flex-col items-start p-5 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[32px] border border-white/50 dark:border-[#2B2A29] active:scale-95 transition-all text-left shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] group"
                            >
                                <img 
                                    src="/moscow/moscow (14).png" 
                                    alt="Streak Decoration" 
                                    className="absolute bottom-0 right-0 w-28 h-28 object-contain opacity-70 pointer-events-none rounded-br-[32px] translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500" 
                                />
                                
                                <div className="z-10 relative flex flex-col items-start h-full w-full">
                                    <div className="w-10 h-10 rounded-[14px] bg-[#F4EBE1] dark:bg-[#2B2A29] flex items-center justify-center text-[#1A1A1A] dark:text-white mb-3 shadow-sm border border-[#D6CFC7]/50 dark:border-transparent">
                                        <Flame size={22} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[0.8rem] text-[#8A8580] dark:text-[#A09D9A] font-extrabold uppercase tracking-widest mb-1">Chuỗi ngày</span>
                                    <div className="flex items-baseline gap-1.5 mt-auto pt-2">
                                        <span className="text-[2rem] font-black text-[#1A1A1A] dark:text-white leading-none">
                                            {userProfile?.currentStreak || 0}
                                        </span>
                                        <span className="text-[0.95rem] text-[#8A8580] dark:text-[#A09D9A] font-bold">ngày</span>
                                    </div>
                                </div>
                            </button>

                            {/* Ô Lưu trữ */}
                            <button 
                                onClick={() => setIsArchiveModalOpen(true)} 
                                className="relative overflow-hidden flex flex-col items-start p-5 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[32px] border border-white/50 dark:border-[#2B2A29] active:scale-95 transition-all text-left shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] group"
                            >
                                <img 
                                    src="/moscow/moscow (12).png" 
                                    alt="Archive Decoration" 
                                    className="absolute bottom-0 right-0 w-28 h-28 object-contain opacity-70 pointer-events-none rounded-br-[32px] translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500" 
                                />

                                <div className="z-10 relative flex flex-col items-start h-full w-full">
                                    <div className="w-10 h-10 rounded-[14px] bg-[#F4EBE1] dark:bg-[#2B2A29] flex items-center justify-center text-[#1A1A1A] dark:text-white mb-3 shadow-sm border border-[#D6CFC7]/50 dark:border-transparent">
                                        <Archive size={20} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[0.8rem] text-[#8A8580] dark:text-[#A09D9A] font-extrabold uppercase tracking-widest mb-1">Kho lưu trữ</span>
                                    <div className="flex items-baseline gap-1.5 mt-auto pt-2">
                                        <span className="text-[2rem] font-black text-[#1A1A1A] dark:text-white leading-none">
                                            {archivedCheckins?.length || 0}
                                        </span>
                                        <span className="text-[0.95rem] text-[#8A8580] dark:text-[#A09D9A] font-bold">bài viết</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // 2. TRANG FEED: Thêm pb-[72px] ở CẤP ĐỘ NÀY để input comment nằm gọn gàng ngay trên Navbar
                <div className="w-full h-full relative pb-[72px] md:pb-0">
                     <button 
                        onClick={handleBackToHome}
                        className="absolute top-4 left-4 z-40 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm font-bold active:scale-95"
                     >
                        ← Trở về
                     </button>
                     <HomeFeed selectedJourneyId={selectedJourneyId} />
                </div>
            )}
        </div>

        {/* =================================================================
            2. GIAO DIỆN DESKTOP
            ================================================================= */}
        <div className="hidden md:flex flex-col w-full h-full overflow-hidden">
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <HomeFeed selectedJourneyId={selectedJourneyId} />
          </div>
        </div>

      </div>

      {/* RENDER MODAL ARCHIVE TẠI ĐÂY */}
      <ArchivedCheckinsModal 
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        checkins={archivedCheckins} // <-- THÊM DÒNG NÀY 
      />
    </MainLayout>
  );
};

export default HomePage;