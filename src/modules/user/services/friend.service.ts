import { http } from '@/lib/http';

export interface Friend {
  id: any; 
  fullname: string;
  avatarUrl: string;
  handle: string;
  isOnline: boolean;
}

export interface FriendshipResponse {
  id: any; 
  friend: Friend;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  isRequester: boolean;
  createdAt: string;
}

// [FIX] Interface này phải khớp với backend trả về từ API search
export interface UserSummary {
  id: any;
  fullname: string;
  handle: string;
  avatarUrl: string;
  friendshipStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED' | 'NONE' | 'RECEIVED';
}

interface PageParams {
  page?: number;
  size?: number;
}

class FriendService {
  
  async getMyFriends(params?: PageParams): Promise<FriendshipResponse[]> {
    const res = await http.get<any>('/friends', { params }); 
    return res.data?.data?.content || [];
  }

  // [THÊM MỚI] Hàm này cần thiết cho Modal bạn bè khi xem profile người khác
  async getUserFriends(userId: string, params?: PageParams): Promise<FriendshipResponse[]> {
      // Backend: GET /api/v1/friends/user/{userId}
      try {
          const res = await http.get<any>(`/friends/user/${userId}`, { params }); 
          return res.data?.data?.content || [];
      } catch (e) {
          console.warn("API lấy bạn bè người khác chưa sẵn sàng hoặc lỗi:", e);
          return [];
      }
  }

  async getIncomingRequests(params?: PageParams): Promise<FriendshipResponse[]> {
    const res = await http.get<any>('/friends/requests/incoming', { params });
    return res.data?.data?.content || [];
  }

  async searchUsers(query: string): Promise<UserSummary[]> {
    const res = await http.get<any>('/users/search', { params: { query } });
    return res.data?.data || [];
  }

  // [HÀM ĐÚNG TÊN] Được sử dụng trong ProfilePage
  async sendFriendRequest(targetUserId: any): Promise<void> {
    await http.post('/friends/request', { targetUserId });
  }

  async acceptRequest(friendshipId: any): Promise<void> {
    await http.post(`/friends/accept/${friendshipId}`);
  }

  async declineRequest(friendshipId: any): Promise<void> {
    await http.post(`/friends/decline/${friendshipId}`);
  }

  // [QUAN TRỌNG] Hàm hủy kết bạn cho ChatHeader gọi
  async unfriend(targetUserId: any): Promise<void> {
    // API Backend: DELETE /api/v1/friends/{targetUserId}
    await http.delete(`/friends/${targetUserId}`);
  }
}

export const friendService = new FriendService();