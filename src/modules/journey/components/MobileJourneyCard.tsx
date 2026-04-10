import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { JourneyResponse } from '../types';
import { MiniCalendarGrid } from '@/modules/box/components/BoxJourneyShared';
import { cn } from '@/lib/utils';

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
        className={cn(
            "w-full bg-white dark:bg-[#2B2A29] rounded-[24px] p-4 cursor-pointer transition-all flex flex-col font-quicksand group",
            "border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] hover:border-[#1A1A1A] dark:hover:border-white",
            "shadow-[0_6px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] active:scale-[0.98] hover:-translate-y-1"
        )}
    >
        <div className="flex justify-between items-center mb-4">
            
            {/* THÔNG TIN BÊN TRÁI */}
            <div className="flex items-center gap-3.5 w-[80%] min-w-0">
                <div className="shrink-0 w-12 h-12 bg-[#F4EBE1] dark:bg-[#1A1A1A] rounded-[16px] flex items-center justify-center overflow-hidden shadow-sm border border-white/50 dark:border-white/5">
                    {journey.avatar ? (
                        <span className="text-[1.8rem] leading-none group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{journey.avatar}</span>
                    ) : (
                        <BookOpen size={20} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A]" />
                    )}
                </div>
                <h3 className="font-black text-[1.15rem] text-[#1A1A1A] dark:text-white truncate tracking-tight pt-0.5">
                    {journey.name}
                </h3>
            </div>

            {/* MŨI TÊN BÊN PHẢI */}
            <div className="shrink-0 w-9 h-9 rounded-[12px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A]/50 flex items-center justify-center text-[#8A8580] dark:text-[#A09D9A] group-hover:text-[#1A1A1A] dark:group-hover:text-white group-hover:bg-[#F4EBE1] dark:group-hover:bg-[#1A1A1A] transition-all">
                <ChevronRight size={18} strokeWidth={3} />
            </div>
        </div>
        
        {/* COMPONENT LƯỚI LỊCH NHỎ */}
        <div className="mt-1">
            <MiniCalendarGrid previewImages={previewImgs} isMobileStyle={true} />
        </div>
    </div>
  );
};