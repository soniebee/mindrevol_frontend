// Dành cho trang BoxList (Giữ nguyên các trường FE đang dùng bằng dấu ? để không lỗi TypeScript)
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
    createdAt?: string;
    lastActivityAt?: string; // BE trả về cái này thay vì createdAt
}

// Khai báo type Journey để hứng cục data BE trả kèm trong Chi tiết Box
export interface JourneyResponse {
    id: string;
    name: string;
    status: string;
}

// Dành riêng cho trang Chi tiết Box (Hứng toàn bộ map, mood, và 2 list hành trình từ BE)
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
    id: string;
    boxId: string;
    boxName: string;
    boxAvatar?: string;
    inviterId: string;
    inviterName: string;
    inviterAvatar?: string;
    status: string;
    sentAt: string;
}