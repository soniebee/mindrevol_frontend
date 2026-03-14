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
  coverUrl?: string; // Nếu có
  
  // Stats
  friendCount: number;
  journeyCount?: number;

  // New fields for Public Profile logic
  friendshipStatus: FriendshipStatus;
  isBlockedByMe: boolean;
  isBlockedByThem: boolean;
  isMe: boolean;
}