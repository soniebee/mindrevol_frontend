import React from 'react';
import { UserPlus, Settings, BookOpen, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniCalendarGrid } from '@/modules/box/components/BoxJourneyShared';

interface Props {
  journey: any; 
  isOwner: boolean;
  isPending: boolean;
  hasPendingRequests: boolean;
  canInvite: boolean;
  onEnter: (id: string) => void;
  onInvite: (journey: any) => void;
  onSettings: (journey: any) => void;
  onRequest?: (journey: any) => void; 
}

export const ActiveJourneyCard: React.FC<Props> = ({
  journey, isOwner, isPending, hasPendingRequests, canInvite, onEnter, onInvite, onSettings, onRequest
}) => {
  
  const previewImgs = journey.previewImages && journey.previewImages.length > 0 
      ? journey.previewImages 
      : (journey.thumbnailUrl ? [journey.thumbnailUrl] : []);

  // Format ngày
  const displayDate = new Date(journey.createdAt || journey.startDate).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div 
        onClick={() => { if (!isPending) onEnter(journey.id); }}
        className={cn(
            "w-full bg-white dark:bg-[#2B2A29] rounded-[32px] p-5 md:p-6 cursor-pointer transition-all border-2 border-dashed border-[#D6CFC7] dark:border-[#4A4D55] hover:border-[#1A1A1A] dark:hover:border-white flex flex-col justify-between group",
            isPending 
                ? "opacity-60 cursor-not-allowed" 
                : "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
        )}
    >
        <div className="flex justify-between items-start mb-6">
            
            {/* BÊN TRÁI: Avatar & Tên */}
            <div className="flex items-center gap-4 w-[65%]">
                <div className="shrink-0 w-14 h-14 bg-[#F4EBE1] dark:bg-[#1A1A1A] rounded-[18px] flex items-center justify-center overflow-hidden shadow-sm">
                    {journey.avatar ? (
                        <span className="text-[2rem] leading-none group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{journey.avatar}</span>
                    ) : (
                        <BookOpen size={24} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A]"/>
                    )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-black text-[1.2rem] md:text-[1.3rem] text-[#1A1A1A] dark:text-white truncate leading-tight tracking-tight">
                        {journey.name}
                    </h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-[#F4EBE1]/80 dark:bg-[#1A1A1A] text-[#8A8580] dark:text-[#A09D9A] rounded-[10px] text-[0.7rem] font-extrabold uppercase tracking-widest border border-white/50 dark:border-transparent">
                        {displayDate}
                    </span>
                </div>
            </div>

            {/* BÊN PHẢI: Nút hành động */}
            <div className="flex items-center gap-2 z-50 shrink-0">
                {isPending ? (
                    <span className="text-[0.7rem] px-3 py-1.5 rounded-[12px] font-extrabold uppercase tracking-widest bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
                        Chờ duyệt
                    </span>
                ) : (
                    <>
                        {canInvite && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onInvite(journey); }}
                                className="w-10 h-10 flex items-center justify-center bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] text-[#8A8580] dark:text-[#A09D9A] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1A] rounded-[14px] transition-all active:scale-95 border border-transparent hover:border-[#1A1A1A] dark:hover:border-white"
                                title="Mời thành viên"
                            >
                                <UserPlus size={18} strokeWidth={2.5} />
                            </button>
                        )}
                        {hasPendingRequests && onRequest && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRequest(journey); }}
                                className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-[14px] transition-all active:scale-95 relative border border-red-100 dark:border-red-500/30"
                                title="Yêu cầu tham gia"
                            >
                                <Bell size={18} strokeWidth={2.5} className="animate-pulse" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#2B2A29] shadow-sm" />
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSettings(journey); }}
                            className="w-10 h-10 flex items-center justify-center bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] text-[#8A8580] dark:text-[#A09D9A] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1A] rounded-[14px] transition-all active:scale-95 border border-transparent hover:border-[#1A1A1A] dark:hover:border-white"
                            title="Cài đặt"
                        >
                            <Settings size={18} strokeWidth={2.5} />
                        </button>
                    </>
                )}
            </div>

        </div>
        
        {/* COMPONENT LƯỚI ẢNH BÊN DƯỚI */}
        <MiniCalendarGrid previewImages={previewImgs} isMobileStyle={true} />
    </div>
  );
};