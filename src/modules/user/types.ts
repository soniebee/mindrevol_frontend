export enum FriendshipStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export interface UserProfile {
  id: string;
  email: string;
  handle: string;
  fullname: string;
  avatarUrl: string;
  bio: string;
  coverUrl?: string;
  
  // Stats
  friendCount: number;
  journeyCount?: number;
  currentStreak?: number; // <--- THÊM DÒNG NÀY
  createdAt?: string;      // <--- Lấy mốc thời gian bắt đầu
  totalCheckins?: number;  // <--- Tổng số bài đã đăng

  friendshipStatus: FriendshipStatus;
  isBlockedByMe: boolean;
  isBlockedByThem: boolean;
  isMe: boolean;
}