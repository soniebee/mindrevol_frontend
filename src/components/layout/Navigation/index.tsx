import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatStore } from '@/modules/chat/store/useChatStore';
import { journeyService } from "@/modules/journey/services/journey.service";
import { toast } from 'react-hot-toast'; 

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
  hideBottomNav?: boolean; 
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onCheckinClick, 
  onJourneyClick, 
  onSettingsClick, 
  refreshTrigger,
  isSidebarExpanded = true,
  toggleSidebar = () => {},
  setSidebarExpanded,
  hideBottomNav = false 
}) => {
  
  // [QUAN TRỌNG] Đây là Ref duy nhất cho Input file
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const totalUnread = useMemo(() => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  }, [conversations]);

  const [hasJourneyAlerts, setHasJourneyAlerts] = useState(false);
  const checkJourneyAlerts = async () => {
    try {
      const data = await journeyService.getAlerts();
      const hasAlert = (data.journeyPendingInvitations > 0) || (data.waitingApprovalRequests > 0);
      setHasJourneyAlerts(hasAlert);
    } catch (error) {
      console.error("Failed to check journey alerts", error);
    }
  };

  useEffect(() => {
    checkJourneyAlerts();
    const interval = setInterval(checkJourneyAlerts, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // HÀM XỬ LÝ FILE (Nhận cả Ảnh và Video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (isImage || isVideo) {
        // Kiểm tra dung lượng video (dưới 10MB)
        if (isVideo && file.size > 10 * 1024 * 1024) {
            toast.error("Video quá lớn. Vui lòng chọn clip dưới 10MB (khoảng 3-5 giây).");
            e.target.value = '';
            return;
        }
        // Gửi file lên MainLayout
        onCheckinClick(file);
    } else {
        toast.error("Vui lòng chọn định dạng ảnh hoặc video phù hợp.");
    }
    
    // Reset để có thể chọn lại file cũ nếu muốn
    e.target.value = ''; 
  };

  // Hàm "nhấn hộ" vào thẻ input ẩn
  const triggerUpload = () => {
      fileInputRef.current?.click();
  };

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
    triggerUpload, // Truyền cái búa xuống
    totalUnread,
    hasJourneyAlerts,
    onSettingsClick 
  };

  return (
    <>
      {/* THẺ INPUT ẨN DUY NHẤT Ở ĐÂY */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,video/*" 
        onChange={handleFileChange} 
      />
      
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