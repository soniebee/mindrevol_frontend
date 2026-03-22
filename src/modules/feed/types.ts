// src/modules/feed/types.ts

// 1. Enums
export enum InteractionType {
  PRIVATE_REPLY = 'PRIVATE_REPLY',
  GROUP_DISCUSS = 'GROUP_DISCUSS',
  RESTRICTED = 'RESTRICTED'
}

export enum Emotion {
  EXCITED = 'EXCITED',
  NORMAL = 'NORMAL',
  TIRED = 'TIRED',
  HOPELESS = 'HOPELESS'
}

export enum CheckinStatus {
  NORMAL = 'NORMAL',
  FAILED = 'FAILED',
  COMEBACK = 'COMEBACK',
  REST = 'REST',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  REJECTED = 'REJECTED'
}

// 2. Data Models (API Response)
export interface ReactionDetail {
  id: string;
  userId: number;
  userFullName: string;
  userAvatar: string;
  emoji: string;
  mediaUrl?: string;
  createdAt: string;
}

// [CẬP NHẬT] Thêm type discriminator và isSaved
export interface JourneyPost {
  type: 'POST'; // Cờ nhận biết
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  emotion: Emotion;
  status: CheckinStatus;
  caption: string;
  createdAt: string;
  userId: number;
  userAvatar: string;
  userFullName: string;
  journeyId: string;
  journeyName?: string;
  interactionType: InteractionType;
  
  // Dữ liệu ngữ cảnh
  activityName?: string;
  locationName?: string;
  taskTitle?: string;

  reactionCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isSaved?: boolean; // [MỚI] Thêm cờ nhận biết bài đã lưu từ API trả về
  latestReactions: ReactionDetail[];
}

// Alias cho Service
export type Checkin = JourneyPost;

// 3. Request Models
export interface CreateCheckinRequest {
  file: File;
  journeyId: string;
  caption?: string;
  statusRequest?: string; 
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  emotion?: Emotion;
  activityType?: string;  
  activityName?: string;
  locationName?: string;
  tags?: string[];
}

// [MỚI] Type cho Quảng cáo
export interface AdProps {
  id: string;
  type: 'AD'; // Cờ nhận biết
  title: string;
  description?: string;
  imageUrl: string;
  ctaText: string; 
  ctaLink: string;
  brandName?: string;
  brandLogo?: string;
}

export interface PostProps {
  type: 'POST';
  id: string;
  userId: string; // Vẫn giữ lại cho an toàn tương thích ngược
  user: { 
    id: string; // [ĐÃ SỬA] Thêm id vào đây để HomeFeed không bị lỗi
    name: string; 
    avatar: string; 
  };
  image: string;
  caption: string;
  
  // Logic hiển thị
  status: 'completed' | 'failed' | 'comeback' | 'rest' | 'normal'; 
  emotion: Emotion;           
  interactionType: InteractionType; 
  
  // Các trường hiển thị nhãn
  activityName?: string; 
  locationName?: string;
  taskName?: string; 
  
  timestamp: string;
  reactionCount: number;
  commentCount: number;
  latestReactions: ReactionDetail[];

  isLiked?: boolean; 
  isSaved?: boolean; 
}

// [QUAN TRỌNG] Union Type dùng cho danh sách Feed
export type FeedItem = PostProps | AdProps;