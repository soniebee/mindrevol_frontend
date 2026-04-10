import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useStepPassword } from '../../hooks/useRegisterSteps';

interface Props {
  onNext: (password: string) => void;
}

export const StepPassword: React.FC<Props> = ({ onNext }) => {
  const { form, onSubmit } = useStepPassword(onNext);
  const { register, formState: { errors }, watch } = form;
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const password = watch('password') || '';
  const checks = [
    { label: "Ít nhất 8 ký tự", valid: password.length >= 8 },
    { label: "Chữ hoa & thường", valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Số hoặc ký tự đặc biệt", valid: /\d|[\W_]/.test(password) },
  ];
  const strength = checks.filter(c => c.valid).length;

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }}
      className="space-y-5 w-full"
    >
      <div className="space-y-1 mb-8 text-center">
        <h2 className="text-[1.8rem] font-extrabold text-[#1A1A1A]">Thiết lập bảo mật</h2>
        <p className="text-[0.95rem] font-semibold text-[#8A8580]">Tạo chìa khóa để bảo vệ không gian của bạn.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1">
            <div className="relative">
                <Input 
                  type={showPass ? "text" : "password"} 
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu..."
                  {...register('password')} 
                  error={errors.password?.message} 
                  autoFocus
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-[20px] top-[46px] text-[#A09D9A] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {password && (
                <div className="flex gap-2 h-1.5 mt-3 mb-4 px-2">
                    <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 1 ? 'bg-[#FF6B6B]' : 'bg-[#E5E5E5]'}`} />
                    <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 2 ? 'bg-[#FFB020]' : 'bg-[#E5E5E5]'}`} />
                    <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 3 ? 'bg-[#10B981]' : 'bg-[#E5E5E5]'}`} />
                </div>
            )}
            
            {password && (
                <div className="grid grid-cols-1 gap-2 mb-4 px-2">
                    {checks.map((check, idx) => (
                        <div key={idx} className="flex items-center text-[0.85rem] font-bold gap-2">
                            {check.valid ? <Check size={16} className="text-[#10B981]" strokeWidth={3} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D6CFC7] ml-[1px]" />}
                            <span className={check.valid ? "text-[#1A1A1A]" : "text-[#A09D9A]"}>{check.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="relative">
            <Input 
              type={showConfirmPass ? "text" : "password"} 
              label="Nhập lại mật khẩu"
              placeholder="Xác nhận mật khẩu..."
              {...register('confirmPassword')} 
              error={errors.confirmPassword?.message} 
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-[20px] top-[46px] text-[#A09D9A] hover:text-[#1A1A1A] transition-colors"
            >
              {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>

        <Button type="submit" className="w-full mt-4 group flex items-center justify-center gap-2">
          Tiếp theo
          <svg className="transition-transform duration-300 group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Button>
      </form>
    </motion.div>
  );
};