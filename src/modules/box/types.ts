export interface BoxResponse {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    coverImage?: string;
    themeColor?: string;
    textPosition?: string;   // [THÊM MỚI]
    avatarPosition?: string; // [THÊM MỚI]
    ownerId: string;
    isArchived: boolean;
    memberCount: number;
    createdAt: string;
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
    coverImage?: string;
    themeColor?: string;
    textPosition?: string;   // [THÊM MỚI]
    avatarPosition?: string; // [THÊM MỚI]
}

export interface UpdateBoxRequest extends CreateBoxRequest {}

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