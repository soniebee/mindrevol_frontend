import { http } from '@/lib/http';
import { JourneyResponse } from '@/modules/journey/types'; 

export interface CalendarRecap {
  day: number;
  imageUrl: string;
  checkinId: string;
}

// 1. Interface đầy đủ cho Profile User
// src/modules/user/services/user.service.ts

// 1. Interface đầy đủ cho Profile User
export interface UserProfile {
  id: string;
  email?: string;
  handle: string;
  fullname: string;
  avatarUrl: string;
  bio?: string;
  coverUrl?: string;
  role?: string;
  
  // Stats
  friendCount: number;
  journeyCount?: number;
  
  // --- THÊM CÁC DÒNG NÀY ---
  currentStreak?: number; 
  createdAt?: string;      
  totalCheckins?: number;  
  // ------------------------------

  // Trạng thái quan hệ
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED';
  isBlockedByMe?: boolean;
  isBlockedByThem?: boolean;
  isMe?: boolean;

  // [THÊM MỚI] Sửa lỗi đỏ TypeScript ở DesktopSidebar
  accountType?: 'FREE' | 'GOLD' | string;
}

// 2. Interface rút gọn cho Search/List
export interface UserSummary {
  id: string;
  fullname: string;
  handle: string;
  avatarUrl: string;
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'RECEIVED';
}

// 3. Interface cho Settings
export interface NotificationSettings {
  pushEnabled: boolean;           // Bật/tắt toàn bộ push
  emailEnabled: boolean;          // Bật/tắt email
  inAppEnabled: boolean;          // Bật/tắt thông báo trong ứng dụng (THÊM MỚI)
  emailDailyReminder: boolean;
  emailUpdates: boolean;
  pushFriendRequest: boolean;     // Bạn bè
  pushNewComment: boolean;        // Bình luận
  pushJourneyInvite: boolean;     // Lời mời
  pushReaction: boolean;          // Tương tác (Reaction)

  // Optional fine-grained settings (task-201) - backend may rollout incrementally
  pushMessage?: boolean;
  inAppFriendRequest?: boolean;
  inAppNewComment?: boolean;
  inAppJourneyInvite?: boolean;
  inAppReaction?: boolean;
  inAppMessage?: boolean;
  emailFriendRequest?: boolean;
  emailNewComment?: boolean;
  emailJourneyInvite?: boolean;
  emailReaction?: boolean;
  emailMessage?: boolean;

  // DND Mode
  dndEnabled: boolean;
  dndStartHour: number;
  dndEndHour: number;
}

export interface LinkedAccount {
  provider: string;
  email: string;
  avatarUrl: string;
  connected: boolean;
}

export interface UpdateProfileData {
  fullname?: string;
  handle?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatar?: File; 
}

export interface UpdatePasswordOtpRequest {
  otp: string;
  newPassword: string;
}

class UserService {
  
  async getMyProfile(): Promise<UserProfile> {
    const response = await http.get<{ data: UserProfile }>('/users/me');
    return response.data.data;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await http.get<{ data: UserProfile }>(`/users/${userId}/profile`);
    return response.data.data;
  }

  async searchUsers(query: string): Promise<UserSummary[]> {
    if (!query) return [];
    const res = await http.get<{ data: UserSummary[] }>(`/users/search`, { 
      params: { query } 
    });
    return res.data.data;
  }

  async getUserRecaps(userId: string): Promise<JourneyResponse[]> {
    const response = await http.get<{ data: JourneyResponse[] }>(`/users/${userId}/recaps`);
    return response.data.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const formData = new FormData();
    if (data.fullname) formData.append('fullname', data.fullname);
    if (data.handle) formData.append('handle', data.handle);
    if (data.bio) formData.append('bio', data.bio);
    if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);
    if (data.gender) formData.append('gender', data.gender);
    if (data.avatar) formData.append('file', data.avatar); 

    const response = await http.put<{ data: UserProfile }>('/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  async sendOtp(email: string): Promise<void> {
    await http.post('/auth/otp/send', { email });
  }

  async updatePasswordWithOtp(data: UpdatePasswordOtpRequest): Promise<void> {
    await http.post('/auth/update-password-otp', data);
  }

  async blockUser(targetUserId: string): Promise<void> {
    await http.post(`/users/blocks/${targetUserId}`);
  }

  async unblockUser(targetUserId: string): Promise<void> {
    await http.delete(`/users/blocks/${targetUserId}`);
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await http.get<{ data: NotificationSettings }>('/users/settings/notifications');
    const payload = response.data as unknown as { data?: NotificationSettings } | NotificationSettings;
    return 'data' in payload && payload.data ? payload.data : (payload as NotificationSettings);
  }

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await http.put<{ data: NotificationSettings }>('/users/settings/notifications', data);
    const payload = response.data as unknown as { data?: NotificationSettings } | NotificationSettings;
    return 'data' in payload && payload.data ? payload.data : (payload as NotificationSettings);
  }

  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    const response = await http.get<{ data: LinkedAccount[] }>('/users/me/social-accounts');
    return response.data.data;
  }

  async unlinkSocialAccount(provider: string): Promise<void> {
    await http.delete(`/users/me/social-accounts/${provider}`);
  }

  async getSystemConfigs(): Promise<Record<string, string>> {
    const response = await http.get<{ data: Record<string, string> }>('/system/configs');
    return response.data.data;
  }

  async sendFeedback(data: { type: string; content: string; appVersion?: string }): Promise<void> {
    await http.post('/system/feedback', data);
  }

  async deleteAccount(): Promise<void> {
    await http.delete('/users/me');
  }

  async updateFcmToken(token: string): Promise<void> {
    await http.patch('/users/fcm-token', { token });
  }

  async getUserCalendar(userId: string, year: number, month: number): Promise<CalendarRecap[]> {
    const res = await http.get<{ data: CalendarRecap[] }>(`/users/${userId}/calendar`, {
      params: { year, month }
    });
    return res.data.data;
  }
}

export const userService = new UserService();