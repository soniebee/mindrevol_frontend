import React from 'react';
import { UserActiveJourneyResponse } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Clock, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // Import hook theme

interface JourneyCardProps {
  journey: UserActiveJourneyResponse;
  onClick?: () => void;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey, onClick }) => {
  const hasImage = !!journey.thumbnailUrl;
  const { theme } = useTheme(); // Lấy trạng thái theme hiện tại
  
  // Lấy dữ liệu màu sắc & icon 
  const themeColor = journey.themeColor || '#3b82f6'; 
  const avatarIcon = journey.avatar || '🚀';

  // Điều chỉnh độ trong suốt của gradient tùy theo chế độ
  const gradientAlphaStart = theme === 'dark' ? '25' : '15'; 
  const gradientAlphaEnd = theme === 'dark' ? '05' : '02';

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[240px] h-[240px] rounded-2xl cursor-pointer snap-start group",
        "flex flex-col transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1",
        "overflow-hidden border",
        // [ĐÃ SỬA] Màu nền cơ bản của Card thay vì gắn cứng #18181b
        "bg-white dark:bg-[#18181b]" 
      )}
      style={{ 
          borderColor: `${themeColor}40`, // Viền ngoài cùng thẻ mang màu theme (độ đậm 25%-40%)
      }}
    >
      {/* Lớp màu phủ Gradient siêu nhẹ */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          background: `linear-gradient(180deg, ${themeColor}${gradientAlphaStart} 0%, ${themeColor}${gradientAlphaEnd} 100%)` 
        }}
      />

      {/* --- PHẦN 1: ẢNH HOẶC ẢNH MẶC ĐỊNH (TOP) --- */}
      <div className="h-[145px] w-full shrink-0 relative p-1 pb-0 z-10">
        <div className="w-full h-full rounded-t-xl rounded-b-none overflow-hidden relative shadow-sm border-x border-t border-border bg-zinc-100 dark:bg-zinc-900">
            {hasImage ? (
                <img 
                    src={journey.thumbnailUrl} 
                    alt={journey.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-200/80 dark:bg-zinc-800/80 transition-transform duration-500 group-hover:scale-105">
                    <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] text-zinc-500 font-medium">Chưa có ảnh</span>
                </div>
            )}

            {/* Icon nhỏ nằm ở góc trái */}
            <div 
                className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg text-xs bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md z-10"
                style={{ borderBottom: `2px solid ${themeColor}` }}
            >
                {avatarIcon}
            </div>
        </div>
      </div>

      {/* --- PHẦN 2: NỘI DUNG (BOTTOM) --- */}
      <div className="flex-1 p-3 flex flex-col justify-between z-10 relative">
        {/* [ĐÃ SỬA] Tiêu đề dùng text-foreground để đổi màu Đen/Trắng tự động */}
        <h3 className="text-foreground font-bold text-[15px] leading-snug line-clamp-2 z-10 drop-shadow-sm dark:drop-shadow-md">
          {journey.name}
        </h3>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-auto z-10">
            
            {/* Danh sách Avatar thành viên */}
            <div className="flex items-center -space-x-1.5">
                {journey.memberAvatars?.slice(0, 3).map((url, idx) => (
                    <Avatar key={idx} className="w-6 h-6 border-2 border-transparent shadow-sm" style={{ borderColor: `${themeColor}50` }}>
                        <AvatarImage src={url || undefined} />
                        {/* [ĐÃ SỬA] Màu chữ và nền Fallback */}
                        <AvatarFallback className="text-[7px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-white">U</AvatarFallback>
                    </Avatar>
                ))}
                {journey.totalMembers > 3 && (
                    <div 
                        className="w-6 h-6 rounded-full bg-white/80 dark:bg-black/50 border-2 flex items-center justify-center text-[9px] text-zinc-800 dark:text-white font-bold shadow-sm backdrop-blur-sm" 
                        style={{ borderColor: `${themeColor}50` }}
                    >
                        +{journey.totalMembers - 3}
                    </div>
                )}
            </div>

            {/* Nhãn thời gian */}
            <div 
              className="text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-sm border transition-colors"
              style={{ 
                  backgroundColor: `${themeColor}${theme === 'dark' ? '40' : '20'}`, // Nhạt hơn ở Light Mode
                  borderColor: `${themeColor}${theme === 'dark' ? '60' : '40'}`, 
                  color: theme === 'dark' ? 'white' : themeColor // [Quan trọng] Đổi màu chữ theo theme
              }}
            >
               <Clock className="w-3 h-3" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : themeColor }} />
               <span style={{ 
                 // Thêm một filter làm tối màu đi một chút ở Light Mode nếu themeColor quá nhạt
                 filter: theme === 'light' ? 'brightness(0.7)' : 'none' 
               }}>
                 {journey.daysRemaining > 0 ? `${journey.daysRemaining} ngày` : 'Kết thúc'}
               </span>
            </div>
        </div>
      </div>
    </div>
  );
};