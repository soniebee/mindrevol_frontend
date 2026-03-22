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
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-['Baloo_2'] text-blue-950">Thiết lập bảo mật</h2>
        <p className="text-stone-600 font-['Nunito'] font-semibold text-base">Tạo mật khẩu để bảo vệ không gian của bạn.</p>
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
                  className="pr-12 h-14 rounded-[20px] bg-neutral-100/70 border-none shadow-inner text-lg focus:ring-2 focus:ring-blue-400 font-['Nunito'] font-semibold text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-[42px] text-stone-500 hover:text-stone-800 transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {password && (
                <div className="flex gap-1 h-2.5 mt-3 px-2">
                    <div className={`flex-1 rounded-full transition-all ${strength >= 1 ? 'bg-rose-400' : 'bg-neutral-200'}`} />
                    <div className={`flex-1 rounded-full transition-all ${strength >= 2 ? 'bg-amber-400' : 'bg-neutral-200'}`} />
                    <div className={`flex-1 rounded-full transition-all ${strength >= 3 ? 'bg-lime-400 shadow-[0px_2px_4px_0px_rgba(163,230,53,0.5)]' : 'bg-neutral-200'}`} />
                </div>
            )}
            
            {password && (
                <div className="grid grid-cols-1 gap-2 mt-4 px-2">
                    {checks.map((check, idx) => (
                        <div key={idx} className="flex items-center text-sm font-['Nunito'] font-bold gap-2">
                            {check.valid ? <Check size={16} className="text-lime-600" /> : <div className="w-4 h-4 rounded-full border-2 border-stone-300" />}
                            <span className={check.valid ? "text-lime-700" : "text-stone-500"}>{check.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="relative pt-2">
            <Input 
              type={showConfirmPass ? "text" : "password"} 
              label="Nhập lại mật khẩu"
              placeholder="Xác nhận mật khẩu..."
              {...register('confirmPassword')} 
              error={errors.confirmPassword?.message} 
              className="pr-12 h-14 rounded-[20px] bg-neutral-100/70 border-none shadow-inner text-lg focus:ring-2 focus:ring-blue-400 font-['Nunito'] font-semibold text-stone-800"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-4 top-[50px] text-stone-500 hover:text-stone-800 transition-colors"
            >
              {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>

        <Button type="submit" className="w-full mt-6 h-14 text-xl font-bold font-['Baloo_2'] bg-blue-800/90 hover:bg-blue-800 text-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all">
          Tiếp theo
        </Button>
      </form>
    </motion.div>
  );
};