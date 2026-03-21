// src/modules/user/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Shield, FileText, LogOut, ChevronRight, Moon, Sun, Bell, ArrowLeft } from 'lucide-react'; 
import { useAuth } from '@/modules/auth/store/AuthContext';
import { EditProfileModal } from './EditProfileModal';
import { SecurityModal } from './SecurityModal';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { userService } from '../services/user.service';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/Switch'; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ===== COMPONENT CON: Modal Cài đặt thông báo =====
const NotificationSettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      userService.getNotificationSettings()
        .then(res => {
          // FIX LỖI TS: Gán thẳng res vì API service đã trả về NotificationSettings
          setSettings(res); 
        })
        .catch(err => console.error("Lỗi lấy cài đặt thông báo", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleToggle = async (field: string, checked: boolean) => {
    setSettings((prev: any) => ({ ...prev, [field]: checked }));
    try {
      await userService.updateNotificationSettings({ [field]: checked });
    } catch (e) {
      setSettings((prev: any) => ({ ...prev, [field]: !checked }));
      alert("Không thể lưu cài đặt. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-10 bg-white dark:bg-[#18181b] flex flex-col transition-colors duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-white/10">
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        </button>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Thông báo & Email</h2>
      </div>

      <div className="overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center text-zinc-500 py-10">Đang tải...</div>
        ) : (
          <>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Push Notifications (Trong App)</p>
              <div className="space-y-4 bg-zinc-50 dark:bg-white/5 p-4 rounded-xl">
                <ToggleItem 
                  label="Lời mời kết bạn" 
                  checked={settings?.pushFriendRequest || false} 
                  onChange={(val) => handleToggle('pushFriendRequest', val)} 
                />
                <ToggleItem 
                  label="Bình luận mới" 
                  checked={settings?.pushNewComment || false} 
                  onChange={(val) => handleToggle('pushNewComment', val)} 
                />
                <ToggleItem 
                  label="Cảm xúc (Reactions)" 
                  checked={settings?.pushReaction || false} 
                  onChange={(val) => handleToggle('pushReaction', val)} 
                />
                <ToggleItem 
                  label="Lời mời tham gia Hành trình" 
                  checked={settings?.pushJourneyInvite || false} 
                  onChange={(val) => handleToggle('pushJourneyInvite', val)} 
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</p>
              <div className="space-y-4 bg-zinc-50 dark:bg-white/5 p-4 rounded-xl">
                <ToggleItem 
                  label="Nhắc nhở hằng ngày (Daily Reminder)" 
                  checked={settings?.emailDailyReminder || false} 
                  onChange={(val) => handleToggle('emailDailyReminder', val)} 
                />
                <ToggleItem 
                  label="Cập nhật hệ thống" 
                  checked={settings?.emailUpdates || false} 
                  onChange={(val) => handleToggle('emailUpdates', val)} 
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// FIX LỖI SWITCH: Đổi prop onCheckedChange thành onChange
const ToggleItem = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
    <Switch checked={checked} onChange={onChange} />
  </div>
);
// ============================================

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const { theme, setTheme } = useTheme();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSendFeedback = async () => {
    if(!feedbackText.trim()) return;
    try {
        await userService.sendFeedback({ type: 'GENERAL', content: feedbackText });
        alert("Cảm ơn đóng góp của bạn!");
        setFeedbackText('');
        setShowFeedbackInput(false);
    } catch (e) {
        alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md relative bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cài đặt</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          
          <div className="mb-4">
            <p className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Giao diện</p>
            <div className="space-y-1">
              <MenuItem 
                icon={theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-orange-500" />} 
                label={`Chế độ: ${theme === 'dark' ? 'Tối' : 'Sáng'}`} 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Tài khoản</p>
            <div className="space-y-1">
              <MenuItem 
                icon={<User className="w-5 h-5 text-blue-500 dark:text-blue-400" />} 
                label="Chỉnh sửa trang cá nhân" 
                onClick={() => setShowEditProfile(true)} 
              />
              <MenuItem 
                icon={<Shield className="w-5 h-5 text-green-500 dark:text-green-400" />} 
                label="Mật khẩu & Bảo mật" 
                onClick={() => setShowSecurity(true)} 
              />
              <MenuItem 
                icon={<Bell className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />} 
                label="Cài đặt Thông báo" 
                onClick={() => setShowNotifSettings(true)} 
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Hỗ trợ</p>
            <div className="space-y-1">
              
              {showFeedbackInput && (
                  <div className="px-4 py-2 space-y-2 bg-zinc-50 dark:bg-zinc-900/50 mx-2 rounded-xl mb-2 border border-zinc-200 dark:border-white/5">
                      <Input 
                        placeholder="Bạn muốn chia sẻ điều gì?" 
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
                      />
                      <Button size="sm" onClick={handleSendFeedback} className="w-full">Gửi ngay</Button>
                  </div>
              )}

              <MenuItem 
                icon={<FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />} 
                label="Chính sách quyền riêng tư" 
                onClick={() => { onClose(); navigate('/privacy'); }} 
              />
              <MenuItem 
                icon={<FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />} 
                label="Điều khoản sử dụng" 
                onClick={() => { onClose(); navigate('/terms'); }} 
              />
            </div>
          </div>

          <div className="p-2 pt-4 border-t border-zinc-100 dark:border-white/10">
            <button 
              onClick={() => { if(confirm("Bạn có chắc muốn đăng xuất?")) { logout(); onClose(); } }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
            <div className="text-center mt-4 text-xs text-zinc-400 dark:text-zinc-600">Mindrevol v1.0.0</div>
          </div>
        </div>

        <NotificationSettingsModal 
          isOpen={showNotifSettings} 
          onClose={() => setShowNotifSettings(false)} 
        />
      </div>

      {showEditProfile && user && (
        <EditProfileModal 
            isOpen={true} 
            onClose={() => setShowEditProfile(false)} 
            user={user as any} 
            onUpdateSuccess={() => {}} 
        />
      )}
      
      {showSecurity && (
        <SecurityModal isOpen={true} onClose={() => setShowSecurity(false)} />
      )}
    </div>,
    document.body
  );
};

const MenuItem = ({ icon, label, onClick, danger = false }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors group ${danger ? 'text-red-500 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-200'}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400" />
  </button>
);