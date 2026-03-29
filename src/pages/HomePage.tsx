import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { HomeFeed } from '@/modules/feed/components/HomeFeed'; 
import { CreateJourneyModal } from '@/modules/journey/components/CreateJourneyModal';

import { MobileHomeHeader } from '@/components/layout/Navigation/MobileHomeHeader';
import { MobileActiveJourneyList } from '@/modules/journey/components/MobileActiveJourneyList';
import { Plus } from 'lucide-react';
import { journeyService } from '@/modules/journey/services/journey.service';

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

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
        {/* [ĐÃ SỬA] Đã loại bỏ class `pb-20` ở đây để loại bỏ khoảng hở lớn ở đáy màn hình */}
        <div className="flex md:hidden flex-col w-full h-full">
            {!selectedJourneyId ? (
                <div className="flex flex-col w-full h-full">
                    <div className="shrink-0 z-10 w-full">
                        <MobileHomeHeader />
                        <MobileActiveJourneyList onJourneySelect={handleJourneySelect} selectedId={selectedJourneyId} />
                    </div>
                    
                    {/* FEED: MOMENTS & NÚT CREATE */}
                    <div className="flex-1 w-full relative px-5 pt-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-black dark:text-white text-2xl font-normal drop-shadow-sm" style={{ fontFamily: '"Jua", sans-serif' }}>
                                Moments
                            </h2>
                            
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-1.5 bg-green-400 dark:bg-green-500 hover:bg-green-500 text-white pl-1.5 pr-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all"
                            >
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-500">
                                    <Plus size={16} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-normal" style={{ fontFamily: '"Jua", sans-serif' }}>Create</span>
                            </button>
                        </div>
                        
                        <HomeFeed selectedJourneyId={null} />
                    </div>
                </div>
            ) : (
                <div className="w-full h-full relative">
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

      <CreateJourneyModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => window.location.reload()}
      />
    </MainLayout>
  );
};

export default HomePage;