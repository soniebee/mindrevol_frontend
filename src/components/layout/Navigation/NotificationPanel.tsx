import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Settings } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/modules/notification/hooks/useNotifications';
import { NotificationSettingsModal } from '@/modules/notification/components/NotificationSettingsModal';
import { getNotificationDisplayText } from '@/modules/notification/utils/notificationText';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationPanel: React.FC<Props> = ({ isOpen, onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        isLoading,
        markAsRead,
        markAllAsRead,
        markAllAsSeen,
        deleteNotification,
        handleAction
    } = useNotifications(isOpen);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // If the settings modal is open, skip the panel outside-click handler
            if (isSettingsOpen) return;

            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, isSettingsOpen]);

    useEffect(() => {
        if (isOpen) {
            // Mark as seen when the panel opens to clear the badge count.
            markAllAsSeen();
        }
    }, [isOpen, markAllAsSeen]);

    const selectedNotification = useMemo(() => {
        if (notifications.length === 0) return null;
        if (!selectedNotificationId) return notifications[0];
        return notifications.find((item) => item.id === selectedNotificationId) ?? notifications[0];
    }, [notifications, selectedNotificationId]);

    const selectedNotificationText = selectedNotification ? getNotificationDisplayText(selectedNotification) : '';

    const unreadCount = notifications.filter((notification) => !notification.isSeen).length;

    const handleItemClick = async (notification: (typeof notifications)[number]) => {
        await markAsRead(notification.id);
        setSelectedNotificationId(notification.id);
    };

    const handleDelete = (event: React.MouseEvent, id: string) => {
        event.stopPropagation();
        deleteNotification(id);
    };

    const handleItemAction = async (
        event: React.MouseEvent,
        action: 'ACCEPT' | 'REJECT',
        notification: (typeof notifications)[number]
    ) => {
        event.stopPropagation();
        await handleAction(action, notification);
    };

    // Keep rendering the settings modal even when the notification panel is closed
    return (
        <>
            {isOpen && (
                <div
                    ref={panelRef}
                    className="fixed top-20 right-2 left-2 sm:left-auto sm:right-6 sm:w-[44rem] bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[10000]"
                >
                    <div className="p-4 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-zinc-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={markAllAsRead}
                                className="p-2 text-zinc-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors"
                                title="Mark all as read"
                            >
                                <Check className="w-4 h-4" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSettingsOpen(true);
                                }}
                                className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                title="Notification settings"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[60vh] flex">
                        <div className="flex-1 overflow-y-auto overscroll-contain border-r border-zinc-100 dark:border-white/10">
                            {isLoading ? (
                                <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                    Loading notifications...
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        noti={notification}
                                        onClick={handleItemClick}
                                        onDelete={handleDelete}
                                        onAction={handleItemAction}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
                                    <Bell className="w-8 h-8 mb-3 opacity-20" />
                                    <p className="text-sm">You have no new notifications</p>
                                </div>
                            )}
                        </div>

                        <div className="hidden sm:block w-[20rem] p-4 bg-zinc-50/60 dark:bg-white/[0.03]">
                            {selectedNotification ? (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        {selectedNotification.title}
                                    </h4>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {selectedNotificationText}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                                        {new Date(selectedNotification.createdAt).toLocaleString('en-US')}
                                    </p>
                                </div>
                            ) : (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Select a notification to view its details in the side panel.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="p-2 border-t border-zinc-100 dark:border-white/10">
                        <button className="w-full py-2 text-sm font-medium text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                            View all notifications
                        </button>
                    </div>
                </div>
            )}

            {/* Render outside the if (!isOpen) branch so the modal does not close when clicking inside */}
            <NotificationSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
};