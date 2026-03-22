import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useBoxMoods } from '../hooks/useBoxMoods';
import { MoodDetailModal } from './MoodDetailModal';

interface Props {
    boxId: string;
}

export const MoodBoard: React.FC<Props> = ({ boxId }) => {
    const { user } = useAuth();
    const { moods, myMood, handleSetMood, handleDeleteMood } = useBoxMoods(boxId, user?.id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Luôn lấy người mới nhất (Backend đã sort sẵn)
    const latestMood = moods.length > 0 ? moods[0] : null;
    const othersCount = moods.length > 1 ? moods.length - 1 : 0;

    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            
            {!latestMood ? (
                // --- TRẠNG THÁI TRỐNG (MẶC ĐỊNH) ---
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                    <div className="w-[80px] h-[80px] rounded-full bg-white dark:bg-zinc-800 border-2 border-dashed border-amber-300 dark:border-amber-700/50 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-all duration-300 shadow-sm">
                        <span className="text-amber-400 group-hover:text-amber-500 text-[40px] font-light">+</span>
                    </div>
                </div>
            ) : (
                // --- TRẠNG THÁI CÓ NGƯỜI ĐĂNG ---
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center justify-center cursor-pointer group relative w-full h-full"
                >
                    <div className="relative flex flex-col items-center justify-center w-full max-w-[200px] bg-white dark:bg-zinc-800/80 rounded-[32px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800/60 transition-transform duration-300 group-hover:scale-105">
                        
                        {/* Avatar nhỏ ở góc trái trên */}
                        <div className="absolute -top-3 -left-3">
                            <div className="relative">
                                <img 
                                    src={latestMood.avatarUrl || `https://ui-avatars.com/api/?name=${latestMood.fullname}&background=random`} 
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover border-[3px] border-white dark:border-[#1f1a14] shadow-sm bg-zinc-200"
                                />
                                {/* Số lượng người khác đăng */}
                                {othersCount > 0 && (
                                    <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#1f1a14] shadow-sm z-10">
                                        +{othersCount}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Icon trạng thái siêu to khổng lồ */}
                        <span className="text-[64px] md:text-[72px] drop-shadow-sm leading-none my-2">
                            {latestMood.icon}
                        </span>
                        
                        {/* Ghi chú ngay bên dưới Icon */}
                        {latestMood.message && (
                            <p className="text-[13px] text-zinc-600 dark:text-zinc-300 font-medium text-center mt-3 w-full leading-tight line-clamp-2">
                                {latestMood.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <MoodDetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                moods={moods}
                myMood={myMood}
                onSubmit={handleSetMood}
                onDelete={handleDeleteMood}
                currentUserId={user?.id}
            />
        </div>
    );
};