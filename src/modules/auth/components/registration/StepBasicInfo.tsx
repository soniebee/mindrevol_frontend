import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { useStepBasicInfo } from '../../hooks/useRegisterSteps';
import { StepBasicInfoValues } from '../../schemas/auth.schema';

interface Props {
  onNext: (data: StepBasicInfoValues) => void;
  onBack: () => void;
}

export const StepBasicInfo: React.FC<Props> = ({ onNext, onBack }) => {
  const { form, onSubmit } = useStepBasicInfo(onNext);
  const { register, formState: { errors } } = form;

  // ĐÃ XÓA LOGIC CHECK EMAIL Ở ĐÂY

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Giới thiệu bản thân</h2>
        <p className="text-muted text-sm">Chúng tôi cần một chút thông tin cơ bản.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Tên */}
        <Input 
          label="Tên hiển thị"
          placeholder="Ví dụ: Minh Developer"
          {...register('fullname')} 
          error={errors.fullname?.message} 
          autoFocus
        />

        {/* Ngày sinh */}
        <Input 
          label="Ngày sinh"
          type="date"
          {...register('dateOfBirth')} 
          error={errors.dateOfBirth?.message} 
        />

        {/* Giới tính */}
        <div className="w-full space-y-1.5">
          <label className="text-xs font-semibold text-muted ml-1 uppercase">Giới tính</label>
          <div className="relative">
            <select
              {...register('gender')}
              className={`w-full bg-surface border-2 border-transparent rounded-2xl px-5 py-3.5 text-foreground outline-none transition-all font-medium appearance-none cursor-pointer focus:border-primary focus:bg-background ${errors.gender ? 'border-destructive/50 bg-destructive/5' : ''}`}
              defaultValue="" 
            >
              <option value="" disabled>Chọn giới tính...</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
              <option value="PREFER_NOT_TO_SAY">Không muốn tiết lộ</option>
            </select>
          </div>
          {errors.gender && <span className="text-xs text-destructive font-bold ml-1">{errors.gender.message}</span>}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onBack} className="w-1/3">Quay lại</Button>
          <Button type="submit" className="w-2/3">Tiếp theo</Button>
        </div>
      </form>
    </motion.div>
  );
};