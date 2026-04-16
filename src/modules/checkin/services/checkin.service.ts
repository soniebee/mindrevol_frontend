import { http } from '@/lib/http';
import { Checkin, CreateCheckinRequest } from '@/modules/feed/types'; 

class CheckinService {
  private readonly BASE_URL = '/checkins'; 
  private readonly SAVED_BASE_URL = '/saved-checkins'; 

  async getJourneyFeed(journeyId: string, page = 0, limit = 20): Promise<Checkin[]> {
    const res = await http.get<{ data: any }>(`${this.BASE_URL}/journey/${journeyId}`, { params: { page, limit } });
    const responseData = res.data.data;
    if (Array.isArray(responseData)) return responseData;
    if (responseData && responseData.content) return responseData.content;
    return [];
  }

  async createCheckin(req: CreateCheckinRequest & { latitude?: number; longitude?: number }): Promise<Checkin> {
    const formData = new FormData();
    formData.append('file', req.file);
    if (req.journeyId) formData.append('journeyId', req.journeyId);
    if (req.caption) formData.append('caption', req.caption);
    if (req.statusRequest) formData.append('statusRequest', req.statusRequest);
    if (req.visibility) formData.append('visibility', req.visibility);
    if (req.emotion) formData.append('emotion', req.emotion);
    if (req.activityType) formData.append('activityType', req.activityType);
    if (req.activityName) formData.append('activityName', req.activityName);
    if (req.locationName) formData.append('locationName', req.locationName);
    if (req.latitude !== undefined && req.latitude !== null) formData.append('latitude', req.latitude.toString());
    if (req.longitude !== undefined && req.longitude !== null) formData.append('longitude', req.longitude.toString());
    if (req.tags && req.tags.length > 0) req.tags.forEach(tag => formData.append('tags', tag));

    const res = await http.post<{ data: Checkin }>(this.BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }

  async deleteCheckin(checkinId: string) {
      return await http.delete(`${this.BASE_URL}/${checkinId}`);
  }

  async updateCheckin(checkinId: string, data: { caption?: string; journeyId?: string }) {
      const res = await http.put<{ data: Checkin }>(`${this.BASE_URL}/${checkinId}`, data);
      return res.data.data;
  }

  async postComment(checkinId: string, content: string) {
     return http.post(`${this.BASE_URL}/${checkinId}/comments`, { content }).then(res => res.data.data);
  }

  async toggleSave(checkinId: string): Promise<boolean> {
      const res = await http.post<{ data: boolean }>(`${this.SAVED_BASE_URL}/toggle/${checkinId}`);
      return res.data.data; 
  }

  async getSavedCheckins(page = 0, size = 20): Promise<Checkin[]> {
      const res = await http.get<{ data: { content: Checkin[] } }>(`${this.SAVED_BASE_URL}/me`, { params: { page, size } });
      return res.data.data.content || [];
  }

  async getArchivedCheckins(page = 0, size = 20): Promise<Checkin[]> {
      const res = await http.get<{ data: { content: Checkin[] } }>(`${this.BASE_URL}/me/archived`, { params: { page, size } });
      return res.data?.data?.content || [];
  }

  async getJourneyPhotos(journeyId: string): Promise<Checkin[]> {
      const res = await http.get<{ data: Checkin[] }>(`${this.BASE_URL}/journey/${journeyId}/photos`);
      return res.data.data || [];
  }

  // --- [THÊM MỚI] GỌI API LẤY ẢNH TỪ NHIỀU HÀNH TRÌNH CÙNG LÚC ---
  async getMultipleJourneysPhotos(journeyIds: string[]): Promise<Checkin[]> {
      const res = await http.post<{ data: Checkin[] }>(`${this.BASE_URL}/journeys/photos/batch`, journeyIds);
      return res.data.data || [];
  }
}

export const checkinService = new CheckinService();