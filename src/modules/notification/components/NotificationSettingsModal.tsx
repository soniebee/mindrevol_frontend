import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { userService } from '@/modules/user/services/user.service';
import type { NotificationSettings } from '@/modules/user/services/user.service';
import {
  CATEGORY_SETTINGS_KEYS,
  type NotificationCategory,
} from '@/modules/notification/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => Promise<void> | void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: false,
  inAppEnabled: true,
  emailDailyReminder: false,
  emailUpdates: false,
  pushFriendRequest: true,
  pushNewComment: true,
  pushJourneyInvite: true,
  pushReaction: true,
  pushMessage: true,
  inAppFriendRequest: true,
  inAppNewComment: true,
  inAppJourneyInvite: true,
  inAppReaction: true,
  inAppMessage: true,
  emailFriendRequest: false,
  emailNewComment: false,
  emailJourneyInvite: false,
  emailReaction: false,
  emailMessage: false,
  dndEnabled: false,
  dndStartHour: 22,
  dndEndHour: 6,
};

const normalizeNotificationSettings = (
  data?: Partial<NotificationSettings> | null
): NotificationSettings => {
  const toSafeHour = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 23 ? parsed : fallback;
  };

  return {
    pushEnabled: Boolean(data?.pushEnabled ?? DEFAULT_SETTINGS.pushEnabled),
    emailEnabled: Boolean(data?.emailEnabled ?? DEFAULT_SETTINGS.emailEnabled),
    inAppEnabled: Boolean(data?.inAppEnabled ?? DEFAULT_SETTINGS.inAppEnabled),
    emailDailyReminder: Boolean(data?.emailDailyReminder ?? DEFAULT_SETTINGS.emailDailyReminder),
    emailUpdates: Boolean(data?.emailUpdates ?? DEFAULT_SETTINGS.emailUpdates),
    pushFriendRequest: Boolean(data?.pushFriendRequest ?? DEFAULT_SETTINGS.pushFriendRequest),
    pushNewComment: Boolean(data?.pushNewComment ?? DEFAULT_SETTINGS.pushNewComment),
    pushJourneyInvite: Boolean(data?.pushJourneyInvite ?? DEFAULT_SETTINGS.pushJourneyInvite),
    pushReaction: Boolean(data?.pushReaction ?? DEFAULT_SETTINGS.pushReaction),
    pushMessage: Boolean(data?.pushMessage ?? DEFAULT_SETTINGS.pushMessage),
    inAppFriendRequest: Boolean(data?.inAppFriendRequest ?? DEFAULT_SETTINGS.inAppFriendRequest),
    inAppNewComment: Boolean(data?.inAppNewComment ?? DEFAULT_SETTINGS.inAppNewComment),
    inAppJourneyInvite: Boolean(data?.inAppJourneyInvite ?? DEFAULT_SETTINGS.inAppJourneyInvite),
    inAppReaction: Boolean(data?.inAppReaction ?? DEFAULT_SETTINGS.inAppReaction),
    inAppMessage: Boolean(data?.inAppMessage ?? DEFAULT_SETTINGS.inAppMessage),
    emailFriendRequest: Boolean(data?.emailFriendRequest ?? DEFAULT_SETTINGS.emailFriendRequest),
    emailNewComment: Boolean(data?.emailNewComment ?? DEFAULT_SETTINGS.emailNewComment),
    emailJourneyInvite: Boolean(data?.emailJourneyInvite ?? DEFAULT_SETTINGS.emailJourneyInvite),
    emailReaction: Boolean(data?.emailReaction ?? DEFAULT_SETTINGS.emailReaction),
    emailMessage: Boolean(data?.emailMessage ?? DEFAULT_SETTINGS.emailMessage),
    dndEnabled: Boolean(data?.dndEnabled ?? DEFAULT_SETTINGS.dndEnabled),
    dndStartHour: toSafeHour(data?.dndStartHour, DEFAULT_SETTINGS.dndStartHour),
    dndEndHour: toSafeHour(data?.dndEndHour, DEFAULT_SETTINGS.dndEndHour),
  };
};

type CategoryRow = {
  category: Exclude<NotificationCategory, 'OTHER'>;
  label: string;
  description: string;
};

const CATEGORY_ROWS: CategoryRow[] = [
  {
    category: 'COMMENT',
    label: 'Comment',
    description: 'Thong bao binh luan va mention trong binh luan',
  },
  {
    category: 'REACTION',
    label: 'Reaction',
    description: 'Thong bao tha cam xuc vao bai viet/check-in/mood',
  },
  {
    category: 'MESSAGE',
    label: 'Tin nhan',
    description: 'Thong bao tin nhan moi trong chat/box chat',
  },
  {
    category: 'JOURNEY',
    label: 'Hanh trinh',
    description: 'Thong bao loi moi Journey/Box va su kien lien quan',
  },
  {
    category: 'FRIEND',
    label: 'Ket ban',
    description: 'Thong bao loi moi ket ban va chap nhan ket ban',
  },
];

const getCategoryEnabled = (
  settings: NotificationSettings,
  category: Exclude<NotificationCategory, 'OTHER'>
) => {
  const keys = CATEGORY_SETTINGS_KEYS[category];
  return keys.some((key) => Boolean(settings[key]));
};

const buildCategoryPayload = (
  category: Exclude<NotificationCategory, 'OTHER'>,
  checked: boolean,
  current: NotificationSettings
): Partial<NotificationSettings> => {
  const payload: Partial<NotificationSettings> = {
    ...current,
  };

  CATEGORY_SETTINGS_KEYS[category].forEach((key) => {
    payload[key] = checked;
  });

  return payload;
};

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose, onUpdated }) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    const fetchSettings = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await userService.getNotificationSettings();
        if (!isCancelled) {
          setSettings(normalizeNotificationSettings(data));
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage('Khong the tai cai dat thong bao. Dang hien thi cau hinh mac dinh.');
          setSettings(normalizeNotificationSettings(DEFAULT_SETTINGS));
        }
        console.error('Load notification settings failed', error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchSettings();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const updateSettings = async (payload: Partial<NotificationSettings>) => {
    const previousSettings = settings;
    setSettings(normalizeNotificationSettings({ ...settings, ...payload }));

    try {
      setIsSaving(true);
      const updated = await userService.updateNotificationSettings(payload);
      setSettings((prev) => normalizeNotificationSettings({ ...prev, ...updated }));
      if (onUpdated) {
        await onUpdated();
      }
    } catch (error) {
      setSettings(previousSettings);
      console.error('Update notification settings failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = async (
    category: Exclude<NotificationCategory, 'OTHER'>,
    checked: boolean
  ) => {
    const payload = buildCategoryPayload(category, checked, settings);
    await updateSettings(payload);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Quan ly thong bao</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 rounded-lg px-3 py-2">
            Tat danh muc chi ngan thong bao moi. Thong bao cu va tin nhan trong hoi thoai van duoc giu nguyen.
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200">
              {errorMessage}
            </div>
          )}

          <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell size={14} className="text-yellow-500" /> Danh muc thong bao
            </h3>
            <div className="space-y-2">
              {CATEGORY_ROWS.map((row) => (
                <ToggleRow
                  key={row.category}
                  label={row.label}
                  description={row.description}
                  checked={getCategoryEnabled(settings, row.category)}
                  disabled={isLoading || isSaving}
                  onChange={(checked) => {
                    void handleCategoryToggle(row.category, checked);
                  }}
                />
              ))}
            </div>
          </section>

          {(isLoading || isSaving) && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Dang dong bo cai dat thong bao...
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, disabled, onChange }) => {
  return (
    <div className="w-full flex items-center justify-between gap-3 py-2 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
};

