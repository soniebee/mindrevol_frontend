import React from 'react';
import { X, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NotificationResponse } from '@/modules/notification/services/notification.service';

interface Props {
    noti: NotificationResponse;
    onClick: (noti: NotificationResponse) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onAction: (e: React.MouseEvent, action: 'ACCEPT' | 'REJECT', noti: NotificationResponse) => void;
}

const ACTIONABLE_TYPES = ['BOX_INVITE', 'JOURNEY_INVITE', 'FRIEND_REQUEST'];

export const NotificationItem: React.FC<Props> = ({ noti, onClick, onDelete, onAction }) => {
    
    const requiresAction = ACTIONABLE_TYPES.includes(noti.type) && !noti.isRead;

    const handleClick = () => {
        if (ACTIONABLE_TYPES.includes(noti.type)) return;
        onClick(noti);
    };

    return (
        <div 
            onClick={handleClick}
            className={cn(
                "px-5 py-4 transition-all duration-300 cursor-pointer flex gap-4 relative border-b border-[#D6CFC7]/30 dark:border-[#2B2A29]/50 group",
                // Highlight nhẹ màu Be/Đen mờ cho thông báo chưa đọc
                !noti.isRead 
                    ? "bg-[#F4EBE1]/40 dark:bg-[#2B2A29]/40" 
                    : "hover:bg-[#F4EBE1]/20 dark:hover:bg-[#1A1A1A]/40"
            )}
        >
            {/* Chấm xanh báo chưa đọc */}
            {!noti.isRead && <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
            
            {/* Avatar viền bo góc vuông mềm mại */}
            <div className="w-14 h-14 rounded-[18px] bg-[#E2D9CE] dark:bg-[#3A3734] shrink-0 flex items-center justify-center text-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/50 dark:border-white/5">
                {noti.imageUrl ? (
                    noti.imageUrl.startsWith('http') ? <img src={noti.imageUrl} alt="" className="w-full h-full object-cover" /> : noti.imageUrl
                ) : (
                    <Bell size={22} className="text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-[1rem] font-extrabold text-[#1A1A1A] dark:text-white mb-1 leading-snug line-clamp-2 tracking-tight">
                    {noti.title}
                </h4>
                <p className={cn(
                    "text-[0.9rem] leading-relaxed pr-4 line-clamp-3", 
                    !noti.isRead ? "text-[#4A4A4A] dark:text-[#D6CFC7] font-bold" : "text-[#8A8580] dark:text-[#A09D9A] font-semibold"
                )}>
                    {noti.message}
                </p>
                <p className="text-[0.75rem] text-[#A09D9A] dark:text-[#8A8580] font-extrabold mt-2 uppercase tracking-widest">
                    {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true, locale: vi })}
                </p>

                {requiresAction && (
                    <div className="flex gap-2.5 mt-3.5">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAction(e, 'ACCEPT', noti); }}
                            className="px-5 py-2.5 bg-[#1A1A1A] dark:bg-white hover:bg-black active:scale-95 text-white dark:text-[#1A1A1A] text-[0.85rem] font-extrabold rounded-[14px] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                        >
                            Chấp nhận
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAction(e, 'REJECT', noti); }}
                            className="px-5 py-2.5 bg-[#F4EBE1] hover:bg-[#E2D9CE] dark:bg-[#2B2A29] dark:hover:bg-[#3A3734] active:scale-95 text-[#1A1A1A] dark:text-white text-[0.85rem] font-extrabold rounded-[14px] transition-all border border-transparent dark:border-[#4A4D55]/30"
                        >
                            Từ chối
                        </button>
                    </div>
                )}
            </div>

            <button 
                onClick={(e) => onDelete(e, noti.id)}
                className="absolute right-4 top-4 p-2 rounded-[14px] text-[#A09D9A] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                title="Xóa"
            >
                <X size={18} strokeWidth={2.5} />
            </button>
        </div>
    );
};