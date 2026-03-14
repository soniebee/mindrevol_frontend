import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Dùng Portal
import { UserProfile, userService } from '../services/user.service';
import { X, Camera } from 'lucide-react';
import { useAuth } from '@/modules/auth/store/AuthContext';

// [FIX] Cập nhật Interface
interface EditProfileModalProps {
  isOpen: boolean; // Thêm dòng này
  onClose: () => void;
  user: UserProfile; // User là bắt buộc
  onUpdateSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, user, onClose, onUpdateSuccess }) => {
  const { refreshProfile } = useAuth();
  const [fullname, setFullname] = useState(user.fullname);
  const [bio, setBio] = useState(user.bio || '');
  
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state khi mở lại
  useEffect(() => {
      if (isOpen) {
          setFullname(user.fullname);
          setBio(user.bio || '');
          setPreviewAvatar(null);
          setFile(null);
      }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewAvatar(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await userService.updateProfile({
        fullname,
        bio,
        avatar: file || undefined,
      });
      await refreshProfile(); 
      onUpdateSuccess();
      onClose();
    } catch (error) {
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Sử dụng Portal để modal luôn nổi lên trên cùng
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-zinc-900 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-800 shadow-2xl">
        <div className="p-4 flex justify-between items-center border-b border-zinc-800">
          <h3 className="text-white font-bold text-lg">Chỉnh sửa hồ sơ</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition"><X className="text-zinc-400 w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700">
                <img src={previewAvatar || user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Họ và tên</label>
              <input 
                value={fullname} 
                onChange={e => setFullname(e.target.value)}
                className="w-full bg-zinc-800 text-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-yellow-500 border border-zinc-700 focus:border-yellow-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tiểu sử (Bio)</label>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 text-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-yellow-500 border border-zinc-700 focus:border-yellow-500 transition-all resize-none" 
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl flex items-center justify-center hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};