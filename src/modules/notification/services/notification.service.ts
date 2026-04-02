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

    // --- Sprint 2 additions (supports clearing the red badge in NotificationItem.tsx) ---
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

    // [Sprint 2 addition] Mark as seen (clear the red badge on the bell)
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