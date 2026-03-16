import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface LivePhotoProps {
    imageUrl: string;
    videoUrl?: string | null;
    className?: string; 
}

export const LivePhotoViewer: React.FC<LivePhotoProps> = ({ imageUrl, videoUrl, className = "" }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        e.preventDefault();

        if (!videoUrl || !videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.log("Lỗi phát video:", err);
                setIsPlaying(false);
            });
        }
    };

    // [THÊM MỚI] Thủ thuật giới hạn 3 giây cho Live Photo
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            // Nếu video phát vượt quá 3 giây -> Ép quay về giây số 0
            if (videoRef.current.currentTime >= 3) {
                videoRef.current.currentTime = 0; 
            }
        }
    };

    return (
        <div 
            className={`relative overflow-hidden select-none cursor-pointer group bg-black/5 ${className}`}
            onClick={togglePlay}
        >
            {/* 1. ẢNH TĨNH: LUÔN NẰM DƯỚI CÙNG */}
            <img 
                src={imageUrl} 
                alt="Live Photo" 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* 2. VIDEO: ÉP LẶP LẠI MỖI 3 GIÂY */}
            {videoUrl && (
                <video 
                    ref={videoRef}
                    src={videoUrl}
                    poster={imageUrl} 
                    onTimeUpdate={handleTimeUpdate} // <-- Gắn hàm giới hạn 3s vào đây
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                    loop={true}
                    muted 
                    playsInline
                />
            )}

            {/* 3. HUY HIỆU LIVE PHOTO */}
            {videoUrl && (
                <div className={`absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-full transition-opacity pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-80 shadow-md border border-white/20'}`}>
                    <Play fill="white" size={10} className="text-white" />
                    <span className="text-[10px] font-bold text-white tracking-widest leading-none mt-[1px] pr-1">LIVE</span>
                </div>
            )}
        </div>
    );
};