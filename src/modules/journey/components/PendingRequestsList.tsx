import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Loader2, BellRing, ShieldCheck } from 'lucide-react';
import { journeyService } from '../services/journey.service';
import { JourneyRequestResponse } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  onSuccess?: () => void; 
}

export const PendingRequestsList: React.FC<Props> = ({ isOpen, onClose, journeyId, onSuccess }) => {
  const [requests, setRequests] = useState<JourneyRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- DRAG TO DISMISS ---
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const onDragStart = (clientY: number) => { dragStartY.current = clientY; setIsDragging(true); };
  const onDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onDragEnd = () => {
    setIsDragging(false);
    if (dragY > 150) { onClose(); setTimeout(() => setDragY(0), 300); } 
    else { setDragY(0); }
  };

  useEffect(() => {
    if (isOpen && journeyId) loadRequests();
  }, [isOpen, journeyId]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await journeyService.getPendingRequests(journeyId);
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(requestId);
    try {
      if (action === 'APPROVE') {
        await journeyService.approveRequest(journeyId, requestId);
        toast.success("Đã duyệt thành viên tham gia!");
      } else {
        await journeyService.rejectRequest(journeyId, requestId);
        toast.success("Đã từ chối yêu cầu.");
      }
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      if (action === 'APPROVE' && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
      
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* MODAL CONTAINER */}
      <div 
        className={`relative w-full md:w-[480px] h-[90vh] md:h-auto bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95 ${!isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : 'none' }}
      >
        
        {/* VÙNG KÉO DRAG */}
        <div 
            className="w-full shrink-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md cursor-grab active:cursor-grabbing touch-none z-30"
            onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
            onTouchEnd={onDragEnd}
            onMouseDown={(e) => onDragStart(e.clientY)}
            onMouseMove={(e) => onDragMove(e.clientY)}
            onMouseUp={onDragEnd}
            onMouseLeave={() => { if (isDragging) onDragEnd(); }}
        >
            <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
            </div>

            <div className="flex items-center justify-between px-6 md:px-8 py-2 md:py-5 border-b border-[#F4EBE1] dark:border-[#2B2A29]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 dark:bg-red-500/20 rounded-[14px] flex items-center justify-center shadow-sm">
                        <BellRing className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[#1A1A1A] dark:text-white text-[1.4rem] font-black tracking-tight pointer-events-none">
                        Yêu cầu tham gia
                    </h2>
                </div>
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

        {/* NỘI DUNG DANH SÁCH */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gradient-to-b from-[#F4EBE1]/30 to-white dark:from-[#1A1A1A]/30 dark:to-[#0A0A0A]">
          {loading ? (
            <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8A8580]"/></div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-70">
                <ShieldCheck className="w-12 h-12 text-[#A09D9A] mb-4" strokeWidth={2} />
                <div className="text-center text-[#8A8580] font-bold text-[1.05rem]">Chưa có yêu cầu tham gia nào mới.</div>
            </div>
          ) : (
            <div className="space-y-4 pb-10">
              {requests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-[#1A1A1A] p-4 rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5 gap-4 transition-all">
                  
                  <div className="flex items-center gap-4">
                    <img 
                        src={req.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.fullname)}&background=random&color=fff`} 
                        className="w-12 h-12 rounded-[16px] object-cover bg-[#E2D9CE] shadow-sm border border-[#F4EBE1] dark:border-[#2B2A29]" 
                        alt="avatar"
                    />
                    <div>
                      <p className="font-black text-[#1A1A1A] dark:text-white text-[1.1rem] leading-tight mb-0.5">{req.fullname}</p>
                      <p className="text-[0.85rem] text-[#8A8580] dark:text-[#A09D9A] font-bold">@{req.handle}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                        onClick={() => handleAction(req.id, 'APPROVE')} 
                        disabled={!!processingId} 
                        className="flex-1 sm:flex-none px-5 h-[44px] bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[16px] text-[0.95rem] font-black transition-all active:scale-95 shadow-md flex items-center justify-center"
                    >
                      {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check size={20} strokeWidth={3} className="mr-1" />}
                      Duyệt
                    </button>
                    <button 
                        onClick={() => handleAction(req.id, 'REJECT')} 
                        disabled={!!processingId} 
                        className="flex-1 sm:flex-none w-[44px] h-[44px] bg-[#F4EBE1] dark:bg-[#2B2A29] text-[#1A1A1A] dark:text-white rounded-[16px] hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all active:scale-95 flex items-center justify-center"
                        title="Từ chối"
                    >
                      {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <X size={20} strokeWidth={3} />}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};