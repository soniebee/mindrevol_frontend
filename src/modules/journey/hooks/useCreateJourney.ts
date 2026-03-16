import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateJourneyRequest } from '../types';
import { journeyService } from '../services/journey.service';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'react-hot-toast';

export const useCreateJourney = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient(); 

  const { mutate: createJourney, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateJourneyRequest) => journeyService.createJourney(data),
    
    onSuccess: (newJourney, variables) => {
      // ----------------------------------------------------------------
      // [FIX QUAN TRỌNG] Báo cho React Query biết dữ liệu đã cũ -> Cần tải lại ngay
      // ----------------------------------------------------------------
      // Invalidate cả danh sách tổng và danh sách "Của tôi"
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      queryClient.invalidateQueries({ queryKey: ['my-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['active-journeys'] }); // Thêm key này nếu có
      
      // [Analytics] Đo lường hành vi người dùng
      trackEvent('journey_created', {
        journey_id: newJourney.id,
        journey_name: variables.name,
        is_public: variables.visibility === 'PUBLIC',
        has_date_range: !!variables.endDate
      });

      toast.success("Tạo hành trình thành công!");

      // Gọi callback đóng modal/chuyển trang
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },

    onError: (error: any) => {
      console.error("Create journey error:", error);
      const message = error.response?.data?.message || "Lỗi khi tạo hành trình. Vui lòng thử lại.";
      toast.error(message);
    }
  });

  return {
    createJourney, // Hàm trigger mutation
    isCreating     // Trạng thái loading
  };
};