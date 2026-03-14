import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation'; 
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
      const saved = localStorage.getItem('sidebar_expanded');
      return saved !== null ? saved === 'true' : true;
  });

  const isHomePage = location.pathname === '/';
  const isChatPage = location.pathname.startsWith('/chat');
  const isProfilePage = location.pathname.startsWith('/profile');

  useEffect(() => {
      if (isChatPage || isProfilePage) {
          setIsSidebarExpanded(false);
      } else {
          const saved = localStorage.getItem('sidebar_expanded');
          setIsSidebarExpanded(saved !== null ? saved === 'true' : true);
      }
  }, [isChatPage, isProfilePage]);

  const handleToggleSidebar = () => {
      const newVal = !isSidebarExpanded;
      setIsSidebarExpanded(newVal);
      localStorage.setItem('sidebar_expanded', String(newVal)); 
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#fcfcfc] dark:bg-[#121212] text-zinc-900 dark:text-white font-sans relative flex transition-colors duration-300 ease-in-out">
      
      <Navigation 
        onCheckinClick={() => alert("Tính năng checkin sẽ được cập nhật sau")} 
        onJourneyClick={() => alert("Tính năng hành trình sẽ được cập nhật sau")}
        onSettingsClick={() => alert("Tính năng cài đặt sẽ được cập nhật sau")} 
        isSidebarExpanded={isSidebarExpanded}
        toggleSidebar={handleToggleSidebar} 
        setSidebarExpanded={setIsSidebarExpanded} 
        hideBottomNav={isChatPage}
      />

      <main className={cn(
        "relative w-full flex flex-col", 
        "transition-all duration-300 ease-in-out",
        isHomePage ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]",
        isChatPage ? "pb-0" : "pb-[72px] md:pb-0", 
        isSidebarExpanded ? "md:pl-[260px]" : "md:pl-[80px]"
      )}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;