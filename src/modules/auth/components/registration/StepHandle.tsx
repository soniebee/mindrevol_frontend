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
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-['Baloo_2'] text-blue-950">Tạo dấu ấn riêng</h2>
        <p className="text-stone-600 font-['Nunito'] font-semibold text-base">Chọn một ID độc nhất để bạn bè tìm thấy bạn.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-500 z-10 mt-3">
            <AtSign className="w-5 h-5" />
          </div>
          <Input 
            className="pl-12 h-14 rounded-[20px] bg-neutral-100/70 border-none shadow-inner text-lg focus:ring-2 focus:ring-blue-400 font-['Nunito'] font-semibold text-stone-800"
            placeholder="mindrevol_minh"
            label="ID của bạn (Handle)"
            {...register('handle')} 
            onBlur={handleHandleBlur}
            error={(errors as any).handle?.message}
            autoFocus
            disabled={isLoading || isChecking}
          />
          {isChecking && (
            <span className="absolute right-5 top-[50px] text-sm text-blue-600 font-['Nunito'] font-bold">
              Đang kiểm tra...
            </span>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading} className="w-1/3 h-14 rounded-[20px] text-lg font-['Baloo_2'] bg-stone-100 hover:bg-stone-200 text-stone-700">
            Quay lại
          </Button>
          <Button type="submit" isLoading={isLoading || isChecking} className="w-2/3 h-14 text-xl font-bold font-['Baloo_2'] bg-blue-800/90 hover:bg-blue-800 text-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            Hoàn tất
          </Button>
        </div>
      </form>
    </motion.div>
  );
};