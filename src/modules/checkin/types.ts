export enum CheckinStatus {
  NORMAL = 'NORMAL',
  REST = 'REST',
  FAILED = 'FAILED', 
  LATE = 'LATE',
  COMEBACK = 'COMEBACK'
}

export enum ActivityType {
  DEFAULT = 'DEFAULT',
  LEARNING = 'LEARNING',
  WORKING = 'WORKING',
  EXERCISING = 'EXERCISING',
  TRAVELING = 'TRAVELING',
  DATING = 'DATING',
  GAMING = 'GAMING',
  EATING = 'EATING',
  READING = 'READING',
  CHILLING = 'CHILLING',
  CREATING = 'CREATING',
  CUSTOM = 'CUSTOM'
}

export type Emotion = string;

export interface Checkin {
  id: string;
  userId: string; 
  userFullName: string;
  userAvatar: string;
  // [ĐÃ SỬA] Thay đổi journeyId thành Optional vì bài lưu trữ không có hành trình
  journeyId?: string;
  
  imageUrl: string;
  thumbnailUrl: string;
  videoUrl?: string; 
  caption: string;
  
  activityType: ActivityType;
  activityName?: string;
  locationName?: string;
  emotion?: string;
  tags?: string[];

  status: CheckinStatus;
  createdAt: string;
  checkinDate: string;
  
  reactionCount: number;
  commentCount: number;
  latestReactions?: any[]; 
}

export interface CreateCheckinRequest {
  // [ĐÃ SỬA] Thay đổi journeyId thành Optional khi client gửi dữ liệu lên
  journeyId?: string;
  file: File;
  caption?: string;
  
  emotion?: string;       
  activityType?: ActivityType;
  activityName?: string;  
  locationName?: string;
  tags?: string[];
  
  statusRequest?: 'NORMAL' | 'REST'; 
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
}

export interface MapMarkerResponse {
  checkinId: string;
  latitude: number;
  longitude: number;
  thumbnailUrl: string;
  userAvatar: string;
  fullname: string;
}