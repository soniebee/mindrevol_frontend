// src/modules/report/components/ReportModal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ReportReason, reportService, ReportTargetType } from '../services/report.service';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: ReportTargetType;
}

const REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.SPAM]: 'Spam hoặc lừa đảo',
  [ReportReason.HARASSMENT]: 'Quấy rối & bắt nạt',
  [ReportReason.HATE_SPEECH]: 'Ngôn từ thù ghét',
  [ReportReason.NUDITY]: 'Hình ảnh nhạy cảm',
  [ReportReason.VIOLENCE]: 'Bạo lực',
  [ReportReason.SCAM]: 'Lừa đảo',
  [ReportReason.FAKE_NEWS]: 'Tin giả / Sai sự thật',
  [ReportReason.OTHER]: 'Lý do khác',
};

// [FIX]: Chuyển sang Named Export để khớp với JourneyPostCard
export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, targetType }) => {
  const [reason, setReason] = useState<ReportReason>(ReportReason.SPAM);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await reportService.createReport({
        targetId,
        targetType,
        reason,
        description
      });
      // Hiển thị trạng thái thành công trước khi đóng
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDescription('');
        setReason(ReportReason.SPAM);
        onClose();
      }, 1500);
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi báo cáo.');
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop mờ tối */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#1c1c1e] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#27272a]/50">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold text-zinc-100">Báo cáo vi phạm</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          // Giao diện thành công
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 className="w-8 h-8 text-green-500 animate-in zoom-in duration-300" />
            </div>
            <h3 className="text-white font-bold text-lg">Đã gửi báo cáo</h3>
            <p className="text-zinc-400 text-sm mt-1">Cảm ơn bạn đã giúp giữ cộng đồng an toàn.</p>
          </div>
        ) : (
          // Form báo cáo
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Tại sao bạn báo cáo nội dung này?</label>
              <div className="grid grid-cols-1 gap-2">
                 <select 
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none cursor-pointer hover:bg-zinc-900"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                  >
                    {Object.entries(REASON_LABELS).map(([key, label]) => (
                      <option key={key} value={key} className="bg-[#1c1c1e] py-2">{label}</option>
                    ))}
                  </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Chi tiết thêm (Không bắt buộc)</label>
              <textarea
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-600 resize-none min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hãy cho chúng tôi biết thêm về vấn đề này..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <Button 
                onClick={handleSubmit} 
                isLoading={loading}
                className="bg-red-500 hover:bg-red-600 text-white border-none rounded-xl px-6"
              >
                Gửi báo cáo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};