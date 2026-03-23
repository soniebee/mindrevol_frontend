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

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-['Baloo_2'] text-blue-950">Giới thiệu bản thân</h2>
        <p className="text-stone-600 font-['Nunito'] font-semibold text-base">Một vài thông tin cơ bản để bắt đầu.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <Input 
          label="Tên hiển thị"
          placeholder="Ví dụ: Minh Developer"
          {...register('fullname')} 
          error={errors.fullname?.message} 
          autoFocus
          className="h-14 rounded-[20px] bg-neutral-100/70 border-none shadow-inner text-lg focus:ring-2 focus:ring-blue-400 font-['Nunito'] font-semibold text-stone-800"
        />

        <Input 
          label="Ngày sinh"
          type="date"
          {...register('dateOfBirth')} 
          error={errors.dateOfBirth?.message} 
          className="h-14 rounded-[20px] bg-neutral-100/70 border-none shadow-inner text-lg focus:ring-2 focus:ring-blue-400 font-['Nunito'] font-semibold text-stone-800"
        />

        <div className="w-full space-y-2">
          <label className="text-base font-semibold font-['Nunito'] text-red-950 ml-2">Giới tính</label>
          <div className="relative">
            <select
              {...register('gender')}
              className={`w-full h-14 rounded-[20px] bg-neutral-100/70 border-none shadow-inner px-5 text-lg font-['Nunito'] font-semibold outline-none transition-all cursor-pointer focus:ring-2 focus:ring-blue-400 text-stone-800 appearance-none ${errors.gender ? 'ring-2 ring-red-400 bg-red-50' : ''}`}
              defaultValue="" 
            >
              <option value="" disabled>Chọn giới tính...</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
              <option value="PREFER_NOT_TO_SAY">Không muốn tiết lộ</option>
            </select>
          </div>
          {errors.gender && <span className="text-sm text-red-600 font-['Nunito'] font-bold ml-2">{errors.gender.message}</span>}
        </div>
        
        <div className="flex gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={onBack} className="w-1/3 h-14 rounded-[20px] text-lg font-['Baloo_2'] bg-stone-100 hover:bg-stone-200 text-stone-700">Quay lại</Button>
          <Button type="submit" className="w-2/3 h-14 text-xl font-bold font-['Baloo_2'] bg-blue-800/90 hover:bg-blue-800 text-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            Tiếp theo
          </Button>
        </div>
      </form>
    </motion.div>
  );
};