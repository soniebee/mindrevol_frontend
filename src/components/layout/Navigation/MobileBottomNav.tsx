import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, User, Camera, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onJourneyClick: () => void;
  triggerUpload: () => void;
  totalUnread: number; 
  hasJourneyAlerts: boolean;
}

export const MobileBottomNav: React.FC<MobileNavProps> = ({ 
  onJourneyClick, 
  triggerUpload, 
  hasJourneyAlerts 
}) => {
  return (
    <div className={cn(
      "fixed z-[100] bottom-0 left-0 w-full block md:hidden pointer-events-none",
      // [ĐÃ SỬA] Bỏ nền Gradient hoàn toàn, làm thanh nav trong suốt
      "bg-transparent flex items-end justify-center pb-4 pt-10" // pt-10 tạo không gian để nút tròn lồi lên
    )}>
      
      <div className="flex items-center justify-between w-full max-w-[360px] px-6 pointer-events-auto">
        
        {/* 1. Trang chủ */}
        <NavButton to="/" icon={Home} />
        
        {/* 2. Box */}
        <NavButton to="/box" icon={Box} />

        {/* 3. Nút Upload */}
        <button
          onClick={triggerUpload}
          className={cn(
            // [ĐÃ SỬA] Bỏ -translate-y-2 để tránh nó nhảy vọt lên cao bị cắt
            "w-14 h-14 rounded-full flex items-center justify-center",
            "bg-zinc-900 text-white dark:bg-white dark:text-black",
            "shadow-xl hover:scale-105 active:scale-95 transition-all",
            // Đổ viền trong suốt hoặc trùng màu nền nhẹ
            "border-[3px] border-zinc-100/50 dark:border-black/50 backdrop-blur-sm"
          )}
        >
          <Camera strokeWidth={2.5} className="w-6 h-6" />
        </button>

        {/* 4. Hành trình */}
        <button 
          onClick={onJourneyClick} 
          className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group"
        >
           <Map strokeWidth={2} className="w-6 h-6 group-hover:scale-110 transition-transform" />
           {hasJourneyAlerts && (
             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-[#121212]" />
           )}
        </button>

        {/* 5. Profile */}
        <NavButton to="/profile" icon={User} />
      </div>
    </div>
  );
};

const NavButton = ({ to, icon: Icon }: any) => (
  <NavLink to={to} className="relative p-2 text-zinc-500 dark:text-zinc-400 transition-colors">
    {({ isActive }) => (
      <>
        <Icon 
          strokeWidth={isActive ? 2.5 : 2} 
          className={cn("w-6 h-6 transition-transform", isActive ? "text-zinc-900 dark:text-white scale-110" : "hover:text-zinc-900 dark:hover:text-white")} 
        />
        {isActive && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-zinc-900 dark:bg-white rounded-full" />
        )}
      </>
    )}
  </NavLink>
);