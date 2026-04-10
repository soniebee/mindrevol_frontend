import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { AtSign } from 'lucide-react';
import { useStepHandle } from '../../hooks/useRegisterSteps';
import { authService } from '../../services/auth.service';

interface Props {
  onFinish: (handle: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepHandle: React.FC<Props> = ({ onFinish, onBack, isLoading }) => {
  const { form, onSubmit } = useStepHandle(onFinish);
  const { register, formState: { errors }, setError, clearErrors, getValues } = form;
  const [isChecking, setIsChecking] = useState(false);

  const handleHandleBlur = async () => {
    const handle = getValues("handle");
    if (!handle || (errors as any).handle) return;
    setIsChecking(true);
    try {
      const { data } = await authService.checkHandle(handle);
      if (data.data === true) {
        setError("handle", { type: "manual", message: "ID này đã có người dùng. Hãy chọn tên khác!" });
      } else {
        if ((errors as any).handle?.type === 'manual') clearErrors("handle");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      className="space-y-5 w-full"
    >
      <div className="space-y-1 mb-8 text-center">
        <h2 className="text-[1.8rem] font-extrabold text-[#1A1A1A]">Tạo dấu ấn riêng</h2>
        <p className="text-[0.95rem] font-semibold text-[#8A8580]">Chọn một ID độc nhất để bạn bè tìm thấy cậu.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="relative">
          <div className="absolute left-[20px] top-[45px] text-[#A09D9A] z-10">
            <AtSign className="w-5 h-5" />
          </div>
          <Input 
            className="pl-[3rem]"
            placeholder="mindrevol_minh"
            label="ID của cậu (Handle)"
            {...register('handle')} 
            onBlur={handleHandleBlur}
            error={(errors as any).handle?.message}
            autoFocus
            disabled={isLoading || isChecking}
          />
          {isChecking && (
            <span className="absolute right-[20px] top-[45px] text-[0.9rem] text-[#8A8580] font-bold animate-pulse">
              Đang dò...
            </span>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="w-1/3">
            Quay lại
          </Button>
          <Button type="submit" isLoading={isLoading || isChecking} className="w-2/3">
            Hoàn tất 🎉
          </Button>
        </div>
      </form>
    </motion.div>
  );
};