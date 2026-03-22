import React from 'react';
import { UserPlus, Settings, BookOpen } from 'lucide-react';
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
}

export const ActiveJourneyCard: React.FC<Props> = ({
  journey,
  isOwner,
  isPending,
  hasPendingRequests,
  canInvite,
  onEnter,
  onInvite,
  onSettings
}) => {
  
  // Trích xuất hình ảnh từ API để truyền vào Calendar
  const previewImgs = journey.previewImages && journey.previewImages.length > 0 
      ? journey.previewImages 
      : (journey.thumbnailUrl ? [journey.thumbnailUrl] : []);

  return (
    <div 
        onClick={() => {
            if (!isPending) onEnter(journey.id);
        }}
        // Áp dụng viền, bo góc và bóng đổ giống hệt giao diện trang chủ
        className={cn(
            "w-full bg-white dark:bg-zinc-900 rounded-[20px] p-4 cursor-pointer transition-all border border-zinc-100/80 dark:border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative",
            isPending 
                ? "opacity-60 cursor-not-allowed" 
                : "hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
        )}
    >
        <div className="flex justify-between items-start mb-3">
            
            {/* BÊN TRÁI: Avatar & Tên */}
            <div className="flex items-center gap-3 w-[65%]">
                {journey.avatar ? (
                    <span className="text-2xl drop-shadow-sm">{journey.avatar}</span>
                ) : (
                    <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 shadow-inner shrink-0">
                        <BookOpen size={18}/>
                    </div>
                )}
                <h3 className="font-['Jua'] text-xl text-zinc-900 dark:text-zinc-100 truncate tracking-wide">
                    {journey.name}
                </h3>
            </div>

            {/* BÊN PHẢI: Nút hành động thay cho chữ Open */}
            <div className="flex items-center gap-1.5 z-50">
                {isPending ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-orange-50 text-orange-600 border-orange-400/50 shadow-sm">
                        PENDING
                    </span>
                ) : (
                    <>
                        {canInvite && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onInvite(journey); }}
                                className="p-2 text-zinc-500 hover:text-blue-600 bg-zinc-50 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-500/20 rounded-full transition-colors"
                                title="Mời thành viên"
                            >
                                <UserPlus className="w-[18px] h-[18px]" strokeWidth={2.5} />
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSettings(journey); }}
                            className={cn(
                                "p-2 rounded-full transition-colors relative",
                                hasPendingRequests 
                                    ? "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/20 dark:hover:bg-red-500/30" 
                                    : "text-zinc-500 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-white"
                            )}
                            title="Cài đặt"
                        >
                            <Settings className={cn("w-[18px] h-[18px]", hasPendingRequests && "animate-pulse")} strokeWidth={2.5} />
                            {hasPendingRequests && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
                            )}
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