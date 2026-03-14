// src/modules/user/components/SettingsModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Shield, FileText, LogOut, ChevronRight, Moon, Sun } from 'lucide-react'; 
import { useAuth } from '@/modules/auth/store/AuthContext';
import { EditProfileModal } from './EditProfileModal';
import { SecurityModal } from './SecurityModal';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { userService } from '../services/user.service';
import { useTheme } from '@/contexts/ThemeContext'; // [THÊM MỚI] Import Hook Theme

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // [THÊM MỚI] Lấy trạng thái theme
  const { theme, setTheme } = useTheme();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
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
      {/* [SỬA CSS] Thêm màu sáng (bg-white, border-zinc-200) và tối (dark:bg-[#18181b]) */}
      <div className="w-full max-w-md bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        
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
              {/* [THÊM MỚI] NÚT CHUYỂN ĐỔI THEME CHÍNH LÀ ĐÂY */}
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
    // [SỬA CSS] Điều chỉnh hover và text theo light/dark mode
    className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors group ${danger ? 'text-red-500 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-200'}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400" />
  </button>
);