import React, { useEffect } from 'react';
import { X, Images } from 'lucide-react';
import { UserActiveJourneyResponse } from '../types';
import { Checkin } from '@/modules/checkin/types';

import { LivePhotoViewer } from '@/components/ui/LivePhotoViewer';

interface Props {
    journey: UserActiveJourneyResponse | null;
    onClose: () => void;
    onCheckinClick: (checkin: Checkin) => void;
}

export const JourneyAlbumModal: React.FC<Props> = ({ journey, onClose, onCheckinClick }) => {
    
    useEffect(() => {
        if (journey) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [journey]);

    if (!journey) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between p-4 md:px-8 md:py-5 border-b border-white/10 shrink-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-normal text-white tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>
                        {journey.name}
                    </h2>
                    <p className="text-[11px] md:text-xs font-medium text-zinc-500 mt-0.5">
                        {journey.checkins?.length || 0} bài đăng
                    </p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2.5 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-6 lg:p-8">
                {journey.checkins && journey.checkins.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-3 max-w-7xl mx-auto">
                        {journey.checkins.map(checkin => (
                            <div 
                                key={checkin.id}
                                onClick={() => onCheckinClick(checkin)}
                                className="group relative aspect-square overflow-hidden cursor-pointer md:rounded-xl bg-zinc-900"
                            >
                                <LivePhotoViewer 
                                    imageUrl={checkin.imageUrl} 
                                    videoUrl={checkin.videoUrl} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                
                                {/* [ĐÃ SỬA] Thêm lớp vô hình bọc lên trên cùng để bắt sự kiện CLICK dứt khoát */}
                                <div className="absolute inset-0 z-10" />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none z-20" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                        <Images className="w-12 h-12 mb-3 opacity-20" strokeWidth={1} />
                        <p className="font-['Jua'] text-xl opacity-50">Chưa có hình ảnh nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};