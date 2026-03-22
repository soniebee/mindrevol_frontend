import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { NotificationResponse } from '@/modules/notification/services/notification.service';
import {
    getNotificationMeta,
    isActionableNotification
} from '@/modules/notification/constants';

interface Props {
    noti: NotificationResponse;
    onClick: (noti: NotificationResponse) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onAction: (e: React.MouseEvent, action: 'ACCEPT' | 'REJECT', noti: NotificationResponse) => void;
}

const I18N_FALLBACK: Record<string, string> = {
    'noti.and_others': 'và {{count}} người khác'
};

const t = (key: string, params?: Record<string, string | number>) => {
    const template = I18N_FALLBACK[key] ?? key;
    if (!params) return template;
    return Object.entries(params).reduce(
        (text, [name, value]) => text.replace(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), String(value)),
        template
    );
};

const parseMessageArgs = (raw?: string): string[] => {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((value) => String(value)).filter(Boolean);
        }
        return [];
    } catch {
        return [];
    }
};

export const NotificationItem: React.FC<Props> = ({ noti, onClick, onDelete, onAction }) => {
    const [isLoading, setIsLoading] = useState(false);
    const meta = getNotificationMeta(noti.type);
    const requiresAction = isActionableNotification(noti);
    const isAggregated = (noti.actorsCount ?? 0) > 1;

    const handleClick = () => {
        if (requiresAction) return;
        onClick(noti);
    };

    const handleActionClick = async (e: React.MouseEvent, action: 'ACCEPT' | 'REJECT') => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            await onAction(e, action, noti);
        } finally {
            setIsLoading(false);
        }
    };

    const getActorLabel = (args: string[]) => {
        const actorCandidates = args.filter(Boolean);
        const fallbackActors = [noti.senderName].filter(Boolean);
        const actors = actorCandidates.length > 0 ? actorCandidates : fallbackActors;
        const shownActors = actors.slice(0, 2);

        const totalActors = noti.actorsCount ?? actors.length;
        const otherCount = Math.max(totalActors - shownActors.length, 0);

        if (shownActors.length === 0) return '';
        if (otherCount <= 0) return shownActors.join(', ');

        return `${shownActors.join(', ')} ${t('noti.and_others', { count: otherCount })}`;
    };

    const getDisplayText = () => {
        try {
            const args = parseMessageArgs(noti.messageArgs);
            const actorLabel = getActorLabel(args);

            if (noti.messageKey) {
                const firstArg = args[0] || noti.senderName || '';
                const text = t(noti.messageKey, {
                    name: isAggregated && actorLabel ? actorLabel : firstArg,
                    count: Math.max((noti.actorsCount ?? 1) - 1, 0)
                });
                return text;
            }

            if (isAggregated && actorLabel) {
                if (noti.senderName && noti.message.includes(noti.senderName)) {
                    return noti.message.replace(noti.senderName, actorLabel);
                }
                return `${actorLabel} ${noti.message}`;
            }

            return noti.message;
        } catch {
            return noti.message;
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "px-6 py-4 transition-colors cursor-pointer flex gap-4 relative border-b border-zinc-100 dark:border-white/5 group",
                !noti.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-zinc-50 dark:hover:bg-white/5"
            )}
        >
            {!noti.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />}

            <div className={cn(
                'w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-xl overflow-hidden border relative',
                meta.iconContainerClassName
            )}>
                {noti.imageUrl ? (
                    noti.imageUrl.startsWith('http') ? <img src={noti.imageUrl} alt="" className="w-full h-full object-cover" /> : noti.imageUrl
                ) : (
                    <meta.icon size={20} className={meta.iconClassName} />
                )}

                {isAggregated && (
                    <span className="absolute -right-1 -bottom-1 min-w-5 h-5 px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center border border-white dark:border-[#18181b]">
                        +{Math.min((noti.actorsCount ?? 1) - 1, 99)}
                    </span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-[16px] font-bold text-black dark:text-white mb-0.5 truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                    {noti.title}
                </h4>
                <p className={cn("text-[14px] leading-snug pr-4", !noti.isRead ? "text-zinc-800 dark:text-zinc-200 font-medium" : "text-zinc-500 dark:text-zinc-400")}>
                    {getDisplayText()}
                </p>
                <p className="text-[11px] text-blue-500 dark:text-blue-400 font-bold mt-1.5 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true })}
                </p>

                {requiresAction && (
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={(e) => handleActionClick(e, 'ACCEPT')}
                            disabled={isLoading}
                            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-xs font-bold rounded-[10px] transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[80px]"
                        >
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            <span>{isLoading ? 'Đang xử lý' : 'Chấp nhận'}</span>
                        </button>
                        <button
                            onClick={(e) => handleActionClick(e, 'REJECT')}
                            disabled={isLoading}
                            className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:disabled:bg-zinc-800 dark:text-zinc-300 text-xs font-bold rounded-[10px] transition-colors border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 min-w-[70px]"
                        >
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            <span>{isLoading ? 'Xử lý' : 'Từ chối'}</span>
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={(e) => onDelete(e, noti.id)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete"
            >
                <X size={16} />
            </button>
        </div>
    );
};