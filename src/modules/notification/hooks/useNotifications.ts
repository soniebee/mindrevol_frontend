import { useState, useEffect } from 'react';
import { notificationService, NotificationResponse } from '../services/notification.service';
import { friendService } from '@/modules/user/services/friend.service';
import { toast } from 'react-hot-toast';

export const useNotifications = (isOpen: boolean) => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    useEffect(() => {
        if (isOpen) {
            fetchNotifications().then(() => {
                // Đánh dấu Seen toàn bộ khi mở panel để mất số đỏ ở icon chuông
                markAllAsSeen();
            });
        }
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

    const markAllAsSeen = async () => {
        try {
            await notificationService.markAllAsSeen();
            setNotifications(prev => prev.map(n => ({ ...n, isSeen: true })));
        } catch (e) { console.error(e); }
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

    const handleAction = async (action: 'ACCEPT' | 'REJECT', noti: NotificationResponse) => {
        try {
            // FE-TASK-103: Handle actionable notifications
            if (noti.type === 'FRIEND_REQUEST') {
                if (action === 'ACCEPT') {
                    await friendService.acceptRequest(noti.referenceId);
                } else {
                    await friendService.declineRequest(noti.referenceId);
                }
            }
            // TODO: Implement BOX_INVITE and JOURNEY_INVITE when services are available
            // else if (noti.type === 'BOX_INVITE') {
            //     action === 'ACCEPT'
            //         ? await boxService.acceptInvite(noti.referenceId)
            //         : await boxService.rejectInvite(noti.referenceId);
            // }
            // else if (noti.type === 'JOURNEY_INVITE') {
            //     const invitationId = parseNumericReferenceId(noti.referenceId);
            //     if (invitationId === null) {
            //         throw new Error('Journey invitation id is invalid');
            //     }
            //     action === 'ACCEPT'
            //         ? await journeyService.acceptInvitation(invitationId)
            //         : await journeyService.rejectInvitation(invitationId);
            // }

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
            const message = error instanceof Error ? error.message : 'Yêu cầu đã hết hạn hoặc có lỗi xảy ra';
            toast.error(message);
            return false;
        }
    };

    const filteredNotifications = filter === 'ALL' ? notifications : notifications.filter(n => !n.isRead);

    return {
        notifications: filteredNotifications,
        isLoading, filter, setFilter,
        markAsRead, markAllAsRead, markAllAsSeen, deleteNotification, deleteAll, handleAction
    };
};