import React from 'react';
import { Flame, Images, ArrowRight } from 'lucide-react';

export const MobileStatsPanel = () => {
  // DỮ LIỆU GIẢ LẬP (MOCK DATA)
  const currentStreak = 14; 
  const unsortedPosts = 5;  

  return (
    <div className="w-full flex flex-col px-4 pt-2 pb-6 shrink-0 bg-transparent z-20">
      
      {/* TIÊU ĐỀ BÊN TRÁI */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-foreground text-lg font-bold drop-shadow-sm">
          Hoạt động
        </h2>
      </div>

      {/* KHUNG CHỨA 2 Ô (BENTO BOX STYLE) */}
      <div className="grid grid-cols-2 gap-4 w-full">
        
        {/* 1. Ô BÊN TRÁI: CHUỖI NGÀY (Lửa Gradient) */}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-orange-400 to-red-500 p-4 shadow-lg text-white group cursor-pointer active:scale-95 transition-all">
           
           {/* Icon in chìm khổng lồ làm nền */}
           <Flame className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 pointer-events-none" />
           
           <div className="relative z-10 flex flex-col h-full justify-between">
               {/* Nhãn kính mờ */}
               <div className="flex items-center gap-1.5 mb-3 bg-white/20 w-fit px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                   <Flame className="w-3.5 h-3.5 text-orange-100" />
                   <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
                     Chuỗi ngày
                   </span>
               </div>
               
               {/* Con số */}
               <div className="flex items-baseline gap-1.5">
                   <span className="text-4xl font-black tracking-tighter drop-shadow-md">
                     {currentStreak}
                   </span>
                   <span className="text-xs font-semibold text-orange-100 uppercase tracking-widest">
                     Ngày
                   </span>
               </div>
           </div>
        </div>

        {/* 2. Ô BÊN PHẢI: ALBUM CHƯA PHÂN LOẠI (Biển Gradient) */}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-blue-600 p-4 shadow-lg text-white group cursor-pointer active:scale-95 transition-all">
           
           {/* Icon in chìm khổng lồ làm nền */}
           <Images className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none" />
           
           <div className="relative z-10 flex flex-col h-full justify-between">
               {/* Nhãn kính mờ */}
               <div className="flex items-center gap-1.5 mb-3 bg-white/20 w-fit px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                   <Images className="w-3.5 h-3.5 text-blue-100" />
                   <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
                     Sắp xếp sau
                   </span>
               </div>
               
               {/* Con số */}
               <div className="flex items-baseline gap-1.5">
                   <span className="text-4xl font-black tracking-tighter drop-shadow-md">
                     {unsortedPosts}
                   </span>
                   <span className="text-xs font-semibold text-blue-100 uppercase tracking-widest">
                     Bản ghi
                   </span>
               </div>
           </div>
        </div>

      </div>

    </div>
  );
};