import { useState, useEffect } from 'react';
import { notificationService, NotificationResponse } from '../services/notification.service';
import { boxService } from '@/modules/box/services/box.service';
import { journeyService } from '@/modules/journey/services/journey.service';
import { friendService } from '@/modules/user/services/friend.service';
import { toast } from 'react-hot-toast';

export const useNotifications = (isOpen: boolean) => {
            const parseNumericReferenceId = (value: string) => {
                const parsed = Number(value);
                return Number.isFinite(parsed) ? parsed : null;
            };

    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.getMyNotifications(0, 30);
            const normalizedData = (data.content || []).map((n: NotificationResponse & { read?: boolean }) => ({
                ...n,
                isRead: n.isRead ?? n.read ?? false
            }));
            setNotifications(normalizedData);
        } catch (error) {
            console.error("Lỗi tải thông báo", error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) { console.error(e); }
    };

    // [THÊM MỚI SPRINT 2] Cập nhật state isSeen và gọi API
    const markAllAsSeen = async () => {
        try {
            // Optimistic UI: Update UI ngay lập tức cho mượt
            setNotifications(prev => prev.map(n => ({ ...n, isSeen: true })));
            await notificationService.markAllAsSeen();
        } catch (e) { console.error("Lỗi mark all as seen", e); }
    };

    const deleteNotification = async (id: string) => {
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            await notificationService.deleteNotification(id);
        } catch (e) { console.error(e); }
    };

    const deleteAll = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn dọn sạch toàn bộ thông báo không?")) return;
        try {
            setNotifications([]);
            await notificationService.deleteAllNotifications();
            toast.success("Đã dọn sạch thông báo");
        } catch (e) { console.error(e); }
    };

    // ==========================================
    // TRUNG TÂM XỬ LÝ HÀNH ĐỘNG (STRATEGY HUB)
    // ==========================================
    const handleAction = async (action: 'ACCEPT' | 'REJECT', noti: NotificationResponse) => {
        try {
            if (noti.type === 'BOX_INVITE') {
                if (action === 'ACCEPT') {
                    await boxService.acceptInvite(noti.referenceId);
                } else {
                    await boxService.rejectInvite(noti.referenceId);
                }
            }
            else if (noti.type === 'JOURNEY_INVITE') {
                const invitationId = parseNumericReferenceId(noti.referenceId);
                if (invitationId === null) {
                    throw new Error('Journey invitation id is invalid');
                }

                if (action === 'ACCEPT') {
                    await journeyService.acceptInvitation(invitationId);
                } else {
                    await journeyService.rejectInvitation(invitationId);
                }
            }
            else if (noti.type === 'FRIEND_REQUEST') {
                if (action === 'ACCEPT') {
                    await friendService.acceptRequest(noti.referenceId);
                } else {
                    await friendService.declineRequest(noti.referenceId);
                }
            }

            if (action === 'ACCEPT') toast.success("Đã chấp nhận thành công!");
            if (action === 'REJECT') toast.success("Đã từ chối!");

            await notificationService.markAsRead(noti.id);
            setNotifications((prev) => prev.map((item) => {
                if (item.id !== noti.id) return item;

                return {
                    ...item,
                    isRead: true,
                    actionStatus: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'
                };
            }));

            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yeu cau da het han hoac co loi xay ra';
            toast.error(message);
            return false;
        }
    };

    const filteredNotifications = filter === 'ALL' ? notifications : notifications.filter(n => !n.isRead);

    return {
        notifications: filteredNotifications,
        isLoading, filter, setFilter,
        markAsRead, markAllAsRead,
        markAllAsSeen, // <-- Đã export hàm này ra để Panel dùng
        deleteNotification, deleteAll, handleAction
    };
};