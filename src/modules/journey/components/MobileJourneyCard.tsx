import React from 'react';
import { BookOpen } from 'lucide-react';
import { JourneyResponse } from '../types';
import { MiniCalendarGrid } from '@/modules/box/components/BoxJourneyShared';

interface MergedJourney extends JourneyResponse {
  memberAvatars?: (string | null)[];
  daysRemaining?: number;
  totalMembers?: number;
  thumbnailUrl?: string; 
  previewImages?: string[];
}

interface MobileJourneyCardProps {
  journey: MergedJourney;
  onClick?: () => void;
}

export const MobileJourneyCard: React.FC<MobileJourneyCardProps> = ({ journey, onClick }) => {
  
  const previewImgs = journey.previewImages && journey.previewImages.length > 0 
      ? journey.previewImages 
      : (journey.thumbnailUrl ? [journey.thumbnailUrl] : []);

  return (
    <div 
        onClick={onClick}
        className="w-full bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform border border-transparent dark:border-zinc-800"
    >
        <div className="flex justify-between items-start">
            
            <div className="flex items-center gap-3 w-[70%]">
                {journey.avatar ? (
                    <span className="text-2xl">{journey.avatar}</span>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                        <BookOpen size={16}/>
                    </div>
                )}
                <h3 className="font-['Jua'] text-xl text-zinc-900 dark:text-zinc-100 truncate">{journey.name}</h3>
            </div>

            <div className="text-sky-900 dark:text-sky-400 text-base font-normal font-['Jua'] whitespace-nowrap">
                Open -&gt;
            </div>

        </div>
        
        {/* Component Lưới Lịch Nhỏ */}
        <MiniCalendarGrid previewImages={previewImgs} isMobileStyle={true} />
    </div>
  );
};