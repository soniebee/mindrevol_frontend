import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { userService } from '@/modules/user/services/user.service';
import type { NotificationSettings } from '@/modules/user/services/user.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailDailyReminder: false,
  emailUpdates: false,
  pushFriendRequest: true,
  pushNewComment: true,
  pushJourneyInvite: true,
  pushReaction: true,
};

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSettings = async () => {
      try {
        const data = await userService.getNotificationSettings();
        setSettings(data);
      } catch (error) {
        console.error('Load notification settings failed', error);
      }
    };

    fetchSettings();
  }, [isOpen]);

  const updateSingleSetting = async (key: keyof NotificationSettings, checked: boolean) => {
    const previousValue = settings[key];
    setSettings((prev) => ({ ...prev, [key]: checked }));

    try {
      setIsLoading(true);
      const updated = await userService.updateNotificationSettings({ [key]: checked });
      setSettings(updated);
    } catch (error) {
      setSettings((prev) => ({ ...prev, [key]: previousValue }));
      console.error('Update notification settings failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cai dat thong bao</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Thong bao day</h3>
            <div className="space-y-1">
              <ToggleRow
                label="Loi moi ket ban"
                checked={settings.pushFriendRequest}
                disabled={isLoading}
                onChange={(checked) => updateSingleSetting('pushFriendRequest', checked)}
              />
              <ToggleRow
                label="Binh luan moi"
                checked={settings.pushNewComment}
                disabled={isLoading}
                onChange={(checked) => updateSingleSetting('pushNewComment', checked)}
              />
              <ToggleRow
                label="Tha cam xuc"
                checked={settings.pushReaction}
                disabled={isLoading}
                onChange={(checked) => updateSingleSetting('pushReaction', checked)}
              />
              <ToggleRow
                label="Loi moi Journey"
                checked={settings.pushJourneyInvite}
                disabled={isLoading}
                onChange={(checked) => updateSingleSetting('pushJourneyInvite', checked)}
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Thong bao Email</h3>
            <div className="space-y-1">
              <ToggleRow
                label="Nhac nho hang ngay"
                checked={settings.emailDailyReminder}
                disabled={isLoading}
                onChange={(checked) => updateSingleSetting('emailDailyReminder', checked)}
              />
              <ToggleRow
                label="Cap nhat he thong"
                checked={settings.emailUpdates}
                disabled={isLoading}
                onChange={(checked) => updateSingleSetting('emailUpdates', checked)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface ToggleRowProps {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, checked, disabled, onChange }) => {
  return (
    <div className="w-full flex items-center justify-between py-2 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</span>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
};

