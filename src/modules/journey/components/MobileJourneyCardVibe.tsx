import React from 'react';
import { UserActiveJourneyResponse } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Clock, Image as ImageIcon } from 'lucide-react';

interface MobileJourneyCardProps {
  journey: UserActiveJourneyResponse;
  onClick?: () => void;
  className?: string;
}

export const MobileJourneyCardVibe: React.FC<MobileJourneyCardProps> = ({ journey, onClick, className }) => {
  const hasImage = !!journey.thumbnailUrl;
  const themeColor = journey.themeColor || '#3b82f6'; 
  const avatarEmoji = journey.avatar || '🚀';
  const isFinished = journey.daysRemaining === 0;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 cursor-pointer group transition-all duration-300 active:scale-95",
        "w-full aspect-[4/3] rounded-[2rem] overflow-hidden border",
        "bg-zinc-100 dark:bg-zinc-900 shadow-[0_12px_24px_rgba(0,0,0,0.15)]",
        className 
      )}
      style={{ borderColor: `${themeColor}50` }}
    >
      
      {/* --- TẦNG 1: ẢNH THUMBNAIL (Sạch sẽ, bao phủ trọn vẹn) --- */}
      <div className="absolute inset-0 w-full h-full z-0 bg-zinc-900">
        {hasImage ? (
            <img 
                src={journey.thumbnailUrl} 
                alt={journey.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95" 
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105">
                <ImageIcon className="w-10 h-10 text-white/20 mb-2" strokeWidth={1.5} />
            </div>
        )}
      </div>

      {/* Lớp phủ mờ nhẹ ở đáy để đảm bảo chữ luôn đọc được */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

      {/* =========================================================
          TẦNG 2: VECTOR CHẤT LỎNG / MỰC ĐẶC (CUSTOM BEZIER CURVES)
          ========================================================= */}
          
      {/* 1. Mực chảy từ trên xuống (Drip Effect) */}
      {/* Tính toán tạo hình "cổ hẹp - đáy phình to" mô phỏng trọng lực hút giọt mực */}
      <svg 
        viewBox="0 0 120 90" 
        preserveAspectRatio="xMinYMin meet"
        className="absolute top-0 left-[-2px] w-[45%] h-auto z-10 drop-shadow-[2px_4px_6px_rgba(0,0,0,0.4)] pointer-events-none"
      >
        <path 
          d="
            M 0 0 
            L 120 0 
            C 115 5, 115 15, 110 15 
            C 100 15, 105 35, 95 35 
            C 85 35, 90 10, 80 10 
            C 75 10, 78 45, 75 55 
            C 72 65, 80 75, 70 75 
            C 60 75, 68 65, 65 55 
            C 62 45, 65 10, 55 10 
            C 45 10, 50 65, 45 75 
            C 40 85, 52 95, 38 95 
            C 24 95, 35 85, 30 75 
            C 25 65, 30 10, 20 10 
            C 15 10, 18 35, 15 45 
            C 12 55, 20 65, 10 65 
            C 0 65, 8 55, 5 45 
            C 2 35, 5 10, 0 10 
            Z
          " 
          fill={themeColor} 
          fillOpacity="0.95"
        />
      </svg>

      {/* 2. Mực đọng dưới đáy (Puddle Effect) */}
      {/* Hình dáng bất đối xứng, có những vũng mực dày và những mảng dẹt */}
      <svg 
        viewBox="0 0 400 80" 
        preserveAspectRatio="none" 
        className="absolute bottom-[-2px] left-0 w-full h-[55px] z-10 drop-shadow-[0_-4px_8px_rgba(0,0,0,0.3)] pointer-events-none"
      >
        <path 
          d="
            M 0 80 
            L 400 80 
            L 400 70 
            C 360 70, 350 20, 310 20 
            C 270 20, 260 65, 220 65 
            C 180 65, 170 35, 130 35 
            C 90 35, 80 70, 40 70 
            C 20 70, 10 50, 0 50 
            Z
          " 
          fill={themeColor} 
          fillOpacity="0.95"
        />
      </svg>
      {/* ========================================================= */}


      {/* --- TẦNG 3: NỘI DUNG CHỮ & ICON --- */}
      
      {/* Icon Emoji nằm khéo léo lọt vào vũng mực to nhất ở góc trái */}
      <div className="absolute top-2 left-3 w-10 h-10 flex items-center justify-center text-[22px] drop-shadow-lg z-20 transition-transform duration-300 group-hover:scale-110">
        {avatarEmoji}
      </div>

      {/* Nội dung chính ở đáy */}
      <div className="absolute bottom-0 left-0 w-full px-4 pb-3 pt-6 flex flex-col justify-end z-20 gap-2">
        
        {/* Tên hành trình */}
        <h3 className="text-white font-extrabold text-[15px] leading-snug line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {journey.name}
        </h3>

        {/* Avatars và Trạng thái */}
        <div className="flex items-center justify-between w-full">
            
            {/* Avatars xếp chồng */}
            <div className="flex items-center -space-x-1.5">
                {journey.memberAvatars?.slice(0, 4).map((url, idx) => (
                    <Avatar key={idx} className="w-6 h-6 border-[1.5px] border-white/90 shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                        <AvatarImage src={url || undefined} />
                        <AvatarFallback className="text-[7px] bg-zinc-800 text-white">U</AvatarFallback>
                    </Avatar>
                ))}
                {journey.totalMembers > 4 && (
                    <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-md border-[1.5px] border-white/90 flex items-center justify-center text-[9px] text-white font-bold shadow-md">
                        +{journey.totalMembers - 4}
                    </div>
                )}
            </div>

            {/* Nhãn Trạng thái */}
            <div 
              className={cn(
                "text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center justify-center gap-1 shadow-[0_4px_8px_rgba(0,0,0,0.3)] border",
                isFinished ? "bg-zinc-600/90 border-zinc-400" : "bg-black/30 backdrop-blur-md border-white/40"
              )}
            >
               <Clock className="w-3 h-3 text-white drop-shadow-sm" />
               <span className="text-white drop-shadow-sm truncate">
                 {isFinished ? 'Kết thúc' : `${journey.daysRemaining} ngày`}
               </span>
            </div>
        </div>
      </div>
      
    </div>
  );
};