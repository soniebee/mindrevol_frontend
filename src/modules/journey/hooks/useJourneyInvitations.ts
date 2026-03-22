import { useState, useEffect } from 'react';
import { journeyService } from '../services/journey.service';
import { JourneyInvitationResponse } from '../types';
import { toast } from 'react-hot-toast';

// [FIX] Nhận thêm callback onSuccess
export const useJourneyInvitations = (onSuccess?: () => void) => {
  const [invitations, setInvitations] = useState<JourneyInvitationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await journeyService.getMyPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (invitationId: number) => {
    setProcessingId(invitationId);
    try {
      await journeyService.acceptInvitation(invitationId);
      toast.success("Đã tham gia hành trình!");
      
      // Xóa item khỏi danh sách local ngay lập tức (Optimistic update)
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      
      // [FIX] Gọi callback để báo cho component cha biết mà cập nhật chấm đỏ
      if (onSuccess) onSuccess(); 

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi chấp nhận");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: number) => {
    setProcessingId(invitationId);
    try {
      await journeyService.rejectInvitation(invitationId);
      toast.success("Đã từ chối lời mời");
      
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      
      // [FIX] Gọi callback cập nhật chấm đỏ
      if (onSuccess) onSuccess();

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi từ chối");
    } finally {
      setProcessingId(null);
    }
  };

  return {
    invitations,
    isLoading,
    processingId,
    handleAccept,
    handleReject,
    refresh: loadInvitations
  };
};