import { http } from '@/lib/http';

export interface NotificationResponse {
    id: string;
    title: string;
    message: string;
    type: string;
    referenceId: string;
    imageUrl: string;
    isRead: boolean;
    createdAt: string;
    senderId: string;
    senderName: string;

    // --- BỔ SUNG SPRINT 2 (Giúp hết báo đỏ ở NotificationItem.tsx) ---
    isSeen?: boolean;
    messageKey?: string;
    messageArgs?: string | string[];
    actionStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    actorsCount?: number;
    actorNames?: string[];
    actorAvatars?: string[];
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const notificationService = {
    getMyNotifications: async (page = 0, size = 30): Promise<PageResponse<NotificationResponse>> => {
        const response = await http.get(`/notifications?page=${page}&size=${size}`);
        return response.data?.data ?? response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await http.get('/notifications/unread-count');
        return response.data?.data ?? response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await http.patch(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await http.patch('/notifications/read-all');
    },

    // [THÊM MỚI SPRINT 2] Đánh dấu đã nhận (xóa số badge đỏ trên chuông)
    markAllAsSeen: async (): Promise<void> => {
        await http.patch('/notifications/seen-all');
    },

    deleteNotification: async (id: string): Promise<void> => {
        await http.delete(`/notifications/${id}`);
    },

    deleteAllNotifications: async (): Promise<void> => {
        await http.delete('/notifications/all');
    }
};