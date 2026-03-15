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
        return response.data.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await http.get('/notifications/unread-count');
        return response.data.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await http.patch(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await http.patch('/notifications/read-all');
    },

    // [THÊM MỚI] Xóa 1 thông báo
    deleteNotification: async (id: string): Promise<void> => {
        await http.delete(`/notifications/${id}`);
    },

    // [THÊM MỚI] Xóa tất cả thông báo
    deleteAllNotifications: async (): Promise<void> => {
        await http.delete('/notifications/all');
    }
};