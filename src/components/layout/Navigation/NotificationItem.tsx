import React from 'react';
import { X, Bell, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

    // [TASK-103] Nút hành động biến mất nếu đã Read
    const requiresAction = ACTIONABLE_TYPES.includes(noti.type) && !noti.isRead;

    const handleClick = () => {
        if (requiresAction) return; // Chặn click toàn dòng nếu đang có nút action
        onClick(noti);
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "px-6 py-4 transition-colors cursor-pointer flex gap-4 relative border-b border-zinc-100 dark:border-white/5 group",
                !noti.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-zinc-50 dark:hover:bg-white/5"
            )}
        >
            {/* Chấm xanh biểu thị chưa Read (Click) */}
            {!noti.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />}

            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    {noti.imageUrl ? (
                        noti.imageUrl.startsWith('http') ? <img src={noti.imageUrl} alt="" className="w-full h-full object-cover" /> : noti.imageUrl
                    ) : (
                        <Bell size={20} className="text-zinc-400 dark:text-zinc-500" />
                    )}
                </div>
                {/* [TASK-101] Icon nhỏ đè lên góc avatar nếu là thông báo gộp nhóm */}
                {noti.actorsCount > 1 && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#121212] rounded-full p-0.5">
                        <div className="bg-blue-500 rounded-full p-1 text-white">
                            <Users size={12} />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-bold text-black dark:text-white mb-0.5 truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                    {noti.title}
                </h4>
                <p className={cn("text-[14px] leading-snug pr-4", !noti.isRead ? "text-zinc-800 dark:text-zinc-200 font-medium" : "text-zinc-500 dark:text-zinc-400")}>
                    {noti.message}
                </p>
                <p className="text-[11px] text-blue-500 dark:text-blue-400 font-bold mt-1.5 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true })}
                </p>

                {requiresAction && (
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction(e, 'ACCEPT', noti); }}
                            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-[10px] transition-all shadow-sm"
                        >
                            Đồng ý
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction(e, 'REJECT', noti); }}
                            className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-[10px] transition-all border border-zinc-200 dark:border-zinc-700"
                        >
                            Từ chối
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={(e) => onDelete(e, noti.id)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Xóa thông báo"
            >
                <X size={16} />
            </button>
        </div>
    );
};