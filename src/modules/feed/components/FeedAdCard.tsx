import React, { useState } from 'react';
import { ExternalLink, X, EyeOff } from 'lucide-react';
import { AdProps } from '../types';

interface FeedAdCardProps {
  ad: AdProps;
}

export const FeedAdCard: React.FC<FeedAdCardProps> = ({ ad }) => {
  // State quản lý việc ẩn quảng cáo
  const [isHidden, setIsHidden] = useState(false);

  // Màn hình khi người dùng bấm "Ẩn quảng cáo"
  // Giữ nguyên form để không làm giật khung Snap-Scroll của Locket Feed
  if (isHidden) {
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-[32px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-sm shrink-0">
        <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <EyeOff className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">Quảng cáo đã được ẩn</h3>
        <p className="text-zinc-500 text-sm mb-6 max-w-[80%]">
          Chúng tôi sẽ cố gắng hiển thị nội dung phù hợp hơn với bạn trong tương lai.
        </p>
        <button 
          onClick={() => setIsHidden(false)}
          className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold rounded-full transition-colors active:scale-95"
        >
          Hoàn tác
        </button>
      </div>
    );
  }

  // Fallback: Nếu trong DB chưa điền brandLogo/brandName, tự động tạo Logo chữ cái đầu
  const brandName = ad.brandName || "Nhà tài trợ";
  const brandLogo = ad.brandLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=random&color=fff`;

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-[32px] overflow-hidden shadow-xl bg-zinc-100 dark:bg-zinc-900 group shrink-0 border border-zinc-200 dark:border-white/10 font-sans">
      
      {/* 1. Ảnh nền quảng cáo (Bo tròn y hệt ảnh feed) */}
      <img 
        src={ad.imageUrl} 
        alt={ad.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Lớp Overlay gradient tối màu ở trên và dưới để làm nổi bật chữ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

      {/* 2. Header: Avatar, Tên nhãn hàng, Chữ Tài trợ & Nút Ẩn (X) */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-start justify-between z-10">
        
        {/* Box bên trái: Thông tin Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-sm bg-white shrink-0">
             <img src={brandLogo} alt={brandName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col drop-shadow-md">
            <span className="text-white font-bold text-[15px] leading-tight line-clamp-1">
              {brandName}
            </span>
            <span className="text-white/80 text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Được tài trợ
            </span>
          </div>
        </div>

        {/* Box bên phải: Nút ẩn quảng cáo */}
        <button 
          onClick={() => setIsHidden(true)}
          className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors shrink-0"
          title="Ẩn quảng cáo này"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Footer: Tiêu đề, Mô tả và Nút Kêu gọi hành động (CTA) */}
      <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col gap-4 z-10">
        
        {/* Nội dung text */}
        <div className="flex flex-col drop-shadow-md">
          <h3 className="text-white font-bold text-xl leading-tight line-clamp-2">
            {ad.title}
          </h3>
          {ad.description && (
            <p className="text-white/90 text-sm mt-1.5 line-clamp-2 font-medium">
              {ad.description}
            </p>
          )}
        </div>

        {/* Nút Tìm hiểu thêm (Bự, dễ bấm) */}
        <a 
          href={ad.ctaLink}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-black text-[15px] font-bold rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          {ad.ctaText || "Tìm hiểu thêm"} 
          <ExternalLink className="w-[18px] h-[18px]" />
        </a>
      </div>

    </div>
  );
};