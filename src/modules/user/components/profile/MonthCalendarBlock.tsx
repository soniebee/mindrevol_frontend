import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { userService, CalendarRecap } from '@/modules/user/services/user.service';

interface Props {
  userId: string;
  year: number;
  month: number;
  onImageClick?: (checkinId: string) => void;
}

export const MonthCalendarBlock: React.FC<Props> = ({ userId, year, month, onImageClick }) => {
  const [recapData, setRecapData] = useState<CalendarRecap[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const fetchCalendar = async () => {
      setIsLoading(true);
      try {
        const data = await userService.getUserCalendar(userId, year, month);
        if (isMounted) setRecapData(data);
      } catch (error) {
        console.error('Lỗi lấy lịch:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCalendar();

    return () => { isMounted = false; };
  }, [userId, year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const isCurrentMonth = new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

  return (
    // Đã thay đổi màu nền thành ĐẶC (Solid), bỏ độ mờ để che đường kẻ phía sau
    <div className="w-[90vw] sm:w-[360px] md:w-[420px] shrink-0 bg-white dark:bg-[#18181b] p-5 md:p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-xl font-sans relative z-20">
      
      {/* HEADER THÁNG - Thêm màu sắc Gradient rực rỡ */}
      <div className="flex items-center justify-center mb-6">
        <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase tracking-widest drop-shadow-sm">
          {monthNames[month - 1]} {year}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2 relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/50 dark:bg-[#18181b]/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
             <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-transparent" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const recap = recapData.find(r => r.day === day);
          const isToday = isCurrentMonth && new Date().getDate() === day;

          return (
            <div key={day} className="relative aspect-square">
              {recap ? (
                <button 
                  onClick={() => onImageClick && onImageClick(recap.checkinId)}
                  className="w-full h-full rounded-[12px] md:rounded-[16px] overflow-hidden shadow-sm border-[2px] border-amber-400 dark:border-amber-500 hover:scale-110 hover:z-20 transition-all duration-300 relative group cursor-pointer"
                >
                  <img src={recap.imageUrl} alt={`Day ${day}`} className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity pointer-events-none" />
                  <div className="absolute bottom-1 w-full text-center pointer-events-none">
                    <span className="text-white text-[10px] md:text-xs font-bold drop-shadow-md">{day}</span>
                  </div>
                </button>
              ) : (
                <div className={cn(
                  "w-full h-full rounded-[12px] md:rounded-[16px] flex items-center justify-center transition-colors",
                  isToday 
                    ? "bg-amber-100 dark:bg-amber-500/20 border-2 border-amber-300 dark:border-amber-500/50" 
                    : "bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/30"
                )}>
                  <span className={cn(
                    "text-[11px] md:text-xs font-bold",
                    isToday ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-600"
                  )}>{day}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};