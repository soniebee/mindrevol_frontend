import { useState, useEffect } from 'react';
import { resolveNotificationCategory } from '../constants';
// Read per-category on/off state from localStorage
type CategorySettings = Record<'COMMENT' | 'REACTION' | 'MESSAGE' | 'JOURNEY' | 'FRIEND', boolean>;
const getCategorySettingsFromStorage = (): CategorySettings => {
  try {
    const raw = localStorage.getItem('notification_category_settings');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    COMMENT: true,
    REACTION: true,
    MESSAGE: true,
    JOURNEY: true,
    FRIEND: true,
  };
};
import { notificationService, NotificationResponse } from '../services/notification.service';
import { boxService } from '@/modules/box/services/box.service';
import { journeyService } from '@/modules/journey/services/journey.service';
import { friendService } from '@/modules/user/services/friend.service';
import { toast } from 'react-hot-toast';

const parseNumericReferenceId = (value: string): number | null => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const asStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed) as unknown;
            return asStringArray(parsed);
        } catch {
            return [trimmed];
        }
    }

    return [];
};

type NotificationPayload = NotificationResponse & {
    read?: boolean;
    actorCount?: number;
    actorNames?: string[] | string;
    actors?: string[] | string;
    actorAvatars?: string[] | string;
    actorAvatarUrls?: string[] | string;
};

const normalizeNotification = (item: NotificationPayload): NotificationResponse => {
    const actorNames = [
        ...asStringArray(item.actorNames),
        ...asStringArray(item.actors)
    ];

    const actorAvatars = [
        ...asStringArray(item.actorAvatars),
        ...asStringArray(item.actorAvatarUrls)
    ];

    const normalizedMessageArgs = Array.isArray(item.messageArgs)
        ? item.messageArgs.map((value) => String(value))
        : item.messageArgs;

    return {
        ...item,
        isRead: item.isRead ?? item.read ?? false,
        actorsCount: item.actorsCount ?? item.actorCount ?? (actorNames.length > 0 ? actorNames.length : undefined),
        actorNames: actorNames.length > 0 ? Array.from(new Set(actorNames)) : undefined,
        actorAvatars: actorAvatars.length > 0 ? Array.from(new Set(actorAvatars)) : undefined,
        messageArgs: normalizedMessageArgs
    };
};

export const useNotifications = (isOpen: boolean) => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    useEffect(() => {
        if (isOpen) {
            void fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.getMyNotifications(0, 30);
            const normalizedData = (data.content || []).map((item: NotificationPayload) => normalizeNotification(item));
            setNotifications(normalizedData);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) {
            console.error(e);
        }
    };

    // [Sprint 2] Update isSeen state and call the API
    const markAllAsSeen = async () => {
        try {
            // Optimistic UI: update immediately for a smoother experience
            setNotifications(prev => prev.map(n => ({ ...n, isSeen: true })));
            await notificationService.markAllAsSeen();
        } catch (e) {
            console.error("Failed to mark all as seen", e);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            await notificationService.deleteNotification(id);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteAll = async () => {
        if (!window.confirm("Are you sure you want to clear all notifications?")) return;
        try {
            setNotifications([]);
            await notificationService.deleteAllNotifications();
            toast.success("Notifications cleared");
        } catch (e) {
            console.error(e);
        }
    };

    // ==========================================
    // TRUNG TÂM XỬ LÝ HÀNH ĐỘNG (STRATEGY HUB)
    // ==========================================
    const handleAction = async (action: 'ACCEPT' | 'REJECT', noti: NotificationResponse): Promise<boolean> => {
        try {
            if (noti.type === 'BOX_INVITE') {
                if (action === 'ACCEPT') {
                    await boxService.acceptInvite(noti.referenceId);
                } else {
                    await boxService.rejectInvite(noti.referenceId);
                }
            } else if (noti.type === 'JOURNEY_INVITE') {
                const invitationId = parseNumericReferenceId(noti.referenceId);
                if (invitationId === null) {
                    throw new Error('Invalid journey invitation ID');
                }

                if (action === 'ACCEPT') {
                    await journeyService.acceptInvitation(invitationId);
                } else {
                    await journeyService.rejectInvitation(invitationId);
                }
            } else if (noti.type === 'FRIEND_REQUEST') {
                if (action === 'ACCEPT') {
                    await friendService.acceptRequest(noti.referenceId);
                } else {
                    await friendService.declineRequest(noti.referenceId);
                }
            }

            if (action === 'ACCEPT') {
                toast.success("Accepted successfully!");
            } else {
                toast.success("Declined successfully!");
            }

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
            const message = error instanceof Error ? error.message : 'The request has expired or an error occurred';
            toast.error(message);
            return false;
        }
    };

    // Filter by settings
    const categorySettings = getCategorySettingsFromStorage();
    let filteredNotifications = notifications;
    // Filter by category on/off state
    filteredNotifications = filteredNotifications.filter(noti => {
      const cat = resolveNotificationCategory(noti.type);
      if (cat === 'OTHER') return true;
      return categorySettings[cat];
    });
    // Filter unread items if needed
    if (filter === 'UNREAD') {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }
    // Sort newest first
    filteredNotifications = filteredNotifications.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
        notifications: filteredNotifications,
        isLoading,
        filter,
        setFilter,
        markAsRead,
        markAllAsRead,
        markAllAsSeen,
        deleteNotification,
        deleteAll,
        handleAction
    };
};