import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { userService } from '@/modules/user/services/user.service';
import type { NotificationSettings } from '@/modules/user/services/user.service';
import {
  resolveNotificationCategory,
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


// Chỉ lưu trạng thái bật/tắt từng danh mục (không push/email/in-app)
type CategorySettings = Record<Exclude<NotificationCategory, 'OTHER'>, boolean>;
const CATEGORY_KEYS: Exclude<NotificationCategory, 'OTHER'>[] = [
  'COMMENT', 'REACTION', 'MESSAGE', 'JOURNEY', 'FRIEND'
];

const getCategorySettingsFromStorage = (): CategorySettings => {
  try {
    const raw = localStorage.getItem('notification_category_settings');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    COMMENT: true,
    REACTION: true,
    MESSAGE: true,
    JOURNEY: true,
    FRIEND: true,
  };
};

const setCategorySettingsToStorage = (settings: CategorySettings) => {
  localStorage.setItem('notification_category_settings', JSON.stringify(settings));
};

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [categorySettings, setCategorySettings] = useState<CategorySettings>(getCategorySettingsFromStorage());
  const [dndSettings, setDndSettings] = useState<{ enabled: boolean; startHour: number; endHour: number }>({ enabled: false, startHour: 22, endHour: 6 });
  const [isDndLoading, setIsDndLoading] = useState(false);
  const [dndError, setDndError] = useState<string | null>(null);
  const [pendingDnd, setPendingDnd] = useState<{ enabled: boolean; startHour: number; endHour: number } | null>(null);
  const [lastStableDnd, setLastStableDnd] = useState<{ enabled: boolean; startHour: number; endHour: number }>({ enabled: false, startHour: 22, endHour: 6 });

  useEffect(() => {
    let cancelled = false;
    if (isOpen) {
      setCategorySettings(getCategorySettingsFromStorage());
      setIsDndLoading(true);
      setDndError(null);
      setPendingDnd(null);
      userService.getNotificationSettings()
        .then((data) => {
          if (cancelled) return;
          const dnd = {
            enabled: Boolean(data?.dndEnabled),
            startHour: typeof data?.dndStartHour === 'number' ? data.dndStartHour : 22,
            endHour: typeof data?.dndEndHour === 'number' ? data.dndEndHour : 6,
          };
          setDndSettings(dnd);
          setLastStableDnd(dnd);
        })
        .catch(() => {
          if (cancelled) return;
          setDndError('Không thể tải cấu hình Không làm phiền.');
        })
        .finally(() => { if (!cancelled) setIsDndLoading(false); });
    }
    return () => { cancelled = true; };
  }, [isOpen]);

  const handleCategoryToggle = (category: Exclude<NotificationCategory, 'OTHER'>, checked: boolean) => {
    const newSettings = { ...categorySettings, [category]: checked };
    setCategorySettings(newSettings);
    setCategorySettingsToStorage(newSettings);
  };

  // Validate giờ (0-23), chỉ nhận số nguyên
  const clampHour = (v: number) => Math.max(0, Math.min(23, Number.isFinite(v) ? Math.floor(v) : 0));
  const safeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho nhập số, không ký tự lạ
    const val = e.target.value.replace(/[^\d]/g, '');
    return val === '' ? '' : String(clampHour(Number(val)));
  };

  // Không cập nhật UI trước khi API thành công, revert nếu lỗi
  const updateDnd = async (patch: Partial<{ enabled: boolean; startHour: number; endHour: number }>) => {
    if (isDndLoading) return;
    setIsDndLoading(true);
    setDndError(null);
    const next = { ...dndSettings, ...patch };
    setPendingDnd(next);
    try {
      await userService.updateNotificationSettings({
        dndEnabled: next.enabled,
        dndStartHour: clampHour(next.startHour),
        dndEndHour: clampHour(next.endHour),
      });
      setDndSettings({
        enabled: next.enabled,
        startHour: clampHour(next.startHour),
        endHour: clampHour(next.endHour),
      });
      setLastStableDnd({
        enabled: next.enabled,
        startHour: clampHour(next.startHour),
        endHour: clampHour(next.endHour),
      });
      setPendingDnd(null);
    } catch (e) {
      setDndError('Cập nhật Không làm phiền thất bại.');
      setPendingDnd(null);
      setDndSettings(lastStableDnd); // revert về trạng thái ổn định cuối cùng
    } finally {
      setIsDndLoading(false);
    }
  };

  const handleDndToggle = (checked: boolean) => {
    updateDnd({ enabled: checked });
  };
  const handleDndHourChange = (key: 'startHour' | 'endHour', e: React.ChangeEvent<HTMLInputElement>) => {
    const val = safeInput(e);
    if (val === '') return; // không gửi API nếu rỗng
    updateDnd({ [key]: Number(val) });
  };

  // Hiển thị giá trị đang pending nếu có, ưu tiên pending
  const dndDisplay = pendingDnd || dndSettings;

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
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Quản lý thông báo</h2>
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
            Tắt danh mục chỉ ngăn thông báo mới. Thông báo cũ và tin nhắn trong hội thoại vẫn được giữ nguyên.
          </div>

          <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell size={14} className="text-yellow-500" /> Danh mục thông báo
            </h3>
            <div className="space-y-2">
              {CATEGORY_ROWS.map((row) => (
                <ToggleRow
                  key={row.category}
                  label={row.label}
                  description={row.description}
                  checked={categorySettings[row.category]}
                  disabled={false}
                  onChange={(checked) => handleCategoryToggle(row.category, checked)}
                />
              ))}
            </div>
          </section>

          {/* DND section */}
          <section className="mt-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell size={14} className="text-yellow-500" /> Không làm phiền (DND)
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Bật chế độ không làm phiền</span>
              <Switch checked={dndDisplay.enabled} onChange={handleDndToggle} disabled={isDndLoading} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Từ</span>
              <input
                type="number"
                min={0}
                max={23}
                value={dndDisplay.startHour}
                onChange={e => handleDndHourChange('startHour', e)}
                className="w-14 px-2 py-1 border rounded text-sm bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                disabled={!dndDisplay.enabled || isDndLoading}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">giờ</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">đến</span>
              <input
                type="number"
                min={0}
                max={23}
                value={dndDisplay.endHour}
                onChange={e => handleDndHourChange('endHour', e)}
                className="w-14 px-2 py-1 border rounded text-sm bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                disabled={!dndDisplay.enabled || isDndLoading}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">giờ</span>
            </div>
            {isDndLoading && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Đang đồng bộ với máy chủ...</div>
            )}
            {dndError && (
              <div className="text-xs text-red-500 mt-1">{dndError}</div>
            )}
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Khi bật, bạn sẽ không nhận được thông báo push trong khung giờ đã chọn.
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

