import React from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useOtpForm } from '../hooks/useOtpForm';

interface Props {
  onBack?: () => void;
  customVerify?: (email: string, otp: string) => Promise<any>;
  onResend?: (email: string) => Promise<any>;
  initialCountdown?: number;
}

export const OtpForm: React.FC<Props> = ({ onBack, customVerify, onResend, initialCountdown }) => {
  const {
    otp, inputRefs, email, isLoading, error, isComplete,
    countdown, handleChange, handleKeyDown, handlePaste,
    handleSubmit, handleResend, goToLogin
  } = useOtpForm({ customVerify, onResend, initialCountdown });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full space-y-6"
    >
      <div className="flex-1 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-sans text-stone-500">
            Mã xác thực 6 số đã được gửi đến:
          </p>
          <p className="text-lg font-normal text-blue-950 tracking-wide bg-blue-50 py-2 px-4 rounded-2xl inline-block">
            {email || 'your-email@example.com'}
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`
                w-12 h-14 sm:w-14 sm:h-16 
                text-center text-2xl font-sans font-bold rounded-[20px] 
                transition-all duration-200 outline-none
                ${digit ? 'bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] text-blue-950' : 'bg-neutral-100/70 shadow-inner text-stone-800'}
                focus:ring-2 focus:ring-blue-300 focus:bg-white
              `}
            />
          ))}
        </div>

        {error && (
           <p className="text-red-500 text-sm text-center font-sans font-medium animate-pulse">
             {error}
           </p>
        )}

        <Button 
          onClick={handleSubmit} 
          isLoading={isLoading} 
          disabled={!isComplete}
          className="w-full h-14 text-xl font-normal bg-blue-800/80 hover:bg-blue-800 text-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all"
        >
          Xác thực ngay
        </Button>

        <div className="text-center">
           <button 
             type="button" 
             onClick={handleResend}
             disabled={countdown > 0 || isLoading}
             className={`text-sm font-sans transition-colors underline underline-offset-4 ${
               countdown > 0 
                   ? 'text-stone-400 cursor-not-allowed' 
                   : 'text-blue-600 hover:text-blue-800'
             }`}
           >
             {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã'}
           </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-red-950/10 flex flex-col gap-3">
        {!customVerify && (
            <Button
              variant="outline"
              className="w-full h-14 text-lg font-normal bg-rose-50/50 hover:bg-rose-100 border-none text-red-950 rounded-[20px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]"
              onClick={goToLogin}
            >
              Đăng nhập bằng mật khẩu
            </Button>
        )}

        {onBack && (
            <button 
                onClick={onBack}
                className="text-sm font-sans text-stone-500 hover:text-red-950 transition-colors py-2"
            >
                Quay lại bước trước
            </button>
        )}
      </div>
    </motion.div>
  );
};