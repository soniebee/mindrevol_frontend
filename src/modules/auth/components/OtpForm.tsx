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
      className="flex flex-col h-full w-full space-y-6"
    >
      <div className="flex-1 space-y-6 text-center w-full">
        <div className="space-y-2">
          <p className="text-[0.95rem] font-semibold text-[#8A8580]">
            Mã 6 số đang nằm trong hòm thư:
          </p>
          <p className="text-[1.05rem] font-extrabold text-[#1A1A1A]">
            {email || 'your-email@example.com'}
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 justify-center mt-6">
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
                w-11 h-14 sm:w-12 sm:h-16
                text-center text-xl font-extrabold rounded-[16px] 
                border-2 transition-all duration-300 outline-none
                ${digit 
                  ? 'bg-white border-[#D6CFC7] text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.05)] -translate-y-[2px]' 
                  : 'bg-[rgba(255,255,255,0.5)] border-transparent text-[#1A1A1A] shadow-[0_4px_10px_rgba(0,0,0,0.02)]'}
                focus:bg-white focus:border-[#4A4A4A] focus:shadow-[0_8px_20px_rgba(0,0,0,0.08)] focus:-translate-y-[2px] focus:ring-0
              `}
            />
          ))}
        </div>

        {error && (
           <p className="text-red-500 text-[0.9rem] font-bold animate-pulse mt-3">
             {error}
           </p>
        )}

        <Button 
          onClick={handleSubmit} 
          isLoading={isLoading} 
          disabled={!isComplete}
          className="w-full mt-6 group flex items-center justify-center gap-2"
        >
          Xác thực ngay
          <svg className="transition-transform duration-300 group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Button>

        <div className="text-center mt-5">
           <button 
             type="button" 
             onClick={handleResend}
             disabled={countdown > 0 || isLoading}
             className={`text-[0.95rem] font-bold transition-all duration-300 ${
               countdown > 0 
                   ? 'text-[#A09D9A] cursor-not-allowed' 
                   : 'text-[#8A8580] hover:text-[#1A1A1A] relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#1A1A1A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left'
             }`}
           >
             {countdown > 0 ? `Đợi xíu... (${countdown}s)` : 'Gửi lại mã nhé'}
           </button>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3 w-full items-center">
        {!customVerify && (
            <button
              type="button"
              className="text-[0.95rem] font-bold text-[#8A8580] hover:text-[#1A1A1A] transition-colors py-2 relative after:absolute after:bottom-1 after:left-0 after:h-[1.5px] after:w-full after:bg-[#1A1A1A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              onClick={goToLogin}
            >
              Thôi, tớ nhớ mật khẩu rồi
            </button>
        )}

        {onBack && (
            <button 
                onClick={onBack}
                className="text-[0.95rem] font-bold text-[#A09D9A] hover:text-[#1A1A1A] transition-colors py-2"
            >
                Quay lại bước trước
            </button>
        )}
      </div>
    </motion.div>
  );
};