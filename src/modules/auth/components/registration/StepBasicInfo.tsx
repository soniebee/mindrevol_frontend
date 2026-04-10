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
      className="space-y-5 w-full"
    >
      <div className="space-y-1 mb-8 text-center">
        <h2 className="text-[1.8rem] font-extrabold text-[#1A1A1A]">Giới thiệu bản thân</h2>
        <p className="text-[0.95rem] font-semibold text-[#8A8580]">Một vài thông tin cơ bản để bắt đầu.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <Input 
          label="Tên hiển thị"
          placeholder="Ví dụ: Mình là Minh"
          {...register('fullname')} 
          error={errors.fullname?.message} 
          autoFocus
        />

        <Input 
          label="Ngày sinh"
          type="date"
          {...register('dateOfBirth')} 
          error={errors.dateOfBirth?.message} 
        />

        <div className="w-full text-left font-sans">
          <label className="block text-[0.95rem] font-bold text-[#1A1A1A] mb-2 px-2">Giới tính</label>
          <div className="relative">
            <select
              {...register('gender')}
              className={`w-full px-6 py-4 text-[1rem] font-semibold bg-white border-2 border-transparent rounded-[24px] box-border outline-none transition-all duration-300 text-[#1A1A1A] cursor-pointer appearance-none shadow-[0_8px_20px_rgba(0,0,0,0.03)] focus:border-[#D6CFC7] focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] ${errors.gender ? 'border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_4px_12px_rgba(239,68,68,0.1)]' : ''}`}
              defaultValue="" 
            >
              <option value="" disabled className="text-[#A09D9A]">Chọn giới tính...</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
              <option value="PREFER_NOT_TO_SAY">Không muốn tiết lộ</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6 text-[#A09D9A]">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          {errors.gender && <span className="text-sm text-red-500 font-bold mt-2 px-2 block">{errors.gender.message}</span>}
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="w-1/3">Hủy</Button>
          <Button type="submit" className="w-2/3 group flex items-center justify-center gap-2">
            Tiếp theo
            <svg className="transition-transform duration-300 group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Button>
        </div>
      </form>
    </motion.div>
  );
};