import React from 'react';
import { X, Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/modules/notification/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationResponse } from '@/modules/notification/services/notification.service';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    
    const { 
        notifications, isLoading, filter, setFilter, 
        markAsRead, markAllAsRead, deleteNotification, deleteAll, handleAction 
    } = useNotifications(isOpen);

    const handleItemClick = (noti: NotificationResponse) => {
        if (!noti.isRead) markAsRead(noti.id);
        
        if (['CHECKIN', 'COMMENT'].includes(noti.type)) {
            // navigate(...);
            onClose();
        }
    };

    const handleItemAction = async (e: React.MouseEvent, action: 'ACCEPT' | 'REJECT', noti: NotificationResponse) => {
        const success = await handleAction(action, noti);
        if (success && action === 'ACCEPT' && noti.type === 'BOX_INVITE') {
            navigate(`/box/${noti.referenceId}`);
            onClose();
        }
    };

    return (
        <div 
            className={cn(
                // Căn lề trái 88px khớp với Sidebar mới, shadow nhẹ nhàng không bị gắt
                "fixed top-0 bottom-0 left-[80px] md:left-[88px] w-[350px] bg-white dark:bg-[#121212] border-r border-zinc-200 dark:border-white/10 z-40 shadow-[20px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_40px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col font-sans",
                isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
            )}
        >
            {/* HEADER */}
            <div className="p-6 pb-4 flex justify-between items-center shrink-0">
                <h2 className="text-[26px] font-normal text-black dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>
                    Notifications
                </h2>
                <div className="flex items-center gap-1">
                    <button onClick={markAllAsRead} className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10" title="Mark all as read">
                        <CheckCheck size={20} />
                    </button>
                    <button onClick={deleteAll} className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10" title="Clear all">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* FILTER BUTTONS */}
            <div className="px-6 py-2 flex items-center gap-2 shrink-0">
                <button 
                    onClick={() => setFilter('ALL')} 
                    className={cn(
                        "px-4 py-1.5 rounded-[12px] text-[13px] font-bold transition-all", 
                        filter === 'ALL' ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "bg-zinc-100 text-zinc-500 hover:text-black dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                    )}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('UNREAD')} 
                    className={cn(
                        "px-4 py-1.5 rounded-[12px] text-[13px] font-bold transition-all", 
                        filter === 'UNREAD' ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "bg-zinc-100 text-zinc-500 hover:text-black dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                    )}
                >
                    Unread
                </button>
            </div>

            {/* NOTIFICATION LIST */}
            <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" /></div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 flex flex-col items-center">
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800">
                            <Bell size={28} className="text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <p style={{ fontFamily: '"Jua", sans-serif' }} className="text-lg">No notifications yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((noti) => (
                            <NotificationItem 
                                key={noti.id} 
                                noti={noti} 
                                onClick={handleItemClick}
                                onDelete={async (e, id) => { e.stopPropagation(); deleteNotification(id); }}
                                onAction={handleItemAction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};