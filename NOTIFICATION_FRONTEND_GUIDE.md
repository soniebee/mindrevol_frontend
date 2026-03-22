# 🔔 Notification System - Frontend Implementation Guide

## Quick Start

### 1. Display Notifications
```tsx
import { NotificationPanel } from '@/components/layout/Navigation/NotificationPanel';

export const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Notifications
      </button>
      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
```

### 2. Use Notifications Hook
```tsx
import { useNotifications } from '@/modules/notification/hooks/useNotifications';

export const NotificationList = () => {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    handleAction
  } = useNotifications(true);

  return (
    <div>
      {notifications.map(noti => (
        <div key={noti.id} onClick={() => markAsRead(noti.id)}>
          {noti.title}
        </div>
      ))}
      <button onClick={markAllAsRead}>Mark All Read</button>
    </div>
  );
};
```

### 3. Open Settings
```tsx
import { NotificationSettingsModal } from '@/modules/notification/components/NotificationSettingsModal';

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>⚙️ Settings</button>
      <NotificationSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
```

---

## Notification Types Supported

### Friend Actions
- `FRIEND_REQUEST` - Incoming friend request
- `FRIEND_ACCEPTED` - Friend request accepted

### Box (Group) Actions
- `BOX_INVITE` - Invited to a box (Actionable)
- `BOX_REMOVED` - Removed from box
- `BOX_MEMBER_REMOVED` - Member removed

### Journey
- `JOURNEY_INVITE` - Invited to journey (Actionable)

### Interactions
- `CHECKIN_REACTED` - Someone reacted to your check-in
- `MOOD_REACTED` - Someone reacted to your mood
- `POST_REACTION` - Reaction to post

### Mentions
- `MOOD_MENTIONED` - You were mentioned in mood
- `TAG_MENTIONED` - You were tagged
- `COMMENT_MENTIONED` - You were mentioned in comment

### System
- `SYSTEM_ANNOUNCEMENT` - System messages
- `SHARED_WITH_YOU` - Content shared with you

---

## ActionableNotification Flow

**Actionable notifications** (BOX_INVITE, JOURNEY_INVITE, FRIEND_REQUEST) show Accept/Reject buttons:

### User Flow
1. User sees notification with action buttons
2. Clicks "Chấp nhận" (Accept) or "Từ chối" (Reject)
3. Button shows loading spinner
4. API call sends action
5. Toast shows result
6. Notification marked as read
7. `actionStatus` updates to ACCEPTED/REJECTED

### Code Example
```typescript
// In NotificationItem.tsx
const handleActionClick = async (e, action) => {
  setIsLoading(true);
  try {
    await onAction(e, action, noti);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Settings Configuration

### Master Toggles (Top-level)
- `pushEnabled` - Enable/disable all push notifications
- `inAppEnabled` - Enable/disable in-app notifications (NEW)
- `emailEnabled` - Enable/disable all email notifications

### Category Toggles
When master toggle is ON, users can customize per category:

**Push Notifications:**
- `pushFriendRequest` - Friend request notifications
- `pushNewComment` - New comment notifications
- `pushReaction` - Reaction notifications
- `pushJourneyInvite` - Journey invite notifications

**Email:**
- `emailDailyReminder` - Daily digest emails
- `emailUpdates` - System update emails

### Future: Do Not Disturb
```typescript
{
  dndEnabled: true,
  dndStartHour: 22,    // 10 PM
  dndEndHour: 6        // 6 AM
}
```

---

## API Reference

### Service: `notificationService`

```typescript
// Fetch notifications
await notificationService.getMyNotifications(page: number, size: number)
// Returns: { content: NotificationResponse[], totalPages, totalElements, ... }

// Get unread count
await notificationService.getUnreadCount()
// Returns: number

// Mark single as read
await notificationService.markAsRead(id: string)

// Mark all as read
await notificationService.markAllAsRead()

// Mark all as seen (removes badge)
await notificationService.markAllAsSeen()

// Delete single
await notificationService.deleteNotification(id: string)

// Delete all
await notificationService.deleteAllNotifications()
```

### Service: `userService`

```typescript
// Get settings
await userService.getNotificationSettings()
// Returns: NotificationSettings

// Update settings
await userService.updateNotificationSettings(data: Partial<NotificationSettings>)
// Returns: NotificationSettings
```

---

## Aggregation: Group Notifications

When backend sends multiple notifications for same `referenceId`:

```typescript
// Backend should send aggregated data
{
  id: "noti-1",
  type: "MOOD_REACTED",
  referenceId: "mood-123",
  messageArgs: JSON.stringify(["Alice", "Bob"]),
  actorsCount: 5,  // Total people who reacted
  ...
}
```

### Frontend Display
- Shows: "Alice, Bob và 3 người khác"
- Badge: +3
- Smooth UI without layout shift

---

## Error Handling

All notification operations include error handling:

```typescript
// In useNotifications.ts handleAction()
try {
  // API call
} catch (error: unknown) {
  const message = error instanceof Error 
    ? error.message 
    : 'Yêu cầu đã hết hạn hoặc có lỗi xảy ra';
  toast.error(message);
  return false;
}
```

---

## Performance Tips

1. **Lazy load notification images:**
   ```tsx
   <img src={imageUrl} alt="" loading="lazy" />
   ```

2. **Memoize notification items:**
   ```tsx
   export const NotificationItem = React.memo((props) => ...)
   ```

3. **Virtualize long lists (future):**
   - Use react-window for 1000+ notifications

4. **Optimize re-renders:**
   - Use `useCallback` for event handlers
   - Memoize filtered notifications

---

## Dark Mode Support

All components fully support dark mode via Tailwind:

```typescript
// Example class structure
className="bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white"

// Icon colors
'text-indigo-600 dark:text-indigo-300'

// Backgrounds
'bg-indigo-50 dark:bg-indigo-500/15'
```

---

## i18n (Internationalization)

### Current Implementation (Vietnamese)
- Hardcoded Vietnamese text with proper diacritics
- Fallback i18n for aggregation text

### Fallback Dictionary
```typescript
const I18N_FALLBACK = {
  'noti.and_others': 'và {{count}} người khác'
};
```

### Future: Full i18n Migration
Planned for Sprint 3:
- Integrate `react-i18next`
- Extract all strings to translation files
- Support multiple languages (EN, VI, etc.)

---

## Accessibility

✅ **Implemented:**
- Proper button labels ("Chấp nhận", "Từ chối")
- Color contrast WCAG AA compliant
- Loading state indicators
- Semantic HTML structure

⚠️ **Not yet implemented:**
- ARIA labels for complex interactions
- Keyboard navigation testing
- Screen reader support

---

## Common Issues & Solutions

### Issue: Notifications not updating
**Solution:** Ensure `useNotifications(isOpen)` is called when panel opens:
```typescript
useEffect(() => {
  if (isOpen) fetchNotifications();
}, [isOpen]);
```

### Issue: Action buttons not responding
**Solution:** Check that services (boxService, friendService, journeyService) are properly imported and initialized.

### Issue: Aggregation count incorrect
**Solution:** Backend must send `actorsCount` and `messageArgs` fields. Verify API response structure.

### Issue: Settings not persisting
**Solution:** Check that `userService.updateNotificationSettings()` endpoint is working and returns updated data.

---

## Testing Checklist

- [ ] Open/close NotificationPanel
- [ ] Click notification to mark as read
- [ ] Click action buttons (Accept/Reject)
- [ ] Change settings in NotificationSettingsModal
- [ ] Reload page - settings should persist
- [ ] Dark mode toggle
- [ ] Mobile responsive layout
- [ ] Test with aggregated notifications (5+ reactions)

---

## Files Reference

```
src/
├── modules/notification/
│   ├── components/
│   │   └── NotificationSettingsModal.tsx  (Settings UI)
│   ├── hooks/
│   │   └── useNotifications.ts            (State management)
│   ├── services/
│   │   └── notification.service.ts        (API calls)
│   └── constants.ts                       (Type mappings)
└── components/layout/Navigation/
    ├── NotificationPanel.tsx              (Main panel UI)
    ├── NotificationItem.tsx               (Item renderer)
    └── index.tsx                          (Navigation header)
```

---

## Backend Integration Checklist

- [ ] Implement `PATCH /notifications/seen-all`
- [ ] Add `isSeen` field to Notification entity
- [ ] Add `inAppEnabled` to notification_settings
- [ ] Send aggregated notifications with `actorsCount`
- [ ] Emit new notification types (TAG_MENTIONED, etc.)
- [ ] Support `messageKey` and `messageArgs` fields
- [ ] Implement `actionStatus` field (PENDING/ACCEPTED/REJECTED)

---

## Support & Questions

For issues or questions about notification system:
1. Check SPRINT_2_NOTIFICATION_COMPLETION.md for detailed status
2. Review constants.ts for supported types
3. Check console for error messages
4. Verify backend API responses match expected format

---

*Last Updated: March 22, 2026*

