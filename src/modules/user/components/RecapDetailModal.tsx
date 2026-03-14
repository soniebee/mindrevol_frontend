import React, { useEffect, useState } from 'react';
import { X, Heart } from 'lucide-react';
import { journeyService } from '@/modules/journey/services/journey.service';
// [FIX] Import type Checkin để dùng cho callback
import { Checkin } from '@/modules/checkin/types';

interface Props {
    journeyId: string;
    // [FIX] Thêm journeyName vào interface (optional ?)
    journeyName?: string; 
    onClose: () => void;
    // [FIX] Định nghĩa rõ type cho callback
    onCheckinClick: (checkin: Checkin) => void;
}

export const RecapDetailModal: React.FC<Props> = ({ journeyId, journeyName, onClose, onCheckinClick }) => {
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        journeyService.getRecapFeed(journeyId)
            .then(res => {
                setCheckins(res.content || []); 
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [journeyId]);

    return (
        <div className="fixed inset-0 z-[90] bg-black/95 animate-in fade-in duration-200 flex flex-col h-full">
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10 max-w-7xl mx-auto w-full">
                <div>
                   <h2 className="text-xl font-bold text-white">{journeyName || "Kỷ niệm hành trình"}</h2>
                   <p className="text-sm text-zinc-400">
                       {loading ? "Đang tải..." : `${checkins.length} khoảnh khắc đáng nhớ`}
                   </p>
                </div>
                <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-colors"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-zinc-500 text-center py-20">Đang tải kỷ niệm...</div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
                            {checkins.length > 0 ? checkins.map(checkin => (
                                <div 
                                    key={checkin.id} 
                                    onClick={() => onCheckinClick(checkin)}
                                    className="relative aspect-square bg-zinc-800 rounded-2xl overflow-hidden cursor-pointer group"
                                >
                                    <img 
                                        src={checkin.thumbnailUrl || checkin.imageUrl} 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" 
                                        loading="lazy"
                                        alt="memory"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    {checkin.reactionCount > 0 && (
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-white font-bold drop-shadow-md">
                                            <Heart className="w-4 h-4 fill-white"/> {checkin.reactionCount}
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="col-span-full text-zinc-500 text-center py-20 text-sm">Chưa có ảnh nào.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};