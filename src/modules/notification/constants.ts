import {
  Bell,
  Heart,
  AtSign,
  UserPlus,
  UserCheck,
  Package,
  MessageCircle,
  MessageSquare,
  Share2,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { NotificationResponse } from './services/notification.service';

interface NotificationUiMeta {
  icon: LucideIcon;
  iconClassName: string;
  iconContainerClassName: string;
}

export type NotificationCategory = 'COMMENT' | 'REACTION' | 'MESSAGE' | 'JOURNEY' | 'FRIEND' | 'OTHER';

export const CATEGORY_SETTINGS_KEYS: Record<Exclude<NotificationCategory, 'OTHER'>, readonly (keyof NotificationSettingsLike)[]> = {
  COMMENT: ['pushNewComment', 'inAppNewComment', 'emailNewComment'],
  REACTION: ['pushReaction', 'inAppReaction', 'emailReaction'],
  MESSAGE: ['pushMessage', 'inAppMessage', 'emailMessage'],
  JOURNEY: ['pushJourneyInvite', 'inAppJourneyInvite', 'emailJourneyInvite'],
  FRIEND: ['pushFriendRequest', 'inAppFriendRequest', 'emailFriendRequest'],
};

interface NotificationSettingsLike {
  pushNewComment?: boolean;
  inAppNewComment?: boolean;
  emailNewComment?: boolean;
  pushReaction?: boolean;
  inAppReaction?: boolean;
  emailReaction?: boolean;
  pushMessage?: boolean;
  inAppMessage?: boolean;
  emailMessage?: boolean;
  pushJourneyInvite?: boolean;
  inAppJourneyInvite?: boolean;
  emailJourneyInvite?: boolean;
  pushFriendRequest?: boolean;
  inAppFriendRequest?: boolean;
  emailFriendRequest?: boolean;
}

const DEFAULT_META: NotificationUiMeta = {
  icon: Bell,
  iconClassName: 'text-zinc-500 dark:text-zinc-300',
  iconContainerClassName: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
};

const META_BY_TYPE: Record<string, NotificationUiMeta> = {
  // Friend & Connection Types
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

  // Box Types
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
  BOX_MEMBER_REMOVED: {
    icon: UserPlus,
    iconClassName: 'text-orange-600 dark:text-orange-300',
    iconContainerClassName: 'bg-orange-50 dark:bg-orange-500/15 border-orange-200 dark:border-orange-500/30',
  },
  BOX_MEMBER_JOINED: {
    icon: UserCheck,
    iconClassName: 'text-emerald-600 dark:text-emerald-300',
    iconContainerClassName: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30',
  },

  // Journey Types
  JOURNEY_INVITE: {
    icon: MessageCircle,
    iconClassName: 'text-amber-600 dark:text-amber-300',
    iconContainerClassName: 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30',
  },

  // Interaction Types
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
  POST_REACTION: {
    icon: Heart,
    iconClassName: 'text-red-600 dark:text-red-300',
    iconContainerClassName: 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/30',
  },

  // Mention Types
  MOOD_MENTIONED: {
    icon: AtSign,
    iconClassName: 'text-indigo-600 dark:text-indigo-300',
    iconContainerClassName: 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30',
  },
  TAG_MENTIONED: {
    icon: AtSign,
    iconClassName: 'text-indigo-600 dark:text-indigo-300',
    iconContainerClassName: 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30',
  },
  COMMENT_MENTIONED: {
    icon: MessageSquare,
    iconClassName: 'text-cyan-600 dark:text-cyan-300',
    iconContainerClassName: 'bg-cyan-50 dark:bg-cyan-500/15 border-cyan-200 dark:border-cyan-500/30',
  },

  // System & Other Types
  SYSTEM_ANNOUNCEMENT: {
    icon: AlertCircle,
    iconClassName: 'text-yellow-600 dark:text-yellow-300',
    iconContainerClassName: 'bg-yellow-50 dark:bg-yellow-500/15 border-yellow-200 dark:border-yellow-500/30',
  },
  SHARED_WITH_YOU: {
    icon: Share2,
    iconClassName: 'text-teal-600 dark:text-teal-300',
    iconContainerClassName: 'bg-teal-50 dark:bg-teal-500/15 border-teal-200 dark:border-teal-500/30',
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

export const resolveNotificationCategory = (type: string): NotificationCategory => {
  if (!type) return 'OTHER';

  if (type.startsWith('FRIEND_')) return 'FRIEND';

  if (
    type === 'JOURNEY_INVITE' ||
    type.startsWith('BOX_') ||
    type === 'SHARED_WITH_YOU'
  ) {
    return 'JOURNEY';
  }

  if (
    type === 'CHECKIN_REACTED' ||
    type === 'MOOD_REACTED' ||
    type === 'POST_REACTION'
  ) {
    return 'REACTION';
  }

  if (type === 'COMMENT_MENTIONED' || type === 'MOOD_MENTIONED' || type === 'TAG_MENTIONED') {
    return 'COMMENT';
  }

  if (type.includes('MESSAGE') || type.includes('CHAT')) {
    return 'MESSAGE';
  }

  return 'OTHER';
};

export const resolveNotificationPath = (noti: NotificationResponse): string | null => {
  const { type, referenceId, senderId } = noti;

  switch (type) {
    // Friend Routes
    case 'FRIEND_REQUEST':
    case 'FRIEND_ACCEPTED':
      return senderId ? `/profile/${senderId}` : '/profile';

    // Box Routes
    case 'BOX_INVITE':
    case 'BOX_REMOVED':
    case 'BOX_MEMBER_REMOVED':
    case 'BOX_MEMBER_JOINED':
      return referenceId ? `/box/${referenceId}` : '/box';

    // Journey Routes
    case 'JOURNEY_INVITE':
      return referenceId ? `/journey/${referenceId}` : '/journey';

    // Interaction & Mention Routes
    case 'MOOD_MENTIONED':
    case 'MOOD_REACTED':
    case 'CHECKIN_REACTED':
    case 'POST_REACTION':
    case 'TAG_MENTIONED':
      return referenceId ? `/?notificationRef=${referenceId}` : '/';

    case 'COMMENT_MENTIONED':
      return referenceId ? `/?commentRef=${referenceId}` : '/';

    // System Routes
    case 'SYSTEM_ANNOUNCEMENT':
    case 'SHARED_WITH_YOU':
      return null;

    default:
      return '/';
  }
};

