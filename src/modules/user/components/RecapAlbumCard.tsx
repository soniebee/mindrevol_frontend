import React from 'react';
import { PlayCircle, Calendar } from 'lucide-react';
// Import đúng type từ file types vừa cập nhật
import { UserActiveJourneyResponse } from '@/modules/journey/types';

interface Props {
  journey: UserActiveJourneyResponse;
  onClick: () => void;
}

export const RecapAlbumCard: React.FC<Props> = ({ journey, onClick }) => {
  // Lấy ảnh cover
  const coverImage = journey.checkins && journey.checkins.length > 0 ? journey.checkins[0].imageUrl : null;

  return (
    <div 
      onClick={onClick}
      className="group relative aspect-square bg-zinc-900 rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 z-0 group-hover:scale-110 transition-transform duration-500" />
      
      {coverImage && (
         <img 
            src={coverImage} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity blur-[1px] group-hover:blur-none duration-300 z-0" 
            alt="cover"
         />
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
        <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:text-white transition-all border border-white/10 group-hover:scale-110 shadow-xl">
            <PlayCircle className="w-7 h-7 text-white/90" />
        </div>
        <h3 className="font-bold text-white text-base md:text-lg line-clamp-2 drop-shadow-lg group-hover:translate-y-1 transition-transform">{journey.name}</h3>
        <div className="flex items-center gap-1 mt-2 text-[10px] md:text-xs text-zinc-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Calendar className="w-3 h-3" />
            <span>Đã hoàn thành</span>
        </div>
      </div>
    </div>
  );
};