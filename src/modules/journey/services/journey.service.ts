import { http } from '@/lib/http';
import { 
  CreateJourneyRequest, 
  JourneyResponse, 
  JoinJourneyRequest,
  UpdateJourneySettingsRequest,
  JourneyWidgetResponse,
  JourneyParticipantResponse,
  JourneyInvitationResponse,
  JourneyRequestResponse,
  UserActiveJourneyResponse,
  UserSummary
} from '../types';
import { Checkin } from "@/modules/checkin/types";

const JOURNEY_URL = "/journeys"; 
const INVITATION_URL = "/journey-invitations";

export interface JourneyAlertResponse {
  journeyPendingInvitations: number;
  waitingApprovalRequests: number;
  journeyIdsWithRequests: string[];
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const journeyService = {
  getAlerts: async (): Promise<JourneyAlertResponse> => {
    const response = await http.get<{ data: JourneyAlertResponse }>(`${JOURNEY_URL}/alerts`);
    return response.data.data;
  },

  createJourney: async (data: CreateJourneyRequest): Promise<JourneyResponse> => {
    const response = await http.post<{ data: JourneyResponse }>(JOURNEY_URL, data);
    return response.data.data;
  },

  getMyJourneys: async (): Promise<JourneyResponse[]> => {
    const response = await http.get<{ data: JourneyResponse[] }>(`${JOURNEY_URL}/me`);
    return response.data.data;
  },

  // --- 1. Dùng cho Modal / Dashboard (Giữ nguyên logic cũ) ---
  getUserActiveJourneys: async (userId: string): Promise<UserActiveJourneyResponse[]> => {
    const response = await http.get<{ data: UserActiveJourneyResponse[] }>(`${JOURNEY_URL}/users/${userId}/active`);
    return response.data.data;
  },

  // --- 2. Dùng cho Profile (Tab Công khai) ---
  getUserPublicJourneys: async (userId: string): Promise<UserActiveJourneyResponse[]> => {
    const response = await http.get<{ data: UserActiveJourneyResponse[] }>(`${JOURNEY_URL}/users/${userId}/public`);
    return response.data.data;
  },

  // --- 3. Dùng cho Profile (Tab Riêng tư) ---
  getUserPrivateJourneys: async (userId: string): Promise<UserActiveJourneyResponse[]> => {
    const response = await http.get<{ data: UserActiveJourneyResponse[] }>(`${JOURNEY_URL}/users/${userId}/private`);
    return response.data.data;
  },

  updateSettings: async (journeyId: string, settings: UpdateJourneySettingsRequest): Promise<JourneyResponse> => {
    const response = await http.patch<{ data: JourneyResponse }>(`${JOURNEY_URL}/${journeyId}/settings`, settings);
    return response.data.data;
  },

  deleteJourney: async (journeyId: string): Promise<void> => {
    await http.delete(`${JOURNEY_URL}/${journeyId}`);
  },

  joinJourney: async (data: JoinJourneyRequest): Promise<JourneyResponse> => {
    const response = await http.post<{ data: JourneyResponse }>(`${JOURNEY_URL}/join/${data.inviteCode}`);
    return response.data.data;
  },

  leaveJourney: async (journeyId: string): Promise<void> => {
    await http.delete(`${JOURNEY_URL}/${journeyId}/leave`);
  },

  kickMember: async (journeyId: string, memberId: string): Promise<void> => {
    await http.delete(`${JOURNEY_URL}/${journeyId}/members/${memberId}`);
  },

  getParticipants: async (journeyId: string): Promise<JourneyParticipantResponse[]> => {
    const response = await http.get<{ data: JourneyParticipantResponse[] }>(`${JOURNEY_URL}/${journeyId}/participants`);
    return response.data.data;
  },

  transferOwnership: async (journeyId: string, newOwnerId: string): Promise<void> => {
    await http.post(`${JOURNEY_URL}/${journeyId}/transfer-ownership`, null, {
      params: { newOwnerId }
    });
  },

  approveRequest: async (journeyId: string, requestId: string): Promise<void> => {
    await http.post(`${JOURNEY_URL}/${journeyId}/requests/${requestId}/approve`);
  },

  rejectRequest: async (journeyId: string, requestId: string): Promise<void> => {
    await http.post(`${JOURNEY_URL}/${journeyId}/requests/${requestId}/reject`);
  },

  getWidgetInfo: async (journeyId: string): Promise<JourneyWidgetResponse> => {
    const response = await http.get<{ data: JourneyWidgetResponse }>(`${JOURNEY_URL}/${journeyId}/widget-info`);
    return response.data.data;
  },

  getDiscoveryTemplates: async (): Promise<JourneyResponse[]> => {
    return []; 
  },

  forkJourney: async (journeyId: string): Promise<JourneyResponse> => {
    const response = await http.post<{ data: JourneyResponse }>(`${JOURNEY_URL}/${journeyId}/fork`);
    return response.data.data;
  },

  nudgeMember: async (journeyId: string, memberId: string): Promise<void> => {
    await http.post(`${JOURNEY_URL}/${journeyId}/members/${memberId}/nudge`);
  },

  inviteFriend: async (journeyId: string, friendId: string): Promise<void> => {
    await http.post(`${INVITATION_URL}/invite`, { journeyId, friendId });
  },

  acceptInvitation: async (invitationId: number): Promise<void> => {
    await http.post(`${INVITATION_URL}/${invitationId}/accept`);
  },

  rejectInvitation: async (invitationId: number): Promise<void> => {
    await http.post(`${INVITATION_URL}/${invitationId}/reject`);
  },

  getMyPendingInvitations: async (): Promise<JourneyInvitationResponse[]> => {
    const response = await http.get<{ data: { content: JourneyInvitationResponse[] } }>(`${INVITATION_URL}/pending`);
    return response.data.data.content;
  },

  getPendingRequests: async (journeyId: string): Promise<JourneyRequestResponse[]> => {
    const response = await http.get<{ data: JourneyRequestResponse[] }>(`${JOURNEY_URL}/${journeyId}/requests/pending`);
    return response.data.data;
  },

  getRecapFeed: async (journeyId: string): Promise<PageResponse<Checkin>> => {
    const response = await http.get<{ data: PageResponse<Checkin> }>(`${JOURNEY_URL}/${journeyId}/recap`); 
    return response.data.data;
  },

  getInvitableFriends: async (journeyId: string): Promise<UserSummary[]> => {
    const response = await http.get<{ data: UserSummary[] }>(`${JOURNEY_URL}/${journeyId}/friends-invitable`);
    return response.data.data;
  },

  // Cập nhật Profile Visibility
  toggleProfileVisibility: async (journeyId: string): Promise<void> => {
    await http.patch(`${JOURNEY_URL}/${journeyId}/profile-visibility`);
  },
};