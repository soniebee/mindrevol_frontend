import React, { useState } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
// Tạm ẩn Notification vì chưa cài module notification
// import { NotificationPanel } from './NotificationPanel';

interface NavigationProps {
  onCheckinClick: (file: File) => void;
  onJourneyClick: () => void;
  onSettingsClick?: () => void; 
  refreshTrigger?: number;
  
  isSidebarExpanded?: boolean;
  toggleSidebar?: () => void;
  setSidebarExpanded?: (expanded: boolean) => void; 
  hideBottomNav?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onCheckinClick, 
  onJourneyClick, 
  onSettingsClick, 
  isSidebarExpanded = true,
  toggleSidebar = () => {},
  hideBottomNav = false 
}) => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Mock data tạm thời để UI không bị vỡ
  const totalUnread = 0;
  const hasJourneyAlerts = false;

  const triggerUpload = () => {
     alert("Tính năng Checkin sẽ được cập nhật sau");
  };

  const handleNotificationClick = () => {
      alert("Tính năng Thông báo sẽ được cập nhật sau");
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
    totalUnread,
    hasJourneyAlerts,
    onSettingsClick 
  };

  return (
    <>
      {!hideBottomNav && (
          <MobileBottomNav {...viewProps} />
      )}
      
      <DesktopSidebar 
        {...viewProps} 
        isExpanded={isSidebarExpanded} 
        toggleSidebar={handleSidebarToggle} 
        onNotificationClick={handleNotificationClick} 
        isNotificationOpen={isNotificationPanelOpen}  
      />
    </>
  );
};