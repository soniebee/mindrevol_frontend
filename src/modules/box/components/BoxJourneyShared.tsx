import React from 'react';
import { cn } from '@/lib/utils';

export const formatDate = (dateString: string) => {
    if (!dateString) return "Kỷ niệm chưa xác định";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date); 
};

export const MiniCalendarGrid = ({ previewImages = [], isMobileStyle = false }: { previewImages?: string[], isMobileStyle?: boolean }) => {
    const totalDays = isMobileStyle ? 7 : 31;
    
    return (
        <div className={cn("grid grid-cols-7 w-full", isMobileStyle ? "gap-[3px] mt-3 mb-1" : "gap-[3px] my-4")}>
            {Array.from({ length: totalDays }).map((_, i) => {
                const imgUrl = previewImages[i]; 
                return (
                    <div key={i} className={cn(
                        "aspect-square overflow-hidden transition-all",
                        isMobileStyle ? "rounded-[4px]" : "rounded-[3px]",
                        imgUrl 
                            ? (isMobileStyle ? "bg-zinc-200" : "bg-zinc-800 ring-1 ring-white/10 shadow-sm") 
                            : (isMobileStyle ? "bg-zinc-100 dark:bg-zinc-800/50" : "bg-white/5 border border-white/5")
                    )}>
                        {imgUrl && <img src={imgUrl} alt="checkin" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />}
                    </div>
                );
            })}
        </div>
    );
};