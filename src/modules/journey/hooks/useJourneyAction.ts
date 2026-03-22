import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journeyService } from '../services/journey.service';
import { toast } from 'react-hot-toast';

export const useJourneyAction = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  // 1. JOIN JOURNEY
  const { mutate: joinJourneyMutate, isPending: isJoining } = useMutation({
    mutationFn: (inviteCode: string) => journeyService.joinJourney({ inviteCode }),
    onSuccess: () => {
      toast.success("Đã tham gia hành trình thành công!");
      queryClient.invalidateQueries({ queryKey: ['journeys'] }); // Load lại list
      queryClient.invalidateQueries({ queryKey: ['feed'] });     // Load lại feed
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Mã mời không hợp lệ hoặc lỗi hệ thống.");
    }
  });

  // 2. DELETE JOURNEY (Giải tán)
  const { mutate: deleteJourneyMutate, isPending: isDeleting } = useMutation({
    mutationFn: (journeyId: string) => journeyService.deleteJourney(journeyId),
    onSuccess: () => {
      toast.success("Đã giải tán hành trình.");
      // [QUAN TRỌNG] Xóa cache cũ để UI tự cập nhật
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      queryClient.invalidateQueries({ queryKey: ['my-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa hành trình.");
    }
  });

  // 3. LEAVE JOURNEY (Rời nhóm)
  const { mutate: leaveJourneyMutate, isPending: isLeaving } = useMutation({
    mutationFn: (journeyId: string) => journeyService.leaveJourney(journeyId),
    onSuccess: () => {
      toast.success("Đã rời hành trình.");
      // [QUAN TRỌNG] Xóa cache cũ
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      queryClient.invalidateQueries({ queryKey: ['my-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });

      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi rời hành trình.");
    }
  });

  // 4. KICK MEMBER
  const { mutate: kickMemberMutate, isPending: isKicking } = useMutation({
    mutationFn: ({ journeyId, memberId }: { journeyId: string, memberId: string }) => 
      journeyService.kickMember(journeyId, memberId),
    onSuccess: () => {
      toast.success("Đã mời thành viên ra khỏi nhóm.");
      // Chỉ cần reload lại list thành viên của hành trình đó (nếu cần xử lý kỹ hơn thì invalid theo ID)
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể mời thành viên ra khỏi nhóm.");
    }
  });

  // --- WRAPPER FUNCTIONS (Giữ lại logic confirm của bạn) ---

  const joinJourney = (inviteCode: string) => {
    if (!inviteCode.trim()) return;
    joinJourneyMutate(inviteCode);
  };

  const deleteJourney = (journeyId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hành trình này không? Hành động này không thể hoàn tác.")) {
      deleteJourneyMutate(journeyId);
    }
  };

  const leaveJourney = (journeyId: string) => {
    if (window.confirm("Bạn muốn rời khỏi hành trình này?")) {
      leaveJourneyMutate(journeyId);
    }
  };

  const kickMember = (journeyId: string, memberId: string) => {
    // Với kick member có thể thêm confirm nếu muốn, tạm thời gọi thẳng
    kickMemberMutate({ journeyId, memberId });
  };

  return {
    isProcessing: isJoining || isDeleting || isLeaving || isKicking, // Gộp state loading
    joinJourney,
    deleteJourney,
    leaveJourney,
    kickMember
  };
};