import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Clock, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { userService } from '@/modules/user/services/user.service';
import type { NotificationSettings } from '@/modules/user/services/user.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
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
  label: string;
  description: string;
  keys: Array<keyof NotificationSettings>;
};

const CATEGORY_ROWS: CategoryRow[] = [
  {
    label: 'Comment',
    description: 'Khi co nguoi binh luan vao noi dung cua ban',
    keys: ['pushNewComment', 'inAppNewComment', 'emailNewComment'],
  },
  {
    label: 'Reaction',
    description: 'Khi co nguoi tha cam xuc vao bai viet/check-in',
    keys: ['pushReaction', 'inAppReaction', 'emailReaction'],
  },
  {
    label: 'Tin nhan',
    description: 'Khi co tin nhan moi trong chat/box chat',
    keys: ['pushMessage', 'inAppMessage', 'emailMessage'],
  },
  {
    label: 'Hanh trinh',
    description: 'Loi moi tham gia Journey/Box',
    keys: ['pushJourneyInvite', 'inAppJourneyInvite', 'emailJourneyInvite'],
  },
  {
    label: 'Ket ban',
    description: 'Loi moi ket ban va cap nhat lien quan',
    keys: ['pushFriendRequest', 'inAppFriendRequest', 'emailFriendRequest'],
  },
];

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
          setSettings((prev) => normalizeNotificationSettings(prev));
        }
        console.error('Load notification settings failed', error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, reloadKey]);

  const updateManySettings = async (payload: Partial<NotificationSettings>) => {
    const previousSettings = settings;
    setSettings((prev) => normalizeNotificationSettings({ ...prev, ...payload }));

    try {
      setIsLoading(true);
      const updated = await userService.updateNotificationSettings(payload);
      setSettings((prev) => normalizeNotificationSettings({ ...prev, ...updated }));
    } catch (error) {
      setSettings(previousSettings);
      console.error('Update notification settings failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSingleSetting = async (key: keyof NotificationSettings, value: boolean | number) => {
    await updateManySettings({ [key]: value });
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
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cài đặt thông báo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200 flex items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <button
                onClick={() => setReloadKey((prev) => prev + 1)}
                className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-100"
              >
                Thu lai
              </button>
            </div>
          )}

          <section className="pb-4 border-b border-zinc-100 dark:border-white/10">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell size={14} className="text-yellow-500" /> Danh muc thong bao
            </h3>
            <div className="space-y-2">
              {CATEGORY_ROWS.map((row) => (
                <ToggleRow
                  key={row.label}
                  label={row.label}
                  description={row.description}
                  checked={row.keys.some((key) => Boolean(settings[key]))}
                  disabled={isLoading}
                  onChange={(checked) => {
                    const payload: Partial<NotificationSettings> = {
                      pushEnabled: checked ? true : settings.pushEnabled,
                      inAppEnabled: checked ? true : settings.inAppEnabled,
                      emailEnabled: checked ? true : settings.emailEnabled,
                    };

                    row.keys.forEach((key) => {
                      payload[key] = checked as never;
                    });

                    void updateManySettings(payload);
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock size={14} className="text-emerald-500" /> Khong lam phien (DND)
            </h3>
            <div className="space-y-1">
              <ToggleRow
                label="Bat DND"
                description="Tam dung push trong khung gio chi dinh"
                checked={settings.dndEnabled}
                disabled={isLoading || !settings.pushEnabled}
                onChange={(checked) => updateSingleSetting('dndEnabled', checked)}
              />

              {settings.dndEnabled && (
                <div className="flex gap-4 items-center mt-2 bg-zinc-50 dark:bg-white/5 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <label className="text-xs text-zinc-500">Tu (gio)</label>
                    <select
                      value={settings.dndStartHour}
                      onChange={(e) => updateSingleSetting('dndStartHour', parseInt(e.target.value, 10))}
                      className="bg-transparent text-sm dark:text-white outline-none"
                      disabled={isLoading}
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i} className="text-black">{i}:00</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-zinc-400">-</span>
                  <div className="flex flex-col">
                    <label className="text-xs text-zinc-500">Den (gio)</label>
                    <select
                      value={settings.dndEndHour}
                      onChange={(e) => updateSingleSetting('dndEndHour', parseInt(e.target.value, 10))}
                      className="bg-transparent text-sm dark:text-white outline-none"
                      disabled={isLoading}
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i} className="text-black">{i}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>

          {isLoading && (
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

