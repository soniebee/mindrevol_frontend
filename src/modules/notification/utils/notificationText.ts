import { NotificationResponse } from '../services/notification.service';

const FALLBACK_TRANSLATIONS: Record<string, string> = {
  'noti.and_others': 'and {{count}} others',
  'noti.journey.invite': 'invited you to join journey {{name}}',
  'noti.friend.request': '{{name}} sent you a friend request',
  'noti.friend.accepted': '{{name}} accepted your friend request',
  'noti.box.invite': 'invited you to join box {{name}}',
  'noti.checkin.reacted': '{{name}} reacted to your check-in',
  'noti.mood.reacted': '{{name}} reacted to your mood',
  'noti.comment.mentioned': '{{name}} mentioned you in a comment',
  'noti.box.member.joined': '{{name}} joined the box'
};

const translate = (key: string, params?: Record<string, string | number>) => {
  const template = FALLBACK_TRANSLATIONS[key] ?? key;
  if (!params) return template;

  return Object.entries(params).reduce(
    (text, [name, value]) => text.replace(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), String(value)),
    template
  );
};

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return asStringList(parsed);
    } catch {
      return [trimmed];
    }
  }

  return [];
};

export const parseMessageArgs = (raw?: NotificationResponse['messageArgs']): string[] => {
  return asStringList(raw);
};

export const getAggregatedActorLabel = (notification: NotificationResponse): string => {
  const actorCandidates = [
    ...(notification.actorNames ?? []),
    ...parseMessageArgs(notification.messageArgs),
  ].filter(Boolean);

  const dedupedActors = Array.from(new Set(actorCandidates));
  const fallbackActors = [notification.senderName].filter(Boolean);
  const actors = dedupedActors.length > 0 ? dedupedActors : fallbackActors;
  const shownActors = actors.slice(0, 2);

  const totalActors = notification.actorsCount ?? actors.length;
  const otherCount = Math.max(totalActors - shownActors.length, 0);

  if (shownActors.length === 0) return '';
  if (otherCount <= 0) return shownActors.join(', ');

  return `${shownActors.join(', ')} ${translate('noti.and_others', { count: otherCount })}`;
};

export const getNotificationDisplayText = (notification: NotificationResponse): string => {
  const actorLabel = getAggregatedActorLabel(notification);
  const isAggregated = (notification.actorsCount ?? 0) > 1;

  if (notification.messageKey) {
    const args = parseMessageArgs(notification.messageArgs);
    const firstArg = args[0] || notification.senderName || '';

    return translate(notification.messageKey, {
      name: isAggregated && actorLabel ? actorLabel : firstArg,
      count: Math.max((notification.actorsCount ?? 1) - 1, 0)
    });
  }

  if (isAggregated && actorLabel) {
    if (notification.senderName && notification.message.includes(notification.senderName)) {
      return notification.message.replace(notification.senderName, actorLabel);
    }

    return `${actorLabel} ${notification.message}`;
  }

  return notification.message;
};

