import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Compass, Box, MessageCircle, Map as MapIcon, 
  Bell, PlusSquare, User, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  onJourneyClick?: () => void;
  triggerUpload?: () => void;
  totalUnread?: number;
  hasJourneyAlerts?: boolean;
  isExpanded: boolean;
  toggleSidebar: () => void;
  onNotificationClick: () => void;
  isNotificationOpen: boolean;
  onSettingsClick?: () => void; 
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  onJourneyClick,
  triggerUpload,
  totalUnread = 0,
  hasJourneyAlerts = false,
  isExpanded,
  toggleSidebar,
  onNotificationClick,
  isNotificationOpen,
  onSettingsClick 
}) => {
  return (
    <div className={cn(
      "fixed z-50 top-0 left-0 h-full transition-all duration-300 ease-in-out font-sans",
      "bg-white dark:bg-[#121212] border-r border-zinc-200 dark:border-white/10", 
      "flex flex-col py-8",
      isExpanded ? "w-[260px] px-5" : "w-[88px] px-3", 
      "hidden md:flex" 
    )}>
      
      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-12 w-8 h-8 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all z-50 shadow-sm active:scale-95"
      >
        {isExpanded ? <ChevronLeft className="w-5 h-5 ml-0.5" /> : <ChevronRight className="w-5 h-5 ml-1" />}
      </button>

      <div className={cn("mb-6 transition-all flex items-center", isExpanded ? "px-3 justify-start" : "justify-center")}>
        <span className="text-[28px] font-normal text-black dark:text-white tracking-wide select-none" style={{ fontFamily: '"Jua", sans-serif' }}>
          {isExpanded ? "MindRevol" : "M."}
        </span>
      </div>

      <div className="w-full h-px bg-zinc-200 dark:bg-white/10 mb-6 shrink-0" />

      <div className="flex-1 flex flex-col gap-1.5">
        <DesktopNavItem to="/" icon={Home} label="Home" isExpanded={isExpanded} />
        
        <button 
          onClick={onJourneyClick}
          className={cn(
            "flex items-center rounded-[16px] transition-all group relative border border-transparent",
            isExpanded ? "w-full gap-4 px-4 py-3 justify-start" : "w-full px-0 py-3 justify-center",
            "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-[0.98]"
          )}
        >
          <Compass className="w-6 h-6 transition-transform group-hover:scale-110 shrink-0" strokeWidth={2} />
          {isExpanded && <span className="font-normal text-[17px] whitespace-nowrap tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>Journeys</span>}
          {hasJourneyAlerts && (
            <span className={cn("absolute bg-red-500 rounded-full", isExpanded ? "right-4 w-2.5 h-2.5" : "top-2.5 right-[12px] w-2.5 h-2.5")} />
          )}
        </button>

        <DesktopNavItem to="/box" icon={Box} label="Box" isExpanded={isExpanded} />
        <DesktopNavItem to="/chat" icon={MessageCircle} label="Messages" badge={totalUnread} isExpanded={isExpanded} />
        
        <button 
          onClick={onNotificationClick}
          className={cn(
            "flex items-center rounded-[16px] transition-all relative group border",
            isExpanded ? "w-full gap-4 px-4 py-3 justify-start" : "w-full px-0 py-3 justify-center",
            isNotificationOpen 
              ? "bg-zinc-100 dark:bg-white/10 text-black dark:text-white border-transparent" 
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-[0.98]"
          )}
        >
          <Bell className={cn("w-6 h-6 transition-transform shrink-0", isNotificationOpen ? "scale-105" : "group-hover:scale-110")} strokeWidth={isNotificationOpen ? 2.5 : 2} />
          {isExpanded && <span className="font-normal text-[17px] whitespace-nowrap tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>Notifications</span>}
        </button>

        {/* Nút Đăng bài */}
        <button 
            onClick={triggerUpload}
            className={cn(
                "flex items-center rounded-[16px] transition-all group border border-transparent mt-1",
                isExpanded ? "w-full gap-4 px-4 py-3 justify-start" : "w-full px-0 py-3 justify-center",
                "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-[0.98]"
            )}
        >
            <PlusSquare className="w-6 h-6 transition-transform group-hover:scale-110 shrink-0" strokeWidth={2} />
            {isExpanded && <span className="font-normal text-[17px] whitespace-nowrap tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>Post</span>}
        </button>

        <DesktopNavItem to="/profile" icon={User} label="Profile" isExpanded={isExpanded} />
      </div>

      <div className="mt-auto pt-4 shrink-0 border-t border-zinc-200 dark:border-white/10">
        <button 
          onClick={onSettingsClick}
          className={cn(
            "flex items-center rounded-[16px] transition-all relative group border border-transparent w-full",
            isExpanded ? "px-4 py-3 gap-4 justify-start" : "px-0 py-3 justify-center",
            "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-[0.98]"
          )}
        >
          <Settings className="w-6 h-6 transition-transform shrink-0 group-hover:scale-110" strokeWidth={2} />
          {isExpanded && <span className="font-normal text-[17px] whitespace-nowrap tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>Settings</span>}
        </button>
      </div>
    </div>
  );
};

const DesktopNavItem = ({ to, icon: Icon, label, badge, isExpanded }: any) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center rounded-[16px] transition-all relative group border",
        isExpanded ? "px-4 py-3 gap-4 justify-start" : "px-0 py-3 justify-center",
        isActive 
          ? "bg-zinc-100 dark:bg-white/10 text-black dark:text-white border-transparent" 
          : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-[0.98]"
      )}
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("w-6 h-6 transition-transform shrink-0", isActive ? "scale-105" : "group-hover:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
          {isExpanded && <span className="font-normal text-[17px] whitespace-nowrap tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>{label}</span>}
          {badge > 0 && isExpanded && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge > 99 ? '99+' : badge}</span>}
          {badge > 0 && !isExpanded && <span className="absolute top-2.5 right-[12px] w-2.5 h-2.5 bg-red-500 rounded-full" />}
        </>
      )}
    </NavLink>
);