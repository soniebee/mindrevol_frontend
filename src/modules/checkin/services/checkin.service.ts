import { http } from '@/lib/http';
import { Checkin, CreateCheckinRequest } from '@/modules/feed/types'; 

class CheckinService {
  private readonly BASE_URL = '/checkins'; 
  private readonly SAVED_BASE_URL = '/saved-checkins'; // [MỚI] Endpoint cho phần lưu bài

  // 1. Lấy Feed
  async getJourneyFeed(journeyId: string, page = 0, limit = 20): Promise<Checkin[]> {
    const res = await http.get<{ data: any }>(`${this.BASE_URL}/journey/${journeyId}`, { params: { page, limit } });
    const responseData = res.data.data;
    if (Array.isArray(responseData)) return responseData;
    if (responseData && responseData.content) return responseData.content;
    return [];
  }

  // 2. Tạo Check-in
  async createCheckin(req: CreateCheckinRequest & { latitude?: number; longitude?: number }): Promise<Checkin> {
    const formData = new FormData();
    formData.append('file', req.file);
    formData.append('journeyId', req.journeyId);
    
    if (req.caption) formData.append('caption', req.caption);
    if (req.statusRequest) formData.append('statusRequest', req.statusRequest);
    if (req.visibility) formData.append('visibility', req.visibility);

    if (req.emotion) formData.append('emotion', req.emotion);
    if (req.activityType) formData.append('activityType', req.activityType);
    if (req.activityName) formData.append('activityName', req.activityName);
    if (req.locationName) formData.append('locationName', req.locationName);
    
    // Gửi Tọa độ lên Backend
    if (req.latitude !== undefined && req.latitude !== null) {
        formData.append('latitude', req.latitude.toString());
    }
    if (req.longitude !== undefined && req.longitude !== null) {
        formData.append('longitude', req.longitude.toString());
    }
    
    if (req.tags && req.tags.length > 0) {
        req.tags.forEach(tag => formData.append('tags', tag));
    }

    const res = await http.post<{ data: Checkin }>(this.BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }

  // 3. Xóa Check-in
  async deleteCheckin(checkinId: string) {
      return await http.delete(`${this.BASE_URL}/${checkinId}`);
  }

  // 4. Cập nhật Caption 
  async updateCheckin(checkinId: string, caption: string) {
      const res = await http.put<{ data: Checkin }>(`${this.BASE_URL}/${checkinId}`, { caption });
      return res.data.data;
  }

  // 5. Comment
  async postComment(checkinId: string, content: string) {
     return http.post(`${this.BASE_URL}/${checkinId}/comments`, { content }).then(res => res.data.data);
  }

  // =====================================
  // [THÊM MỚI] CÁC HÀM XỬ LÝ LƯU BÀI ĐĂNG
  // =====================================

  // 6. Lưu / Bỏ lưu bài đăng
  async toggleSave(checkinId: string): Promise<boolean> {
      const res = await http.post<{ data: boolean }>(`${this.SAVED_BASE_URL}/toggle/${checkinId}`);
      return res.data.data; // Trả về true nếu đã lưu, false nếu bỏ lưu
  }

  // 7. Lấy danh sách các bài đăng đã lưu
  async getSavedCheckins(page = 0, size = 20): Promise<Checkin[]> {
      const res = await http.get<{ data: { content: Checkin[] } }>(`${this.SAVED_BASE_URL}/me`, {
          params: { page, size }
      });
      return res.data.data.content || [];
  }
}

export const checkinService = new CheckinService();