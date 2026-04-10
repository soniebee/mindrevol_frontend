import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { journeyService } from '../services/journey.service';
import { JourneyResponse, JourneyStatus, UserActiveJourneyResponse } from '../types';
import { MobileJourneyCard } from './MobileJourneyCard';

interface MergedJourney extends JourneyResponse {
  memberAvatars?: (string | null)[];
  daysRemaining?: number;
  totalMembers?: number;
  thumbnailUrl?: string; 
  previewImages?: string[];
}

interface Props {
  onJourneySelect?: (id: string) => void;
  selectedId?: string | null;
}

export const MobileActiveJourneyList: React.FC<Props> = ({ onJourneySelect, selectedId }) => {
  const [journeys, setJourneys] = useState<MergedJourney[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJourneys = async () => {
      setLoading(true);
      try {
          const [myList, activeList] = await Promise.all([
              journeyService.getMyJourneys(),
              journeyService.getUserActiveJourneys("me")
          ]);

          const merged: MergedJourney[] = myList.map((journey: JourneyResponse) => {
              const extraData = activeList.find((a: UserActiveJourneyResponse) => a.id === journey.id);
              const checkinImages = extraData?.checkins
                  ?.filter((c: any) => c.imageUrl)
                  .map((c: any) => c.imageUrl as string) || [];

              return {
                  ...journey,
                  memberAvatars: extraData?.memberAvatars || [],
                  daysRemaining: extraData?.daysRemaining,
                  totalMembers: extraData?.totalMembers || journey.participantCount || 1,
                  themeColor: extraData?.themeColor || journey.themeColor,
                  avatar: extraData?.avatar || journey.avatar,
                  thumbnailUrl: extraData?.thumbnailUrl,
                  previewImages: checkinImages.length > 0 ? checkinImages : (extraData?.thumbnailUrl ? [extraData.thumbnailUrl] : []) 
              };
          });
          
          setJourneys(merged);
      } catch (error) {
          console.error("Failed to load active journeys", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchJourneys();
    window.addEventListener('JOURNEY_UPDATED', fetchJourneys);
    return () => window.removeEventListener('JOURNEY_UPDATED', fetchJourneys);
  }, []);

  const activeJourneys = useMemo(() => {
    if (!journeys) return [];
    return journeys.filter(j => 
      [JourneyStatus.ACTIVE, JourneyStatus.ONGOING, JourneyStatus.UPCOMING].includes(j.status as JourneyStatus)
    );
  }, [journeys]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10 bg-transparent">
         <Loader2 className="w-8 h-8 text-[#8A8580] animate-spin" />
      </div>
    );
  }

  if (activeJourneys.length === 0) return null;

  return (
    <div className="w-full flex flex-col bg-transparent px-5 pb-6 font-quicksand animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[#1A1A1A] dark:text-white text-[1.4rem] font-black tracking-tight">
          Hành trình hiện tại
        </h2>
      </div>
      
      <div className="flex flex-col w-full gap-5">
        {activeJourneys.map((journey) => (
            <div 
                key={journey.id}
                className={`w-full transition-all duration-300 ${selectedId === journey.id ? 'scale-[1.02] ring-[3px] ring-[#1A1A1A] dark:ring-white rounded-[28px] shadow-[0_16px_40px_rgba(0,0,0,0.12)]' : 'scale-100 hover:-translate-y-1'}`}
            >
                <MobileJourneyCard 
                    journey={journey}
                    onClick={() => onJourneySelect?.(journey.id)} 
                />
            </div>
        ))}
      </div>
    </div>
  );
};