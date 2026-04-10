import React, { useMemo, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { Flame, CalendarDays, Image as ImageIcon } from 'lucide-react';
import { useProfileData } from '../hooks/useProfileData';
import { MonthCalendarBlock } from '../components/profile/MonthCalendarBlock';

// Tạo danh sách tháng từ CŨ NHẤT đến MỚI NHẤT (để tháng mới lọt sang bên phải cùng)
const generateMonthsFromDate = (startDateStr?: string) => {
  const result = [];
  const end = new Date();
  const max = new Date(end.getFullYear(), end.getMonth(), 1);
  
  const start = startDateStr ? new Date(startDateStr) : new Date(end.getFullYear(), end.getMonth() - 6, 1);
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  let safety = 0;
  while (current <= max && safety < 100) {
    result.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
    safety++;
  }
  return result;
};

const MemoryTimelinePage = () => {
  const { user } = useAuth();
  const { userProfile, isLoading } = useProfileData(user?.id, false);
  
  // Cắm mốc ở cuối danh sách
  const endOfListRef = useRef<HTMLDivElement>(null);
  
  const monthsList = useMemo(() => generateMonthsFromDate(userProfile?.createdAt), [userProfile?.createdAt]);

  // Cuộn chính xác đến phần tử cuối cùng (Tháng mới nhất)
  useEffect(() => {
    const timer = setTimeout(() => {
        endOfListRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            inline: 'end', // Cuộn ngang tới tận cùng bên phải trên Desktop
            block: 'end'   // Cuộn dọc tới tận cùng bên dưới trên Mobile
        });
    }, 300); // Tăng delay lên 300ms để DOM render xong hoàn toàn 100%
    return () => clearTimeout(timer);
  }, [monthsList]);

  if (!user) return null;

  return (
    <MainLayout>
      <div className="w-full h-[calc(100dvh-64px)] md:h-[100dvh] bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A] transition-colors duration-500 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <div className="shrink-0 px-4 pt-6 md:pt-12 pb-2 text-center z-20 relative">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-[16px] bg-white/60 dark:bg-[#2B2A29]/60 backdrop-blur-md flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-white/50 dark:border-white/5">
                <CalendarDays className="w-6 h-6 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[1.6rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">
              Hành Trình Ký Ức
            </span>
          </div>
          <p className="text-[#8A8580] dark:text-[#A09D9A] text-[1.05rem] mt-3 font-semibold">
             Lưu giữ từng khoảnh khắc của bạn
          </p>
        </div>

        {/* TIMELINE VIEW */}
        <div 
          className="flex-1 w-full relative min-h-0"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
          }}
        >
           {/* NÉT ĐỨT TIMELINE (Chỉ hiện Mobile, đã tắt Desktop) */}
           <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] border-l-[3px] border-dashed border-[#D6CFC7] dark:border-[#2B2A29] z-0" />

           {/* KHOẢNG CUỘN (Scroll Container) */}
           <div className="w-full h-full 
                          flex flex-col md:flex-row
                          overflow-y-auto md:overflow-x-auto md:overflow-y-hidden
                          custom-scrollbar
                          px-4 md:px-8 pb-40 md:pb-48 pt-8 md:pt-4 gap-12 md:gap-10 
                          items-center md:items-start relative z-10"
           >
              {monthsList.map((m) => (
                 <div key={`${m.year}-${m.month}`} className="relative shrink-0 flex justify-center items-start z-10 py-6 md:py-2 md:px-2">
                    
                    {/* DẤU CHẤM MỐC THỜI GIAN (Chỉ hiện Mobile) */}
                    <div className="md:hidden absolute -top-6 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#1A1A1A] dark:bg-white border-[6px] border-[#F4EBE1] dark:border-[#121212] z-20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-white dark:bg-[#1A1A1A] rounded-full" />
                    </div>
                    
                    <MonthCalendarBlock 
                      userId={user.id}
                      year={m.year}
                      month={m.month}
                      onImageClick={(id) => console.log('Mở bài đăng có ID:', id)}
                    />
                 </div>
              ))}
              
              {/* ĐÂY CHÍNH LÀ PHẦN TỬ CẮM CHỐT ĐỂ CUỘN TỚI */}
              <div ref={endOfListRef} className="w-1 h-1 md:w-8 md:h-10 shrink-0 opacity-0 pointer-events-none">.</div>
           </div>
        </div>

        {/* BOTTOM STATS FRAME */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-40 pointer-events-none">
          <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-[32px] p-2 flex items-center pointer-events-auto overflow-hidden">
            
            <div className="flex-1 flex flex-col items-center justify-center py-3 border-r border-[#D6CFC7]/50 dark:border-[#2B2A29]">
               <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center mb-2">
                   <ImageIcon className="w-5 h-5 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
               </div>
               <span className="text-[0.75rem] font-extrabold text-[#8A8580] uppercase tracking-widest">Đã đăng</span>
               {isLoading ? (
                 <div className="w-5 h-5 mt-1 border-[3px] border-[#1A1A1A] dark:border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <span className="text-[1.6rem] font-black text-[#1A1A1A] dark:text-white leading-none mt-1 tracking-tight">
                   {userProfile?.totalCheckins || 0}
                 </span>
               )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-3">
               <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-[14px] flex items-center justify-center mb-2">
                   <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" strokeWidth={2.5} />
               </div>
               <span className="text-[0.75rem] font-extrabold text-[#8A8580] uppercase tracking-widest">Chuỗi hiện tại</span>
               {isLoading ? (
                 <div className="w-5 h-5 mt-1 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <span className="text-[1.6rem] font-black text-orange-600 dark:text-orange-400 leading-none mt-1 tracking-tight">
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