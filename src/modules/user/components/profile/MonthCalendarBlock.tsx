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

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const isCurrentMonth = new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

  return (
    <div className="w-[90vw] sm:w-[360px] md:w-[440px] shrink-0 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md p-6 md:p-8 rounded-[36px] border border-white/50 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative z-20">
      
      {/* HEADER THÁNG - Tone Đen/Trắng sang trọng */}
      <div className="flex flex-col items-center justify-center mb-6">
        <span className="text-[1.4rem] md:text-[1.6rem] font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">
          {monthNames[month - 1]}
        </span>
        <span className="text-[#8A8580] dark:text-[#A09D9A] text-[1.1rem] font-extrabold mt-1">
          {year}
        </span>
      </div>

<<<<<<< HEAD
      {/* Tên các ngày trong tuần */}
      <div className="grid grid-cols-7 gap-2 mb-4 text-center text-[0.75rem] font-extrabold text-[#8A8580] uppercase tracking-widest">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
=======
      <div className="grid grid-cols-7 gap-2 mb-3 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Khối Grid Lịch */}
      <div className="grid grid-cols-7 gap-2 relative min-h-[220px]">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/40 dark:bg-[#1A1A1A]/40 flex items-center justify-center backdrop-blur-[2px] rounded-[24px]">
             <div className="w-8 h-8 border-[3px] border-[#1A1A1A] dark:border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Các ô trống đầu tháng */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square rounded-[14px] bg-transparent" />
        ))}

        {/* Các ngày trong tháng */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const recap = recapData.find(r => r.day === day);
          const isToday = isCurrentMonth && new Date().getDate() === day;

          return (
            <div key={day} className="relative aspect-square">
              {recap ? (
                <button 
                  onClick={() => onImageClick && onImageClick(recap.checkinId)}
                  className="w-full h-full rounded-[14px] overflow-hidden shadow-sm hover:shadow-md hover:scale-110 hover:z-20 transition-all duration-300 relative group cursor-pointer border-[2px] border-transparent hover:border-white dark:hover:border-[#2B2A29]"
                >
                  <img src={recap.imageUrl} alt={`Day ${day}`} className="w-full h-full object-cover pointer-events-none" />
                  
                  {/* Lớp phủ Gradient đen để nổi bật số ngày */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 group-hover:opacity-60 transition-opacity pointer-events-none" />
                  
                  <div className="absolute bottom-1 w-full text-center pointer-events-none">
                    <span className="text-white text-[0.85rem] font-black drop-shadow-md">{day}</span>
                  </div>
                </button>
              ) : (
                <div className={cn(
                  "w-full h-full rounded-[14px] flex items-center justify-center transition-all",
                  isToday 
                    ? "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-105 z-10" 
                    : "bg-[#F4EBE1]/50 dark:bg-[#2B2A29]/50 border border-[#D6CFC7]/50 dark:border-[#3A3734]/50"
                )}>
                  <span className={cn(
                    "text-[0.8rem] font-extrabold",
                    isToday ? "text-inherit" : "text-[#8A8580] dark:text-[#A09D9A]"
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