import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Camera, Box, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onJourneyClick?: () => void; // Đã chuyển thành optional vì giờ dùng NavLink
  triggerUpload: () => void;
  totalUnread?: number; 
  hasJourneyAlerts: boolean;
}

export const MobileBottomNav: React.FC<MobileNavProps> = ({ 
  triggerUpload, 
  hasJourneyAlerts 
}) => {
  return (
    <div className={cn(
      "fixed z-[100] bottom-0 left-0 w-full block md:hidden pointer-events-none",
      "bg-transparent flex items-end justify-center pb-4 pt-10"
    )}>
      
      <div className="flex items-center justify-between w-full max-w-[360px] px-6 pointer-events-auto">
        
        <NavButton to="/" icon={Home} />
        <NavButton to="/box" icon={Box} />

        {/* Nút Camera - Thiết kế phẳng, tinh tế */}
        <button
          onClick={triggerUpload}
          className={cn(
            "relative flex items-center justify-center w-14 h-14 rounded-full",
            "bg-white dark:bg-[#121212]",
            "border border-zinc-200 dark:border-white/10 shadow-sm",
            "hover:scale-105 active:scale-95 transition-all"
          )}
        >
          {/* Lõi bên trong */}
          <div className={cn(
            "w-[42px] h-[42px] flex items-center justify-center rounded-full",
            "bg-zinc-900 text-white dark:bg-white dark:text-black"
          )}>
            <Camera strokeWidth={2} className="w-5 h-5" />
          </div>
        </button>

        {/* [CẬP NHẬT] Nút Grid Hành trình (thay cho button click cũ) */}
        <NavLink 
          to="/journeys/grid"
          className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group"
        >
          {({ isActive }) => (
            <>
              <LayoutGrid 
                strokeWidth={isActive ? 2.5 : 2} 
                className={cn("w-6 h-6 transition-transform", isActive ? "text-zinc-900 dark:text-white scale-110" : "group-hover:scale-110")} 
              />
              {/* Chấm đỏ thông báo */}
              {hasJourneyAlerts && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-[#121212]" />
              )}
              {/* Chấm đen chỉ thị tab đang active */}
              {isActive && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-zinc-900 dark:bg-white rounded-full" />
              )}
            </>
          )}
        </NavLink>

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