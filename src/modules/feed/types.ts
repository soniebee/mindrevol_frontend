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

export interface JourneyPost {
  type: 'POST';
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
  
  activityName?: string;
  locationName?: string;
  taskTitle?: string;

  reactionCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isSaved?: boolean; 
  latestReactions: ReactionDetail[];
}

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

// [CẬP NHẬT] Đổi type thành union để hứng cả 2 loại quảng cáo
export interface AdProps {
  id: string;
  type: 'INTERNAL_AD' | 'AFFILIATE_AD'; 
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
  userId: string;
  user: { 
    id: string; 
    name: string; 
    avatar: string; 
  };
  image: string;
  caption: string;
  
  status: 'completed' | 'failed' | 'comeback' | 'rest' | 'normal'; 
  emotion: Emotion;           
  interactionType: InteractionType; 
  
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

export type FeedItem = PostProps | AdProps;