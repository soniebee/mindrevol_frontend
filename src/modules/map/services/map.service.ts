import { http } from "@/lib/http";
import { MapMarkerResponse } from "@/modules/checkin/types"; 

export const mapService = {
  getJourneyMarkers: async (journeyId: string): Promise<MapMarkerResponse[]> => {
    const response = await http.get<any>(`/checkins/map/journey/${journeyId}`);
    return response.data.data || response.data;
  },

  // Trong map.service.ts
getBoxMarkers: async (boxId: string) => {
  try {
      const response = await http.get(`/checkins/map/box/${boxId}`);
      return response.data?.data || [];
  } catch (error) {
      console.error("Map API error:", error);
      return []; // Trả về mảng rỗng để bản đồ hiện trống chứ không báo lỗi 500 sập web
  }
},

  // [THÊM MỚI] Lấy tất cả ảnh của chính mình
  getMyMarkers: async (): Promise<MapMarkerResponse[]> => {
    const response = await http.get<any>(`/checkins/map/me`);
    return response.data.data || response.data;
  }
};