import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import { useChatStore } from '@/modules/chat/store/useChatStore';
// import { journeyService } from "@/modules/journey/services/journey.service";

import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { NotificationPanel } from './NotificationPanel';

interface NavigationProps {
  onCheckinClick: (file: File) => void;
  onJourneyClick: () => void;
  onSettingsClick?: () => void; 
  refreshTrigger?: number;
  
  isSidebarExpanded?: boolean;
  toggleSidebar?: () => void;
  setSidebarExpanded?: (expanded: boolean) => void; 
  hideBottomNav?: boolean; // [THÊM MỚI] 
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onCheckinClick, 
  onJourneyClick, 
  onSettingsClick, 
  refreshTrigger,
  isSidebarExpanded = true,
  toggleSidebar = () => {},
  setSidebarExpanded,
  hideBottomNav = false // [THÊM MỚI] Giá trị mặc định
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // const conversations = useChatStore((state) => state.conversations);
  // const totalUnread = useMemo(() => {
  //   return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  // }, [conversations]);

  const [hasJourneyAlerts, setHasJourneyAlerts] = useState(false);
  const checkJourneyAlerts = async () => {
    try {
      // const data = await journeyService.getAlerts();
      // const hasAlert = (data.journeyPendingInvitations > 0) || (data.waitingApprovalRequests > 0);
      // setHasJourneyAlerts(hasAlert);
    } catch (error) {
      console.error("Failed to check journey alerts", error);
    }
  };

  useEffect(() => {
    checkJourneyAlerts();
    const interval = setInterval(checkJourneyAlerts, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCheckinClick(file);
    e.target.value = ''; 
  };
  const triggerUpload = () => fileInputRef.current?.click();

  const handleNotificationClick = () => {
      if (!isNotificationPanelOpen) {
          setIsNotificationPanelOpen(true);
          if (setSidebarExpanded) {
              setSidebarExpanded(false); 
          }
      } else {
          setIsNotificationPanelOpen(false);
          const isChatPage = location.pathname.startsWith('/chat');
          const isProfilePage = location.pathname.startsWith('/profile');
          if (!isChatPage && !isProfilePage && setSidebarExpanded) {
              const saved = localStorage.getItem('sidebar_expanded');
              if (saved === 'true') {
                  setSidebarExpanded(true); 
              }
          }
      }
  };

  const handleSidebarToggle = () => {
if (!isSidebarExpanded) {
          setIsNotificationPanelOpen(false); 
      }
      toggleSidebar(); 
  };

  const viewProps = {
    onJourneyClick,
    triggerUpload,
    // totalUnread,
    hasJourneyAlerts,
    onSettingsClick 
  };

  return (
    <>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      {/* [SỬA LẠI ĐOẠN NÀY] Chỉ render thanh bottom nav nếu không bị yêu cầu ẩn */}
      {/* {!hideBottomNav && (
          <MobileBottomNav {...viewProps} />
      )} */}
      
      <DesktopSidebar 
        {...viewProps} 
        isExpanded={isSidebarExpanded} 
        toggleSidebar={handleSidebarToggle} 
        onNotificationClick={handleNotificationClick} 
        isNotificationOpen={isNotificationPanelOpen}  
      />

      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => {
            setIsNotificationPanelOpen(false);
            const isChatPage = location.pathname.startsWith('/chat');
            const isProfilePage = location.pathname.startsWith('/profile');
            if (!isChatPage && !isProfilePage && setSidebarExpanded) {
                const saved = localStorage.getItem('sidebar_expanded');
                if (saved === 'true') {
                    setSidebarExpanded(true);
                }
            }
        }}
      />
    </>
  );
};