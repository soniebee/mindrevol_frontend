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
  const { user } = useAuth();
  
  // Các state quản lý việc đóng/mở Modal
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);

  return (
    <>
      {/* Bỏ mb-4 nếu bạn muốn phần nền dưới nối liền khối mượt mà hơn với nội dung trang */}
      <div className="relative w-full h-[300px] block lg:hidden font-quicksand">
        
        {/* 1. KHU VỰC BANNER VỚI BACKGROUND */}
        <div 
            // FIX: Đổi bg-center thành bg-top để neo ảnh từ mép trên cùng
            className="absolute top-0 left-0 w-full h-full overflow-hidden bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: "url('/bg (1).jpeg')" }}
        >
          {/* Lớp phủ đen mờ */}
          <div className="absolute inset-0 bg-black/15 dark:bg-black/50 backdrop-blur-[0px]"></div>

          {/* Ghim chiều cao phần chứa text là 200px */}
          <div className="relative z-10 w-full h-[200px] flex flex-col items-start justify-center pt-2 px-8">
            <div className="relative ml-2 mb-2"> 
              {/* ... Icon và Text giữ nguyên ... */}
              <Star4 className="absolute -top-3 -left-5 w-6 h-6 text-white animate-pulse drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]" />
              <Star4 className="absolute -bottom-2 -right-8 w-6 h-6 text-white/80 animate-pulse delay-75 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" />
              <Star4 className="absolute top-1 -right-10 w-4 h-4 text-white/60 animate-pulse delay-150 drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" />
              
              <h1 className="text-white text-[2.6rem] font-black tracking-tight text-left drop-shadow-xl leading-none">
                Mindrevol
              </h1>
            </div>
            
            <p className="text-white/90 text-[0.95rem] font-bold mt-1 text-left max-w-[280px] leading-relaxed drop-shadow-md ml-2">
              Lưu giữ những kỷ niệm đẹp nhất cùng người thân yêu.
            </p>
          </div>
        </div>

        {/* 2. KHỐI NỀN TRẮNG/ĐEN BO TRÒN BÊN DƯỚI */}
        <div className="absolute bottom-0 left-0 w-full h-[120px] bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A] rounded-t-[40px] z-10 transition-colors duration-500 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]" />

        {/* 3. BỘ 4 NÚT HÀNH ĐỘNG NỔI */}
        <div className="absolute bottom-10 left-0 w-full flex justify-between sm:justify-center sm:gap-8 z-20 px-8 sm:px-0">
          
          <button 
            onClick={() => setIsNotifOpen(true)} 
            className="w-[64px] h-[64px] rounded-[24px] bg-white/90 dark:bg-[#2B2A29]/90 backdrop-blur-md border border-white/50 dark:border-[#3A3734] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#1A1A1A] dark:text-white relative transition-all active:scale-90 hover:-translate-y-1"
          >
            <Bell size={26} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A]" />
            <span className="absolute top-3 right-3.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#2B2A29] shadow-sm animate-pulse" />
          </button>

          <button 
            onClick={() => navigate('/chat')} 
            className="w-[64px] h-[64px] rounded-[24px] bg-white/90 dark:bg-[#2B2A29]/90 backdrop-blur-md border border-white/50 dark:border-[#3A3734] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#1A1A1A] dark:text-white transition-all active:scale-90 hover:-translate-y-1"
          >
            <MessageCircle size={26} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A]" />
          </button>

          <button 
            onClick={() => setIsFriendsOpen(true)} 
            className="w-[64px] h-[64px] rounded-[24px] bg-white/90 dark:bg-[#2B2A29]/90 backdrop-blur-md border border-white/50 dark:border-[#3A3734] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#1A1A1A] dark:text-white transition-all active:scale-90 hover:-translate-y-1"
          >
            <Users size={26} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A]" />
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="w-[64px] h-[64px] rounded-[24px] bg-white/90 dark:bg-[#2B2A29]/90 backdrop-blur-md border border-white/50 dark:border-[#3A3734] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#1A1A1A] dark:text-white transition-all active:scale-90 hover:-translate-y-1"
          >
            <Settings size={26} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A]" />
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