import { useQuery } from '@tanstack/react-query';
import { journeyService } from '../services/journey.service';
import { JourneyResponse } from '../types';

export const useJourneyList = () => {
  // [QUAN TRỌNG] Dùng useQuery để tự động lắng nghe thay đổi
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['journeys'], // Key này PHẢI KHỚP với key bạn đã invalidate bên useCreateJourney
    queryFn: () => journeyService.getMyJourneys(),
    staleTime: 1000 * 60 * 5, // (Tuỳ chọn) Dữ liệu được coi là mới trong 5 phút
    refetchOnWindowFocus: true, // Tự tải lại khi quay lại tab
  });

  return {
    data: data || [], // Luôn trả về mảng để không lỗi .map()
    isLoading,
    error: error ? (error as any).message : null,
    refresh: refetch // Giữ nguyên tên hàm 'refresh' để không phải sửa các file khác
  };
};