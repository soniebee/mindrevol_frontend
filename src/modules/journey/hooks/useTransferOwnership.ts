import { useState, useEffect } from 'react';
import { journeyService } from '../services/journey.service';
import { JourneyParticipantResponse } from '../types';
import { toast } from 'react-hot-toast';

export const useTransferOwnership = (journeyId: string, currentUserId: string, onSuccess: () => void) => {
  const [members, setMembers] = useState<JourneyParticipantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load thành viên để chọn (Trừ chính mình ra)
  useEffect(() => {
    if (!journeyId || !currentUserId) return;

    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const list = await journeyService.getParticipants(journeyId);
        
        // [FIX] Lọc bỏ chính mình bằng user.id (string comparison)
        // Lưu ý: Optional chaining (?.) cho user phòng trường hợp dữ liệu lỗi
        const eligibleMembers = list.filter(m => String(m.user?.id) !== String(currentUserId));
        
        setMembers(eligibleMembers);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách thành viên");
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, [journeyId, currentUserId]);

  const handleTransfer = async (newOwnerId: string) => {
    if (!window.confirm("Bạn chắc chắn muốn chuyển quyền chủ phòng cho thành viên này? Bạn sẽ trở thành thành viên thường.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await journeyService.transferOwnership(journeyId, newOwnerId);
      toast.success("Đã chuyển quyền chủ phòng thành công!");
      onSuccess(); // Đóng modal và refresh list cha
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi chuyển quyền");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { members, isLoading, isSubmitting, handleTransfer };
};