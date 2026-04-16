import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Play, Download, Zap, Snail, Users, User, CheckCircle2, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { recapService } from '../services/recap.service';
import { checkinService } from '@/modules/checkin/services/checkin.service'; 
import { Checkin } from '@/modules/checkin/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/modules/auth/store/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
}

export const CreateRecapModal: React.FC<Props> = ({ isOpen, onClose, journeyId }) => {
  const { user } = useAuth();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [speed, setSpeed] = useState<number>(3); 
  const [filter, setFilter] = useState<'ALL' | 'ME'>('ALL');
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const speedToDelayMap: Record<number, number> = {
    1: 1500, 2: 1000, 3: 500, 4: 250, 5: 120 
  };

  // Dọn rác URL Blob khi tắt Modal để tránh nặng máy
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    if (isOpen && journeyId) loadImages();
  }, [isOpen, journeyId, filter]);

  const loadImages = async () => {
    setIsLoadingImages(true);
    try {
      // FIX LỖI TYPESCRIPT: Gán kiểu any[] tạm thời để bỏ qua lỗi conflict type với JourneyPost
      let journeyPhotos: any[] = await checkinService.getJourneyPhotos(journeyId);
      
      if (filter === 'ME') {
        journeyPhotos = journeyPhotos.filter((c: any) => {
           const ownerId = c.userId || c.user?.id;
           return ownerId === user?.id;
        });
      }
      
      // Sau khi filter xong mới gán lại vào State
      setCheckins(journeyPhotos as Checkin[]);
      setSelectedIds(new Set(journeyPhotos.map((c: any) => c.id)));
      
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      toast.error("Không thể tải hình ảnh của hành trình lúc này.");
    } finally {
      setIsLoadingImages(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handlePreview = async () => {
    if (selectedIds.size === 0) return toast.error('Vui lòng chọn ít nhất 1 bức ảnh!');
    
    setIsPreviewing(true);
    try {
      const payload = {
        speedDelayMs: speedToDelayMap[speed],
        filterType: filter,
        selectedCheckinIds: Array.from(selectedIds)
      };
      
      const blob = await recapService.previewRecap(journeyId, payload);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url); 
      toast.success("Bản xem trước đã sẵn sàng!");
    } catch (error: any) {
      toast.error("Không thể tạo video lúc này. Vui lòng thử lại.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `HanhTrinh_${journeyId}_Recap.mp4`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Đang tải video về thư viện của bạn!");
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      <div className="relative w-full md:w-[480px] h-[95vh] md:h-[85vh] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full md:zoom-in-95">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4EBE1] dark:border-[#2B2A29] shrink-0">
          <h2 className="text-[#1A1A1A] dark:text-white text-[1.2rem] font-black tracking-tight">
            Tạo Video Recap 📸
          </h2>
          <button onClick={onClose} className="p-2 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-full text-[#8A8580] hover:scale-105 transition-transform">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* NỘI DUNG CUỘN ĐƯỢC */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* MÀN HÌNH PREVIEW VIDEO (VUÔNG) */}
          <div className="flex justify-center">
             {previewUrl ? (
                <div className="w-[280px] h-[280px] bg-black rounded-[40px] shadow-2xl overflow-hidden relative border-4 border-white dark:border-[#2B2A29]">
                    <video src={previewUrl} autoPlay loop playsInline controls className="w-full h-full object-cover" />
                </div>
             ) : (
                <div className="w-[280px] h-[280px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] rounded-[40px] border-2 border-dashed border-[#8A8580]/30 flex flex-col items-center justify-center text-[#8A8580]">
                    <Video size={48} className="mb-3 opacity-50" strokeWidth={1.5} />
                    <span className="font-bold text-[0.9rem]">Chưa có xem trước</span>
                </div>
             )}
          </div>

          {/* CÀI ĐẶT THÔNG SỐ */}
          <div className="space-y-6 bg-white dark:bg-[#121212]">
              {/* CHỌN NGƯỜI */}
              <div>
                <label className="text-[#8A8580] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2">Dữ liệu từ</label>
                <div className="flex bg-[#F4EBE1] dark:bg-[#1A1A1A] p-1.5 rounded-[20px]">
                  <button onClick={() => setFilter('ALL')} className={cn("flex-1 py-2.5 rounded-[16px] text-[0.9rem] font-bold transition-all flex justify-center items-center gap-2", filter === 'ALL' ? "bg-white dark:bg-[#2B2A29] shadow-sm text-[#1A1A1A] dark:text-white" : "text-[#8A8580]")}>
                    <Users size={16} /> Nhóm
                  </button>
                  <button onClick={() => setFilter('ME')} className={cn("flex-1 py-2.5 rounded-[16px] text-[0.9rem] font-bold transition-all flex justify-center items-center gap-2", filter === 'ME' ? "bg-white dark:bg-[#2B2A29] shadow-sm text-[#1A1A1A] dark:text-white" : "text-[#8A8580]")}>
                    <User size={16} /> Cá nhân
                  </button>
                </div>
              </div>

              {/* TỐC ĐỘ */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[#8A8580] text-[0.75rem] font-extrabold uppercase tracking-widest">Tốc độ khung hình</label>
                  <span className="text-purple-500 font-black text-[0.8rem]">{speed === 1 ? "Rùa bò" : speed === 5 ? "Flashback" : "Bình thường"}</span>
                </div>
                <input type="range" min="1" max="5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full h-2 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-lg appearance-none cursor-pointer accent-purple-500" />
                <div className="flex justify-between text-[#8A8580] mt-2 px-1"><Snail size={14} /><Zap size={14} /></div>
              </div>

              {/* CHỌN ẢNH */}
              <div>
                <label className="text-[#8A8580] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-3">Tùy chọn ảnh ({selectedIds.size}/{checkins.length})</label>
                {isLoadingImages ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-purple-500" /></div>
                ) : (
                  <div className="grid grid-cols-5 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                    {checkins.map((c: Checkin) => (
                      <div key={c.id} onClick={() => toggleSelection(c.id)} className={cn("aspect-square rounded-[12px] overflow-hidden cursor-pointer relative border-2 transition-all", selectedIds.has(c.id) ? "border-purple-500 scale-[0.95]" : "border-transparent opacity-50")}>
                        <img src={c.thumbnailUrl || c.imageUrl} className="w-full h-full object-cover" alt="img" />
                        {selectedIds.has(c.id) && <div className="absolute top-1 right-1 bg-purple-500 rounded-full text-white"><CheckCircle2 size={12} /></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="p-5 border-t border-[#F4EBE1] dark:border-[#2B2A29] flex gap-3 shrink-0 bg-white dark:bg-[#121212]">
          <button onClick={handlePreview} disabled={isPreviewing || selectedIds.size === 0} className="flex-1 h-[56px] bg-[#F4EBE1] dark:bg-[#2B2A29] text-[#1A1A1A] dark:text-white rounded-[20px] font-black text-[1rem] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
            {isPreviewing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />} 
            Xem Thử
          </button>

          {previewUrl && (
             <button onClick={handleDownload} className="flex-1 h-[56px] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[20px] font-black text-[1rem] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/30">
               <Download strokeWidth={3} className="w-5 h-5" /> Lưu Về Máy
             </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};