import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { AtSign } from 'lucide-react';
import { useStepHandle } from '../../hooks/useRegisterSteps'; // Giữ nguyên import
import { authService } from '../../services/auth.service';    // Import Service để check API

interface Props {
  onFinish: (handle: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepHandle: React.FC<Props> = ({ onFinish, onBack, isLoading }) => {
  const { form, onSubmit } = useStepHandle(onFinish);
  const { register, formState: { errors }, setError, clearErrors, getValues } = form;
  const [isChecking, setIsChecking] = useState(false);

  // --- LOGIC MỚI: Check Handle Async ---
  const handleHandleBlur = async () => {
    const handle = getValues("handle");
    
    // SỬA LỖI TS: Dùng (errors as any) để TypeScript không bắt bẻ kiểu 'never'
    // Nếu chưa nhập hoặc đang có lỗi validate cơ bản (required/regex) thì không check server
    if (!handle || (errors as any).handle) return;

    setIsChecking(true);
    try {
      const { data } = await authService.checkHandle(handle);
      if (data.data === true) {
        // Backend: Tồn tại -> Báo lỗi
        setError("handle", { 
          type: "manual", 
          message: "Handle này đã có người dùng. Hãy chọn tên khác!" 
        });
      } else {
        // Backend: OK -> Xóa lỗi (chỉ xóa nếu đó là lỗi do mình set 'manual')
        if ((errors as any).handle?.type === 'manual') {
            clearErrors("handle");
        }
      }
    } catch (error) {
      console.error("Check handle error", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Tạo dấu ấn riêng</h2>
        <p className="text-muted text-sm">Chọn một ID độc nhất (Handle) để bạn bè tìm thấy bạn.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <AtSign className="w-5 h-5" />
          </div>
          <Input 
            className="pl-12"
            placeholder="username"
            {...register('handle')} 
            onBlur={handleHandleBlur} // Sự kiện check khi dừng nhập
            error={(errors as any).handle?.message} // Ép kiểu ở đây để hiển thị lỗi
            autoFocus
            disabled={isLoading || isChecking}
          />
          
          {/* Hiển thị dòng đang kiểm tra */}
          {isChecking && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-blue-500 font-medium">
              Đang kiểm tra...
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading} className="w-1/3">
            Quay lại
          </Button>
          <Button type="submit" isLoading={isLoading || isChecking} className="w-2/3">
            Hoàn tất đăng ký
          </Button>
        </div>
      </form>
    </motion.div>
  );
};