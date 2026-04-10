// Thêm định nghĩa BoxTab
export type BoxTab = 'all' | 'personal' | 'friends' | 'invitations';

export interface BoxResponse {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    themeSlug?: string;
    textPosition?: string;
    avatarPosition?: string;
    ownerId?: string;
    isArchived?: boolean;
    memberCount: number;
    previewMemberAvatars?: string[];
    createdAt?: string;
    lastActivityAt?: string;
}

export interface JourneyResponse {
    id: string;
    name: string;
    status: string;
}

export interface BoxDetailResponse {
    id: string;
    name: string;
    description: string;
    themeSlug: string;
    avatar: string;
    textPosition: string;
    avatarPosition?: string;
    memberCount: number;
    myRole: string; // 'ADMIN' | 'MEMBER'
    ongoingJourneys: JourneyResponse[];
    endedJourneys: JourneyResponse[];
    mapData?: any;
    moodBubbleData?: any;
}

export interface BoxMemberResponse {
    userId: string;
    fullname: string;
    avatarUrl?: string;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string;
}

export interface BoxPageResponse {
    content: BoxResponse[];
    pageable: any;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface BoxMemberPageResponse {
    content: BoxMemberResponse[];
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface CreateBoxRequest {
    name: string;
    description?: string;
    avatar?: string;
    themeSlug: string;
    textPosition?: string;
    inviteUserIds?: string[];
}

export interface UpdateBoxRequest {
    name?: string;
    description?: string;
    themeSlug?: string;
    avatar?: string;
    textPosition?: string;
}

export interface BoxInvitationResponse {
    id: number; 
    boxId: string;
    boxName: string;
    boxAvatar?: string;
    inviterId: string;
    inviterName: string;
    inviterAvatar?: string;
    status: string;
    sentAt: string;
}