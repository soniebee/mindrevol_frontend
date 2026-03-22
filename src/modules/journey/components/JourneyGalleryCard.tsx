import React from 'react';
import { UserActiveJourneyResponse } from '../types';
import { format, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Plus, Images, Eye, EyeOff } from 'lucide-react'; 
import { journeyService } from '../services/journey.service';

const safeFormatDate = (dateString: string | undefined | null, pattern: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isValid(date) ? format(date, pattern) : '';
};

interface Props {
    journey: UserActiveJourneyResponse;
    isMe?: boolean;
    onJourneyClick?: (journey: UserActiveJourneyResponse) => void;
    // [THÊM MỚI] Hàm hứng sự kiện đổi Tab
    onVisibilityToggle?: (journeyId: string, currentVisibility: boolean) => void;
}

export const JourneyGalleryCard: React.FC<Props> = ({ journey, isMe = false, onJourneyClick, onVisibilityToggle }) => {
    const navigate = useNavigate();
    
    // Đọc trực tiếp từ prop backend gửi lên, KHÔNG dùng useState nữa
    const isProfileVisible = journey.isProfileVisible ?? true;

    const renderDate = () => {
        const startStr = safeFormatDate(journey.startDate, "dd/MM/yyyy");
        const endStr = safeFormatDate(journey.endDate, "dd/MM/yyyy");
        if (journey.endDate && endStr) return `${startStr} - ${endStr}`;
        return `Từ ${startStr}`;
    };

    const coverImage = journey.checkins && journey.checkins.length > 0 
        ? journey.checkins[0].imageUrl 
        : null;

    const handleToggleVisibility = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            // 1. Cập nhật giao diện TỨC THÌ (Card sẽ bay sang tab khác ngay lập tức)
            if (onVisibilityToggle) {
                onVisibilityToggle(journey.id, isProfileVisible);
            }
            // 2. Gọi API ngầm lưu xuống database
            await journeyService.toggleProfileVisibility(journey.id);
        } catch (error) {
            console.error("Lỗi khi cập nhật hiển thị", error);
        }
    };

    return (
        <div 
            onClick={() => onJourneyClick ? onJourneyClick(journey) : navigate(`/journey/${journey.id}`)}
            className="group relative aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 bg-amber-50 dark:bg-zinc-900 transition-all hover:-translate-y-1.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
        >
            {coverImage ? (
                <img 
                    src={coverImage} 
                    alt={journey.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 dark:bg-[#2A1F1A]">
                    <Images className="w-10 h-10 md:w-12 md:h-12 text-orange-200 dark:text-orange-900/50 mb-2" strokeWidth={1.5} />
                    <span className="text-xs md:text-sm font-['Jua'] text-orange-300 dark:text-orange-800/50">Trống</span>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* NÚT ẨN HIỆN PROFILE */}
            {isMe && (
                <button
                    onClick={handleToggleVisibility}
                    className={`absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 text-white transition-all border border-white/20 shadow-sm z-20 ${!isProfileVisible && 'bg-red-500/50 hover:bg-red-500/70 border-red-400'}`}
                    title={isProfileVisible ? "Đang hiện trên Profile (Nhấn để Ẩn)" : "Đang ẩn (Nhấn để Hiện)"}
                >
                    {isProfileVisible ? <Eye className="w-4 h-4 md:w-5 md:h-5" /> : <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-white/90" />}
                </button>
            )}

            {isMe && journey.status !== 'COMPLETED' && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/journey/${journey.id}?action=add`);
                    }}
                    className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-blue-500 hover:text-white text-white transition-all border border-white/30 shadow-sm"
                    title="Thêm ảnh mới"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                </button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2 flex-wrap">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-white/20 shadow-sm">
                        {journey.totalCheckins ?? 0} ảnh
                    </span>
                    {journey.status === 'COMPLETED' && (
                        <span className="bg-indigo-500/80 backdrop-blur-md text-white text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-white/20 shadow-sm">
                            Memories
                        </span>
                    )}
                </div>
                <h3 className="text-xl md:text-2xl font-normal text-white truncate drop-shadow-md mb-0.5 md:mb-1" style={{ fontFamily: '"Jua", sans-serif' }}>
                    {journey.name}
                </h3>
                <p className="text-[10px] md:text-xs font-medium text-white/80 truncate drop-shadow-sm uppercase tracking-wider">
                    {renderDate()}
                </p>
            </div>
        </div>
    );
};