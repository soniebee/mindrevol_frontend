import React, { useState, useRef } from 'react';
import { X, Archive, Sparkles } from 'lucide-react';
import { Checkin } from '@/modules/checkin/types';
import { LivePhotoViewer } from '@/components/ui/LivePhotoViewer';
import { CheckinDetailModal } from '@/modules/checkin/components/CheckinDetailModal';

interface ArchivedCheckinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkins: Checkin[]; 
}

export const ArchivedCheckinsModal: React.FC<ArchivedCheckinsModalProps> = ({ 
  isOpen, 
  onClose, 
  checkins 
}) => {
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);

  // ==========================================
  // GESTURE: KÉO ĐỂ ĐÓNG (DRAG TO DISMISS)
  // ==========================================
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const onDragStart = (clientY: number) => {
    dragStartY.current = clientY;
    setIsDragging(true);
  };

  const onDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - dragStartY.current;
    // Chỉ cho phép kéo xuống (delta > 0)
    if (delta > 0) {
      setDragY(delta);
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
    if (dragY > 150) { // Nếu kéo xuống hơn 150px thì đóng luôn
      onClose();
      setTimeout(() => setDragY(0), 300); // Reset sau khi animation kết thúc
    } else {
      setDragY(0); // Trôi ngược về vị trí cũ nếu kéo chưa đủ lực
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
        {/* BACKDROP */}
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
            onClick={onClose} 
        />

        {/* MODAL CONTAINER - Gắn transform để kéo */}
        <div 
            className={`relative w-full md:w-[800px] h-[95vh] md:h-[80vh] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95 ${!isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
            style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : 'none' }}
        >
            
            {/* =====================================
                KHU VỰC NẮM ĐỂ KÉO (DRAG HANDLE)
                ===================================== */}
            <div 
                className="w-full shrink-0 bg-white dark:bg-[#121212] cursor-grab active:cursor-grabbing touch-none z-30"
                onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
                onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
                onTouchEnd={onDragEnd}
                onMouseDown={(e) => onDragStart(e.clientY)}
                onMouseMove={(e) => onDragMove(e.clientY)}
                onMouseUp={onDragEnd}
                onMouseLeave={() => { if (isDragging) onDragEnd(); }}
            >
                {/* THUMB TRƯỢT TRÊN MOBILE */}
                <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                    <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
                </div>

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 md:px-8 py-4 shrink-0 border-b border-[#F4EBE1] dark:border-[#2B2A29]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center shadow-sm">
                            <Archive className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[1.3rem] md:text-[1.5rem] font-black text-[#1A1A1A] dark:text-white tracking-tight pointer-events-none">
                            Lưu trữ cá nhân
                        </h2>
                    </div>
                    {/* Chặn sự kiện nổi bọt để nút Close không bị dính drag */}
                    <button 
                        onMouseDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onClick={onClose} 
                        className="p-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95 cursor-pointer"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* BODY & IMAGE GRID (Nội dung cuộn bên dưới) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gradient-to-b from-[#F4EBE1]/30 to-white dark:from-[#121212] dark:to-[#0A0A0A]">
              {checkins && checkins.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 animate-in fade-in duration-500 pb-[80px] md:pb-0">
                  {checkins.map((checkin) => (
                    <div 
                      key={checkin.id} 
                      onClick={() => setSelectedCheckin(checkin)} 
                      className="aspect-square bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] md:rounded-[32px] overflow-hidden group relative border border-white/50 dark:border-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.04)] cursor-pointer"
                    >
                      {checkin.thumbnailUrl || checkin.imageUrl ? (
                        <LivePhotoViewer 
                          imageUrl={checkin.thumbnailUrl || checkin.imageUrl} 
                          videoUrl={checkin.videoUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <Sparkles className="w-8 h-8 text-[#A09D9A] mb-3 opacity-50" />
                            <span className="text-[1.05rem] font-bold text-[#1A1A1A] dark:text-white line-clamp-3 leading-snug">
                                {checkin.caption || 'Ghi chú văn bản'}
                            </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-[12px] flex items-center justify-center z-20 pointer-events-none shadow-sm border border-white/20">
                        <Archive className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center px-6">
                  <div className="w-24 h-24 rounded-[28px] bg-[#F4EBE1] dark:bg-[#2B2A29] flex items-center justify-center mb-6 shadow-sm border border-white/50 dark:border-white/5">
                    <Archive className="w-12 h-12 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[1.4rem] font-black text-[#1A1A1A] dark:text-white tracking-tight mb-2">
                    Kho lưu trữ trống
                  </h3>
                  <p className="text-[1rem] font-semibold text-[#8A8580] dark:text-[#A09D9A] max-w-[280px] leading-relaxed">
                    Những khoảnh khắc không thuộc hành trình nào sẽ nằm an toàn ở đây.
                  </p>
                </div>
              )}
            </div>
        </div>
      </div>

      {selectedCheckin && (
        <CheckinDetailModal 
          checkin={selectedCheckin} 
          onClose={() => setSelectedCheckin(null)} 
        />
      )}
    </>
  );
};