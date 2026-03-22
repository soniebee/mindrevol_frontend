import { http } from "@/lib/http";
import { MapMarkerResponse } from "@/modules/checkin/types"; 

export const mapService = {
  getJourneyMarkers: async (journeyId: string): Promise<MapMarkerResponse[]> => {
    const response = await http.get<any>(`/checkins/map/journey/${journeyId}`);
    return response.data.data || response.data;
  },

  getBoxMarkers: async (boxId: string): Promise<MapMarkerResponse[]> => {
    const response = await http.get<any>(`/checkins/map/box/${boxId}`);
    return response.data.data || response.data;
  },

  // [THÊM MỚI] Lấy tất cả ảnh của chính mình
  getMyMarkers: async (): Promise<MapMarkerResponse[]> => {
    const response = await http.get<any>(`/checkins/map/me`);
    return response.data.data || response.data;
  }
};