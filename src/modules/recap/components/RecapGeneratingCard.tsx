import React from 'react';
import { Film, Sparkles } from 'lucide-react';

export const RecapGeneratingCard: React.FC = () => {
  return (
    <div className="aspect-[9/16] rounded-[24px] md:rounded-[32px] overflow-hidden relative shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5 bg-[#F4EBE1] dark:bg-[#1A1A1A]">
      {/* Nền gradient pastel xoay vòng mượt mà */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200/40 via-yellow-100/40 to-blue-200/40 dark:from-pink-900/20 dark:via-yellow-900/20 dark:to-blue-900/20 animate-pulse"></div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-[2px]">
        <div className="w-16 h-16 bg-white/60 dark:bg-[#2B2A29]/60 rounded-full flex items-center justify-center mb-4 relative shadow-sm border border-white/50 dark:border-white/10">
          <Film className="w-8 h-8 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2} />
          {/* Vòng quay mini báo loading */}
          <svg className="absolute inset-0 w-full h-full animate-spin text-amber-400" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="70 200" strokeLinecap="round" />
          </svg>
        </div>
        
        <span className="text-[1.05rem] font-black text-[#1A1A1A] dark:text-white mb-1">
          Đang gom kỷ niệm
        </span>
        <span className="text-[0.8rem] font-bold text-[#8A8580] dark:text-[#A09D9A] flex items-center gap-1">
          <Sparkles size={14} className="animate-pulse text-amber-500" />
          Đợi một chút nhé...
        </span>
      </div>
    </div>
  );
};