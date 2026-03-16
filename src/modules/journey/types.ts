import { Checkin } from "@/modules/checkin/types";

// --- ENUMS ---
export enum JourneyType {
  HABIT = 'HABIT',
  ROADMAP = 'ROADMAP',
  CHALLENGE = 'CHALLENGE',
  MEMORIES = 'MEMORIES',
  PROJECT = 'PROJECT'
}

export enum JourneyStatus {
  ACTIVE = 'ACTIVE',
  ONGOING = 'ONGOING', 
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  DROPPED = 'DROPPED'
}

export enum JourneyRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
  PENDING = 'PENDING' 
}

export enum JourneyVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY'
}

export enum InteractionType {
  PRIVATE_REPLY = 'PRIVATE_REPLY',
  GROUP_DISCUSS = 'GROUP_DISCUSS',
  RESTRICTED = 'RESTRICTED'
}

export enum JourneyInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum WidgetStatus {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  COMPLETED = 'COMPLETED',
  FROZEN = 'FROZEN',
  OFF_TRACK = 'OFF_TRACK'
}

export enum JourneyTheme {
  TRAVEL = 'TRAVEL',
  FOOD = 'FOOD',
  STUDY = 'STUDY',
  DATING = 'DATING',
  SPORTS = 'SPORTS',
  GAME = 'GAME',
  LIFESTYLE = 'LIFESTYLE',
  OTHER = 'OTHER'
}

// --- SHARED INTERFACES ---
export interface UserSummary {
  id: string; 
  fullname: string;
  avatarUrl: string | null;
  handle: string;
}

// --- INTERFACES ---
export interface CreateJourneyRequest {
  name: string;
  description: string;
  type: JourneyType;
  startDate: string;
  endDate: string;
  theme?: string;
  visibility: JourneyVisibility;
  interactionType?: InteractionType;
  roadmapTasks?: {
    dayNo: number;
    title: string;
    description?: string;
  }[];
  requireApproval?: boolean;
  boxId?: string; 
  themeColor?: string;
  avatar?: string;
}

export interface UpdateJourneySettingsRequest {
  name?: string;
  description?: string;
  theme?: string;
  hasStreak?: boolean;
  requiresFreezeTicket?: boolean;
  isHardcore?: boolean;
  requireApproval?: boolean;
  visibility?: JourneyVisibility; 
  themeColor?: string;
  avatar?: string;
  boxId?: string; 
}

export interface JourneyResponse {
  id: string;
  name: string;
  description: string;
  type: JourneyType;
  status: JourneyStatus | string;
  startDate: string;
  endDate: string;
  theme: string;
  inviteCode: string;
  requireApproval: boolean;
  settingHasStreak: boolean;
  settingReqFreezeTicket: boolean;
  settingIsHardcore: boolean;
  visibility: JourneyVisibility | string;
  interactionType: InteractionType;
  createdAt: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string;
  role?: JourneyRole;
  participantCount: number;
  creatorId: string;
  hasNewUpdates?: boolean;
  previewImages?: string[];

  // [THÊM 2 DÒNG NÀY ĐỂ FIX LỖI]
  themeColor?: string;
  avatar?: string;

  currentUserStatus?: {
    role: string; 
    currentStreak: number;
    totalCheckins: number;
    hasCheckedInToday: boolean;
  };
}

export interface JourneyWidgetResponse {
  journeyName: string;
  currentStreak: number;
  isCompletedToday: boolean;
  latestThumbnailUrl?: string;
  status: WidgetStatus;
  statusLabel: string;
  ownerName: string;
  ownerAvatar?: string;
}

export interface JourneyParticipantResponse {
  id: string; 
  user: UserSummary;
  role: JourneyRole;
  joinedAt: string;
  currentStreak: number;
  totalCheckins: number;
  lastCheckinAt: string | null;
}

export interface JourneyInvitationResponse {
  id: number;
  journeyId: string;
  journeyName: string;
  inviterName: string;
  inviterAvatar?: string;
  status: JourneyInvitationStatus;
  sentAt: string;
  journeyStatus?: JourneyStatus | string;
}

export interface JourneyAlertResponse {
  journeyPendingInvitations: number;
  waitingApprovalRequests: number;
  journeyIdsWithRequests: string[];
}

export interface JoinJourneyRequest {
  inviteCode: string;
}

export interface InviteFriendRequest {
  journeyId: string;
  friendId: string;
}

export interface JourneyRequestResponse {
  id: string; 
  userId: string;
  fullname: string;
  avatarUrl?: string;
  handle: string;
  requestedAt: string;
  status: string;
}

export interface UserActiveJourneyResponse {
  id: string;
  name: string;
  description: string;
  status: string; 
  visibility: string;
  startDate: string;
  endDate?: string;
  thumbnailUrl?: string;     
  theme: JourneyTheme | string;      
  themeColor?: string;
  avatar?: string;
  memberAvatars: (string | null)[]; 
  totalMembers: number;
  daysRemaining: number;
  totalCheckins: number;
  isProfileVisible: boolean; // Thêm dòng này
  checkins: any[]; 
  hasNewUpdates?: boolean;
}

export type Journey = JourneyResponse;