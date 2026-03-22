import React from 'react';
import { X, Bell, CheckCheck, Loader2, Trash2, ArrowLeft } from 'lucide-react'; // Đã thêm ArrowLeft
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
                "fixed transition-all duration-300 flex flex-col font-sans bg-white dark:bg-[#121212]",
                
                // --- MOBILE: Giao diện full màn hình (như 1 trang riêng) ---
                // z-[999] để đè lên toàn bộ Header và BottomNav của Mobile
                "inset-0 w-full h-[100dvh] z-[999]", 

                // --- DESKTOP: Giao diện Panel trượt bên trái ---
                "md:inset-auto md:top-0 md:bottom-0 md:left-[88px] md:w-[350px] md:h-full md:z-40 md:border-r md:border-zinc-200 md:dark:border-white/10 md:shadow-[20px_0_40px_rgba(0,0,0,0.05)] md:dark:shadow-[20px_0_40px_rgba(0,0,0,0.3)]",
                
                // Hiệu ứng trượt
                isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
            )}
        >
            {/* HEADER */}
            <div className="p-4 md:p-6 md:pb-4 flex justify-between items-center shrink-0 border-b border-zinc-100 dark:border-zinc-800 md:border-none bg-white dark:bg-[#121212] z-10">
                
                <div className="flex items-center gap-2 md:gap-0">
                    {/* Nút Back (Mũi tên) - CHỈ HIỆN TRÊN MOBILE */}
                    <button onClick={onClose} className="md:hidden p-2 -ml-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    
                    <h2 className="text-[24px] md:text-[26px] font-normal text-black dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>
                        Notifications
                    </h2>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={markAllAsRead} className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10" title="Mark all as read">
                        <CheckCheck size={20} />
                    </button>
                    <button onClick={deleteAll} className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10" title="Clear all">
                        <Trash2 size={18} />
                    </button>
                    
                    {/* Nút X (Đóng) - CHỈ HIỆN TRÊN DESKTOP */}
                    <button onClick={onClose} className="hidden md:flex p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* FILTER BUTTONS */}
            <div className="px-4 md:px-6 py-3 md:py-2 flex items-center gap-2 shrink-0 border-b md:border-none border-zinc-50 dark:border-zinc-800/50">
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
            <div className="flex-1 overflow-y-auto mt-1 md:mt-2 custom-scrollbar">
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