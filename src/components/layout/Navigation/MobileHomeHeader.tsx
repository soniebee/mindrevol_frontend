import React, { useState } from 'react';
import { MessageCircle, Users, Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import các Modal và Auth
import { NotificationPanel } from './NotificationPanel';
import { SettingsModal } from '@/modules/user/components/SettingsModal';
import { FriendsModal } from '@/modules/user/components/FriendsModal';
import { useAuth } from '@/modules/auth/store/AuthContext';

// Component Icon Ngôi sao 4 cánh
const Star4 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 0C12 0 12 10.5 24 12C12 13.5 12 24 12 24C12 24 12 13.5 0 12C12 10.5 12 0 12 0Z" />
  </svg>
);

export const MobileHomeHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin user hiện tại để truyền vào FriendsModal
  
  // Các state quản lý việc đóng/mở Modal
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);

  return (
    <>
      <div className="relative w-full h-[280px] block md:hidden mb-2">
        
        {/* 1. KHU VỰC BANNER PHÍA TRÊN */}
        <div className="absolute top-0 left-0 w-full h-[200px] overflow-hidden bg-white dark:bg-[#1a1a1a]">
          <div className="absolute -top-[50px] -right-[50px] w-[250px] h-[250px] bg-amber-300/40 dark:bg-amber-500/15 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-[80px] -left-[50px] w-[200px] h-[200px] bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-2 px-6">
            <div className="relative">
              <Star4 className="absolute -top-4 -left-8 w-6 h-6 text-amber-400 animate-pulse" />
              <Star4 className="absolute -bottom-2 -right-6 w-5 h-5 text-blue-400 animate-pulse delay-75" />
              <Star4 className="absolute top-1 -right-8 w-3 h-3 text-orange-300 animate-pulse delay-150" />
              
              <h1 className="text-zinc-900 dark:text-white text-[38px] font-normal tracking-wide text-center" style={{ fontFamily: '"Jua", sans-serif' }}>
                MindRevol
              </h1>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-[13px] font-medium mt-2 text-center max-w-[260px] leading-relaxed">
              Nơi lưu giữ những kỷ niệm đẹp nhất của bạn và những người thân yêu.
            </p>
          </div>
        </div>

        {/* 2. KHỐI BO TRÒN BÊN DƯỚI */}
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-slate-50 dark:bg-[#121212] rounded-t-[32px] z-10 transition-colors duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_-4px_10px_rgba(255,255,255,0.01)]" />

        {/* 3. BỘ 4 NÚT HÀNH ĐỘNG NỔI */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center gap-4 z-20 px-4">
          
          {/* Nút Thông báo -> Mở NotificationPanel */}
          <button 
            onClick={() => setIsNotifOpen(true)} 
            className="w-[52px] h-[52px] rounded-[18px] bg-amber-100 dark:bg-amber-900/30 backdrop-blur-md flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm transition-transform active:scale-95 relative"
          >
            <Bell size={22} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-amber-100 dark:border-zinc-800" />
          </button>

          {/* Nút Nhắn tin -> Chuyển trang Chat */}
          <button 
            onClick={() => navigate('/chat')} 
            className="w-[52px] h-[52px] rounded-[18px] bg-blue-100 dark:bg-blue-900/30 backdrop-blur-md flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm transition-transform active:scale-95"
          >
            <MessageCircle size={22} />
          </button>

          {/* Nút Bạn bè -> Mở FriendsModal */}
          <button 
            onClick={() => setIsFriendsOpen(true)} 
            className="w-[52px] h-[52px] rounded-[18px] bg-green-100 dark:bg-green-900/30 backdrop-blur-md flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm transition-transform active:scale-95"
          >
            <Users size={22} />
          </button>

          {/* Nút Cài đặt -> Mở SettingsModal */}
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="w-[52px] h-[52px] rounded-[18px] bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm transition-transform active:scale-95"
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      {/* --- PHẦN RENDER CÁC MODAL --- */}
      <NotificationPanel 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {isFriendsOpen && user && (
        <FriendsModal 
          isOpen={true} 
          userId={user.id} 
          onClose={() => setIsFriendsOpen(false)} 
        />
      )}
    </>
  );
};