import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useStepPassword } from '../../hooks/useRegisterSteps';

interface Props {
  onNext: (password: string) => void;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const StepPassword: React.FC<Props> = ({ onNext }) => {
  const { form, onSubmit } = useStepPassword(onNext);
  const { register, formState: { errors }, watch } = form;
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const password = watch('password') || '';
  
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Uppercase & lowercase letters', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Number or special character', valid: /\d|[\W_]/.test(password) },
  ];
  const strength = checks.filter(c => c.valid).length;

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-zinc-900">Set your password</h3>
        <p className="text-sm text-zinc-600">Choose a strong password to protect your account.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        
        {/* Password */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700">Password</label>
          <div className="relative group">
            <Input 
              type={showPass ? "text" : "password"} 
              {...register('password')} 
              error={errors.password?.message} 
              autoFocus
              placeholder="Enter password"
              className="h-11 rounded-lg border-zinc-200 bg-white pr-10 pl-4 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-0 shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength indicator */}
          {password && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-1.5 h-1.5">
                <div className={`flex-1 rounded-full transition-all ${strength >= 1 ? 'bg-red-500' : 'bg-zinc-200'}`} />
                <div className={`flex-1 rounded-full transition-all ${strength >= 2 ? 'bg-amber-500' : 'bg-zinc-200'}`} />
                <div className={`flex-1 rounded-full transition-all ${strength >= 3 ? 'bg-emerald-500' : 'bg-zinc-200'}`} />
              </div>
              <div className="space-y-1.5">
                {checks.map((check, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center text-xs gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {check.valid ? (
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 flex-shrink-0" />
                    )}
                    <span className={check.valid ? 'text-emerald-600 font-medium' : 'text-zinc-500'}>{check.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700">Confirm password</label>
          <div className="relative group">
            <Input 
              type={showConfirmPass ? "text" : "password"} 
              {...register('confirmPassword')} 
              error={errors.confirmPassword?.message} 
              placeholder="Re-enter password"
              className="h-11 rounded-lg border-zinc-200 bg-white pr-10 pl-4 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-0 shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
            >
              {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="h-11 w-full rounded-lg bg-zinc-900 font-semibold text-white text-sm transition-all hover:bg-zinc-800 shadow-[0_4px_12px_rgba(15,23,42,0.15)]"
        >
          Continue
        </Button>
      </form>
    </motion.div>
  );
};