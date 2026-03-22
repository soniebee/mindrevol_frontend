import React, { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { journeyService } from '../services/journey.service';
import { JourneyRequestResponse } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  journeyId: string;
  onSuccess?: () => void; // [NEW] Callback khi thao tác xong
}

export const PendingRequestsList: React.FC<Props> = ({ journeyId, onSuccess }) => {
  const [requests, setRequests] = useState<JourneyRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (journeyId) loadRequests();
  }, [journeyId]);

  const loadRequests = async () => {
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
        toast.success("Đã duyệt thành viên");
      } else {
        await journeyService.rejectRequest(journeyId, requestId);
        toast.success("Đã từ chối");
      }
      
      // Cập nhật list local
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      // [NEW] Gọi callback để component cha biết mà refresh MemberList
      if (action === 'APPROVE' && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="py-2 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto text-zinc-500"/></div>;
  if (requests.length === 0) return null;

  return (
    <div className="space-y-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex justify-between items-center">
        Yêu cầu tham gia <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-500/20">{requests.length}</span>
      </h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
        {requests.map(req => (
          <div key={req.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
            <div className="flex items-center gap-2.5">
              <img src={req.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.fullname)}&background=random&color=fff`} className="w-8 h-8 rounded-full bg-zinc-800 object-cover" alt="Avatar"/>
              <div>
                <p className="text-sm text-white font-medium">{req.fullname}</p>
                <p className="text-[10px] text-zinc-500">@{req.handle}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => handleAction(req.id, 'APPROVE')} disabled={!!processingId} className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-lg transition-colors">
                {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => handleAction(req.id, 'REJECT')} disabled={!!processingId} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};