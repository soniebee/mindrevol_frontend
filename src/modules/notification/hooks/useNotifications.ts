import { useState, useEffect } from 'react';
import { notificationService, NotificationResponse } from '../services/notification.service';
// import { boxService } from '@/modules/box/services/box.service';
// import { journeyService } from '@/modules/journey/services/journey.service'; // Chuẩn bị cho tương lai
// import { friendshipService } from '@/modules/user/services/friendship.service'; // Chuẩn bị cho tương lai
import { toast } from 'react-hot-toast';

export const useNotifications = (isOpen: boolean) => {
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
            const normalizedData = (data.content || []).map((n: any) => ({
                ...n, isRead: n.isRead !== undefined ? n.isRead : n.read 
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
    // Thêm module mới? Chỉ cần thêm case ở đây!
    // ==========================================
    const handleAction = async (action: 'ACCEPT' | 'REJECT', noti: NotificationResponse) => {
        try {
            if (noti.type === 'BOX_INVITE') {
                action === 'ACCEPT' 
                    // ? await boxService.acceptInvite(noti.referenceId)
                    // : await boxService.rejectInvite(noti.referenceId);
            } 
            else if (noti.type === 'JOURNEY_INVITE') {
                // action === 'ACCEPT' ? await journeyService.acceptInvitation(noti.referenceId) : ...
            }
            else if (noti.type === 'FRIEND_REQUEST') {
                // action === 'ACCEPT' ? await friendshipService.acceptRequest(noti.referenceId) : ...
            }

            if (action === 'ACCEPT') toast.success("Đã chấp nhận thành công!");
            if (action === 'REJECT') toast.success("Đã từ chối!");

            // Xử lý xong thì đánh dấu đã đọc để ẩn nút
            await markAsRead(noti.id);
            
            return true; // Trả về true nếu thành công để UI điều hướng nếu cần
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Yêu cầu đã hết hạn hoặc có lỗi xảy ra");
            await markAsRead(noti.id); // Lỗi cũng ẩn nút luôn cho sạch
            return false;
        }
    };

    const filteredNotifications = filter === 'ALL' ? notifications : notifications.filter(n => !n.isRead);

    return {
        notifications: filteredNotifications,
        isLoading, filter, setFilter,
        markAsRead, markAllAsRead, deleteNotification, deleteAll, handleAction
    };
};