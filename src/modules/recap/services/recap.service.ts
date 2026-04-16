import { http } from '@/lib/http';
import { RecapResponse } from '../types';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const recapService = {
  getMyRecaps: async (): Promise<RecapResponse[]> => {
    const res = await http.get<ApiResponse<RecapResponse[]>>('/recaps');
    return res.data.data;
  },

  getRecapById: async (id: string): Promise<RecapResponse> => {
    const res = await http.get<ApiResponse<RecapResponse>>(`/recaps/${id}`);
    return res.data.data;
  },

  requestManualRecap: async (journeyId: string, payload: any): Promise<void> => {
    await http.post(`/recaps/journey/${journeyId}`, payload);
  },

  deleteRecap: async (id: string): Promise<void> => {
    await http.delete(`/recaps/${id}`);
  },

  // Dành cho Modal 1 Hành trình
  previewRecap: async (journeyId: string, payload: any): Promise<Blob> => {
    const res = await http.post(`/recaps/journey/${journeyId}/preview`, payload, {
        responseType: 'blob'
    });
    return res.data;
  },

  // [THÊM MỚI] Dành cho Modal Tổng hợp nhiều hành trình
  globalPreviewRecap: async (payload: any): Promise<Blob> => {
    const res = await http.post(`/recaps/global-preview`, payload, {
        responseType: 'blob'
    });
    return res.data;
  }
};