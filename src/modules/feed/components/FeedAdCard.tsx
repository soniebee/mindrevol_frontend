import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AdProps } from '../types';

interface FeedAdCardProps {
  ad: AdProps;
}

export const FeedAdCard: React.FC<FeedAdCardProps> = ({ ad }) => {
  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl bg-zinc-900 group snap-center shrink-0">
      
      {/* 1. Ảnh Quảng cáo (Full nền) */}
      <img 
        src={ad.imageUrl} 
        alt={ad.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlay làm tối để chữ dễ đọc */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

      {/* 2. Nhãn "Sponsored" (Góc trên) */}
      <div className="absolute top-4 left-4 z-10">
        <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Được tài trợ</span>
        </div>
      </div>

      {/* 3. Nội dung Quảng cáo (Góc dưới) */}
      <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col items-start gap-3 z-10">
        
        <div className="space-y-1">
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
                {ad.title}
            </h3>
            {ad.description && (
                <p className="text-zinc-200 text-sm line-clamp-2 drop-shadow-md font-medium">
                    {ad.description}
                </p>
            )}
        </div>

        {/* Nút CTA (Kêu gọi hành động) - Dùng màu Brand */}
        <a 
            href={ad.ctaLink} 
            target="_blank" 
            rel="noreferrer"
            className="w-full py-3 bg-brand hover:opacity-90 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-pink-500/20"
        >
            {ad.ctaText || "Xem ngay"} <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};