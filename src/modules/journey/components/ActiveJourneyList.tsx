import React, { useEffect, useState, useRef } from 'react';
import { journeyService } from '../services/journey.service';
import { UserActiveJourneyResponse } from '../types';
import { JourneyCard } from './JourneyCard';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/modules/auth/store/AuthContext'; 

interface Props {
  onCreateClick?: () => void;
  onJourneySelect?: (id: string) => void;
  selectedId?: string | null;
}

export const ActiveJourneyList: React.FC<Props> = ({ 
  onCreateClick, 
  onJourneySelect, 
  selectedId 
}) => {
  const [journeys, setJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 

  // --- LOGIC THANH CUỘN (SLIDER) ---
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Drag-to-scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchJourneys = async () => {
      if (!user?.id) return;
      try {
        const data = await journeyService.getUserActiveJourneys(user.id);
        setJourneys(data);
      } catch (error) {
        console.error("Failed to load active journeys", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchJourneys();
  }, [user?.id]);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [journeys, loading]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 256 * 2; 
      sliderRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => {
    setIsDragging(false);
    checkScroll(); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Trạng thái Loading
  if (loading) {
    return (
      <div className="w-full flex justify-center py-4 bg-transparent">
        <div className="w-full max-w-[720px] px-4">
            <div className="flex gap-4 overflow-hidden py-4">
                {[1, 2, 3].map(i => (
                <div key={i} className="w-[240px] h-[240px] bg-zinc-200 dark:bg-zinc-900/50 rounded-2xl animate-pulse shrink-0" />
                ))}
            </div>
        </div>
      </div>
    );
  }

  // Trạng thái chưa có Hành trình nào
  if (journeys.length === 0) {
      return (
        <div className="w-full flex justify-center py-8 bg-transparent">
            <div className="w-full max-w-[720px] flex flex-col items-center">
                <div 
                    onClick={onCreateClick}
                    className="w-[240px] h-[240px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 group-hover:scale-110 transition-all">
                        <Plus className="w-8 h-8 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                    </div>
                    <span className="text-sm text-zinc-500 font-medium group-hover:text-zinc-700 dark:group-hover:text-zinc-300">Tạo hành trình</span>
                </div>
                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mt-8" />
            </div>
        </div>
      );
  }

  return (
    <div className="w-full flex justify-center bg-transparent">
      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="w-full max-w-[720px] flex flex-col pt-6">
        
        {/* Header */}
        <div className="px-4 md:px-0 mb-2">
            <h2 className="text-zinc-900 dark:text-white text-lg font-bold">Đang diễn ra</h2>
            <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 mt-4" />
        </div>
        
        {/* KHU VỰC CHỨA SLIDER VÀ NÚT ĐIỀU HƯỚNG */}
        <div className="relative w-full group/slider">
            
            {/* Nút Prev (Trái) */}
            {canScrollLeft && (
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white flex items-center justify-center shadow-2xl opacity-0 group-hover/slider:opacity-100 transition-all duration-300 md:-left-5"
                >
                    <ChevronLeft className="w-6 h-6 mr-0.5" />
                </button>
            )}

            {/* Scroll Container */}
            <div 
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onScroll={checkScroll}
                className={`flex gap-4 overflow-x-auto py-6 px-4 md:px-0 snap-x snap-mandatory items-center justify-start hide-scroll scrollbar-hide ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
                style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
            >
                {/* Nút Tạo mới */}
                <div 
                    onClick={onCreateClick}
                    className="flex-shrink-0 w-[240px] h-[240px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col items-center justify-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group snap-start"
                >
                    <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors shadow-lg">
                        <Plus className="w-7 h-7 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                    Tạo mới
                    </span>
                </div>

                {/* Danh sách Card */}
                {journeys.map((journey) => (
                    <div 
                        key={journey.id}
                        className={`transition-transform duration-300 rounded-2xl snap-start ${
                            selectedId === journey.id 
                            ? 'scale-105 z-10 shadow-2xl' 
                            : 'hover:scale-105' 
                        }`}
                        onClick={(e) => {
                            if (isDragging) e.preventDefault(); 
                        }}
                    >
                        <JourneyCard 
                            journey={journey}
                            onClick={() => {
                                if (!isDragging && onJourneySelect) onJourneySelect(journey.id);
                            }} 
                        />
                    </div>
                ))}
            </div>

            {/* Nút Next (Phải) */}
            {canScrollRight && (
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white flex items-center justify-center shadow-2xl opacity-0 group-hover/slider:opacity-100 transition-all duration-300 md:-right-5"
                >
                    <ChevronRight className="w-6 h-6 ml-0.5" />
                </button>
            )}

            {/* Hiệu ứng bóng mờ 2 bên mép */}
            {canScrollLeft && <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#fafafa] dark:from-[#121212] to-transparent z-10 pointer-events-none" />}
            {canScrollRight && <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#fafafa] dark:from-[#121212] to-transparent z-10 pointer-events-none" />}
        </div>

        {/* HR Bottom */}
        <div className="px-4 md:px-0">
            <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />
        </div>

      </div>
    </div>
  );
};