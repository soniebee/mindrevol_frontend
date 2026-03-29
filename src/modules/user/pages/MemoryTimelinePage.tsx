import React, { useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { Flame, CalendarDays, Image as ImageIcon } from 'lucide-react';
import { useProfileData } from '../hooks/useProfileData';
import { MonthCalendarBlock } from '../components/profile/MonthCalendarBlock';

const generateMonthsFromDate = (startDateStr?: string) => {
  const result = [];
  const end = new Date();
  const start = startDateStr ? new Date(startDateStr) : new Date(end.getFullYear(), end.getMonth() - 6, 1);
  
  let current = new Date(end.getFullYear(), end.getMonth(), 1);
  const min = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current >= min) {
    result.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() - 1);
  }
  return result;
};

const MemoryTimelinePage = () => {
  const { user } = useAuth();
  const { userProfile, isLoading } = useProfileData(user?.id, false);
  
  const monthsList = useMemo(() => generateMonthsFromDate(userProfile?.createdAt), [userProfile?.createdAt]);

  if (!user) return null;

  return (
    <MainLayout>
      <div className="w-full h-[calc(100dvh-64px)] md:h-[100dvh] bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300 flex flex-col font-sans relative overflow-hidden">
        
        {/* HEADER */}
        <div className="shrink-0 px-4 pt-6 md:pt-12 pb-2 text-center z-20 relative">
          <div className="inline-flex items-center justify-center gap-3">
            <CalendarDays className="w-6 h-6 text-zinc-500" />
            <span className="text-xl font-extrabold text-zinc-800 dark:text-white uppercase tracking-widest">
              Hành Trình Ký Ức
            </span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 font-medium">
             Lưu giữ từng khoảnh khắc của bạn
          </p>
        </div>

        {/* TIMELINE VIEW */}
        <div 
          className="flex-1 w-full relative min-h-0"
          // HIỆU ỨNG MỜ DẦN Ở 2 ĐẦU (FADE OUT) ĐỂ KHÔNG BỊ CẮT NGANG
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)'
          }}
        >
           {/* NÉT ĐỨT TIMELINE (Background) */}
           {/* Mobile: Dọc giữa */}
           <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-l-[3px] border-dashed border-zinc-300 dark:border-zinc-800 z-0" />
           <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-0 w-full h-0.5 border-t-[3px] border-dashed border-zinc-400 dark:border-zinc-800 z-0" />

           {/* KHOẢNG CUỘN (Scroll Container) */}
           <div className="w-full h-full 
                          flex flex-col md:flex-row-reverse
                          overflow-y-auto md:overflow-y-hidden md:overflow-x-auto
                          snap-y md:snap-x snap-mandatory 
                          custom-scrollbar
                          px-4 md:px-[50vw] pb-40 md:pb-32 pt-8 md:pt-16 gap-12 md:gap-16 items-center relative z-10"
           >
              {monthsList.map((m) => (
                 <div key={`${m.year}-${m.month}`} className="relative snap-center shrink-0 flex justify-center items-center z-10 py-6 md:px-4">
                    
                    {/* DẤU CHẤM MỐC THỜI GIAN ĐỒNG BỘ Ở TRÊN CÙNG */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 border-4 border-slate-50 dark:border-[#0a0a0a] z-20 shadow-md flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    
                    <MonthCalendarBlock 
                      userId={user.id}
                      year={m.year}
                      month={m.month}
                      onImageClick={(id) => console.log('Mở bài đăng có ID:', id)}
                    />
                 </div>
              ))}
           </div>
        </div>

        {/* BOTTOM STATS FRAME (Đã hạ thấp xuống sát BottomNav) */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-40 pointer-events-none">
          <div className="bg-white/90 dark:bg-[#18181b]/95 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[24px] p-1.5 flex items-center pointer-events-auto">
            
            <div className="flex-1 flex flex-col items-center justify-center py-2.5 border-r border-zinc-200 dark:border-white/10">
               <ImageIcon className="w-5 h-5 text-blue-500 mb-1" />
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Đã đăng</span>
               {isLoading ? (
                 <div className="w-4 h-4 mt-1 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <span className="text-xl font-black text-zinc-900 dark:text-white leading-none mt-1">
                   {userProfile?.totalCheckins || 0}
                 </span>
               )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-2.5">
               <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse mb-1" />
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Chuỗi hiện tại</span>
               {isLoading ? (
                 <div className="w-4 h-4 mt-1 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <span className="text-xl font-black text-orange-600 dark:text-orange-400 leading-none mt-1">
                   {userProfile?.currentStreak || 0}
                 </span>
               )}
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default MemoryTimelinePage;