import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X } from 'lucide-react'; // Cần cài lucide-react nếu chưa có
import { useStepPassword } from '../../hooks/useRegisterSteps';

interface Props {
  onNext: (password: string) => void;
}

export const StepPassword: React.FC<Props> = ({ onNext }) => {
  const { form, onSubmit } = useStepPassword(onNext);
  const { register, formState: { errors }, watch } = form;
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Watch password để check độ mạnh realtime
  const password = watch('password') || '';
  
  // Logic check độ mạnh đơn giản
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
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Thiết lập bảo mật</h2>
        <p className="text-muted text-sm">Tạo một mật khẩu mạnh để bảo vệ hành trình của bạn.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        
        {/* Mật khẩu */}
        <div className="space-y-1">
            <div className="relative">
                <Input 
                  type={showPass ? "text" : "password"} 
                  label="Mật khẩu"
                  {...register('password')} 
                  error={errors.password?.message} 
                  autoFocus
                  className="pr-10" // Chừa chỗ cho icon
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-[34px] text-muted hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* Thanh độ mạnh mật khẩu */}
            {password && (
                <div className="flex gap-1 h-1 mt-2">
                    <div className={`flex-1 rounded-full transition-all ${strength >= 1 ? 'bg-red-500' : 'bg-zinc-800'}`} />
                    <div className={`flex-1 rounded-full transition-all ${strength >= 2 ? 'bg-yellow-500' : 'bg-zinc-800'}`} />
                    <div className={`flex-1 rounded-full transition-all ${strength >= 3 ? 'bg-green-500' : 'bg-zinc-800'}`} />
                </div>
            )}
            
            {/* Chi tiết yêu cầu */}
            {password && (
                <div className="grid grid-cols-1 gap-1 mt-2">
                    {checks.map((check, idx) => (
                        <div key={idx} className="flex items-center text-xs gap-1.5">
                            {check.valid ? <Check size={12} className="text-green-500" /> : <div className="w-3 h-3 rounded-full border border-zinc-600" />}
                            <span className={check.valid ? "text-green-500" : "text-zinc-500"}>{check.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Nhập lại mật khẩu */}
        <div className="relative">
            <Input 
              type={showConfirmPass ? "text" : "password"} 
              label="Nhập lại mật khẩu"
              {...register('confirmPassword')} 
              error={errors.confirmPassword?.message} 
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3 top-[34px] text-muted hover:text-foreground transition-colors"
            >
              {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>

        <Button type="submit" className="w-full mt-4">Tiếp theo</Button>
      </form>
    </motion.div>
  );
};