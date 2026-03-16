export interface MoodReactionResponse {
    userId: string;
    fullname: string; // Sửa ở đây
    avatarUrl: string; // Sửa ở đây
    emoji: string;
}

export interface MoodResponse {
    id: string;
    boxId: string;
    userId: string;
    fullname: string; // Sửa ở đây
    avatarUrl: string; // Sửa ở đây
    icon: string;
    message: string;
    createdAt: string;
    expiresAt: string;
    reactions: MoodReactionResponse[];
}

export interface MoodRequest {
    icon: string;
    message?: string;
}