import {
  Bell,
  Heart,
  AtSign,
  UserPlus,
  UserCheck,
  Package,
  MessageCircle,
  LucideIcon,
} from 'lucide-react';
import { NotificationResponse } from './services/notification.service';

interface NotificationUiMeta {
  icon: LucideIcon;
  iconClassName: string;
  iconContainerClassName: string;
}

const DEFAULT_META: NotificationUiMeta = {
  icon: Bell,
  iconClassName: 'text-zinc-500 dark:text-zinc-300',
  iconContainerClassName: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
};

const META_BY_TYPE: Record<string, NotificationUiMeta> = {
  FRIEND_REQUEST: {
    icon: UserPlus,
    iconClassName: 'text-blue-600 dark:text-blue-300',
    iconContainerClassName: 'bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30',
  },
  FRIEND_ACCEPTED: {
    icon: UserCheck,
    iconClassName: 'text-emerald-600 dark:text-emerald-300',
    iconContainerClassName: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30',
  },
  BOX_INVITE: {
    icon: Package,
    iconClassName: 'text-violet-600 dark:text-violet-300',
    iconContainerClassName: 'bg-violet-50 dark:bg-violet-500/15 border-violet-200 dark:border-violet-500/30',
  },
  BOX_REMOVED: {
    icon: Package,
    iconClassName: 'text-rose-600 dark:text-rose-300',
    iconContainerClassName: 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30',
  },
  JOURNEY_INVITE: {
    icon: MessageCircle,
    iconClassName: 'text-amber-600 dark:text-amber-300',
    iconContainerClassName: 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30',
  },
  CHECKIN_REACTED: {
    icon: Heart,
    iconClassName: 'text-pink-600 dark:text-pink-300',
    iconContainerClassName: 'bg-pink-50 dark:bg-pink-500/15 border-pink-200 dark:border-pink-500/30',
  },
  MOOD_REACTED: {
    icon: Heart,
    iconClassName: 'text-pink-600 dark:text-pink-300',
    iconContainerClassName: 'bg-pink-50 dark:bg-pink-500/15 border-pink-200 dark:border-pink-500/30',
  },
  MOOD_MENTIONED: {
    icon: AtSign,
    iconClassName: 'text-indigo-600 dark:text-indigo-300',
    iconContainerClassName: 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30',
  },
};

const ACTIONABLE_TYPES = new Set(['BOX_INVITE', 'JOURNEY_INVITE', 'FRIEND_REQUEST']);

export const getNotificationMeta = (type: string): NotificationUiMeta => {
  return META_BY_TYPE[type] ?? DEFAULT_META;
};

export const isActionableNotification = (noti: NotificationResponse): boolean => {
  if (!ACTIONABLE_TYPES.has(noti.type)) return false;
  if (noti.actionStatus && noti.actionStatus !== 'PENDING') return false;
  return !noti.isRead;
};

export const resolveNotificationPath = (noti: NotificationResponse): string | null => {
  const { type, referenceId, senderId } = noti;

  switch (type) {
    case 'FRIEND_REQUEST':
    case 'FRIEND_ACCEPTED':
      return senderId ? `/profile/${senderId}` : '/profile';

    case 'BOX_INVITE':
      return referenceId ? `/box/${referenceId}` : '/box';

    case 'BOX_REMOVED':
      return '/box';

    case 'MOOD_MENTIONED':
    case 'MOOD_REACTED':
    case 'CHECKIN_REACTED':
      return referenceId ? `/?notificationRef=${referenceId}` : '/';

    default:
      return '/';
  }
};

