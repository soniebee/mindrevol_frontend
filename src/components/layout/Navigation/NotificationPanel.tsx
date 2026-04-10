import React from 'react';
import { X, Bell, CheckCheck, Loader2, Trash2, ArrowLeft } from 'lucide-react';
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
                "fixed transition-all duration-500 flex flex-col font-quicksand",
                
                // --- MOBILE: Full màn hình ---
                "inset-0 w-full h-[100dvh] z-[999] bg-white dark:bg-[#121212]", 

                // --- DESKTOP: Panel trượt bên trái, kính mờ ---
                "md:inset-auto md:top-0 md:bottom-0 md:left-[88px] md:w-[400px] md:h-full md:z-40 md:bg-white/95 md:dark:bg-[#121212]/95 md:backdrop-blur-xl md:border-r md:border-[#D6CFC7]/50 md:dark:border-[#2B2A29]/50 md:shadow-[20px_0_40px_rgba(0,0,0,0.05)]",
                
                // Hiệu ứng trượt
                isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
            )}
        >
            {/* HEADER */}
            <div className="p-5 md:p-6 md:pb-4 flex justify-between items-center shrink-0 border-b border-[#D6CFC7]/30 dark:border-[#2B2A29]/50 md:border-none bg-white dark:bg-transparent z-10">
                
                <div className="flex items-center gap-2 md:gap-0">
                    {/* Nút Back (Mobile) */}
                    <button onClick={onClose} className="md:hidden p-2 -ml-2 rounded-[14px] text-[#8A8580] hover:text-[#1A1A1A] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] transition-colors active:scale-95">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    
                    <h2 className="text-[1.6rem] md:text-[1.8rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">
                        Thông báo
                    </h2>
                </div>

                <div className="flex items-center gap-1.5">
                    <button onClick={markAllAsRead} className="text-[#8A8580] hover:text-blue-500 dark:text-[#A09D9A] p-2.5 transition-colors rounded-[16px] hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95" title="Đánh dấu đã đọc tất cả">
                        <CheckCheck size={22} strokeWidth={2.5} />
                    </button>
                    <button onClick={deleteAll} className="text-[#8A8580] hover:text-red-500 dark:text-[#A09D9A] p-2.5 transition-colors rounded-[16px] hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95" title="Xóa tất cả">
                        <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                    
                    {/* Nút Đóng (Desktop) */}
                    <button onClick={onClose} className="hidden md:flex p-2.5 rounded-[16px] text-[#8A8580] hover:text-[#1A1A1A] dark:text-[#A09D9A] dark:hover:text-white hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] transition-colors">
                        <X size={22} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* FILTER BUTTONS */}
            <div className="px-5 md:px-6 py-4 flex items-center gap-3 shrink-0 border-b border-[#D6CFC7]/30 dark:border-[#2B2A29]/50">
                <button 
                    onClick={() => setFilter('ALL')} 
                    className={cn(
                        "px-6 py-2 rounded-[20px] text-[0.9rem] font-extrabold transition-all active:scale-95", 
                        filter === 'ALL' 
                            ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.1)]" 
                            : "bg-[#F4EBE1]/50 text-[#8A8580] hover:text-[#1A1A1A] dark:bg-[#2B2A29]/50 dark:text-[#A09D9A] dark:hover:text-white"
                    )}
                >
                    Tất cả
                </button>
                <button 
                    onClick={() => setFilter('UNREAD')} 
                    className={cn(
                        "px-6 py-2 rounded-[20px] text-[0.9rem] font-extrabold transition-all active:scale-95", 
                        filter === 'UNREAD' 
                            ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.1)]" 
                            : "bg-[#F4EBE1]/50 text-[#8A8580] hover:text-[#1A1A1A] dark:bg-[#2B2A29]/50 dark:text-[#A09D9A] dark:hover:text-white"
                    )}
                >
                    Chưa đọc
                </button>
            </div>

            {/* NOTIFICATION LIST */}
            <div className="flex-1 overflow-y-auto mt-1 custom-scrollbar pb-24 md:pb-4">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#A09D9A]" size={30} /></div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 text-[#8A8580] flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#F4EBE1]/50 dark:bg-[#2B2A29]/50 rounded-[24px] flex items-center justify-center mb-6 border border-[#D6CFC7]/50 dark:border-[#3A3734] shadow-sm">
                            <Bell size={40} className="text-[#A09D9A] dark:text-[#8A8580]" strokeWidth={2} />
                        </div>
                        <p className="text-[1.1rem] font-extrabold text-[#4A4A4A] dark:text-[#D6CFC7]">Chưa có thông báo nào</p>
                        <p className="text-[0.95rem] text-[#8A8580] dark:text-[#A09D9A] font-semibold mt-2 px-8">Chúng mình sẽ báo cho bạn ngay khi có tin mới.</p>
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