import React from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useOtpForm } from '../hooks/useOtpForm';

// [QUAN TRỌNG]: Khai báo prop initialCountdown ở đây để tránh lỗi đỏ
interface Props {
  onBack?: () => void;
  customVerify?: (email: string, otp: string) => Promise<any>;
  onResend?: (email: string) => Promise<any>;
  initialCountdown?: number; // <-- Dòng này cực kỳ quan trọng
}

export const OtpForm: React.FC<Props> = ({ onBack, customVerify, onResend, initialCountdown }) => {
  const {
    otp,
    inputRefs,
    email,
    isLoading,
    error,
    isComplete,
    countdown,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleResend,
    goToLogin
  } = useOtpForm({ customVerify, onResend, initialCountdown });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-400">
            Mã xác thực 6 số đã được gửi đến:
          </p>
          <p className="text-base font-bold text-white tracking-wide">
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
                w-10 h-12 sm:w-12 sm:h-14 
                text-center text-xl font-bold rounded-xl 
                bg-[#18181b] border 
                transition-all duration-200 outline-none
                ${digit ? 'border-[#FFF5C0] text-[#FFF5C0]' : 'border-zinc-800 text-white'}
                focus:border-[#FFF5C0] focus:ring-1 focus:ring-[#FFF5C0] focus:bg-zinc-900
              `}
            />
          ))}
        </div>

        {error && (
           <p className="text-red-500 text-sm text-center font-medium animate-pulse">
             {error}
           </p>
        )}

        <Button 
          onClick={handleSubmit} 
          isLoading={isLoading} 
          disabled={!isComplete}
          className="w-full h-12 text-base font-bold"
        >
          Xác thực ngay
        </Button>

        {/* Nút Gửi lại mã */}
        <div className="text-center">
           <button 
             type="button" 
             onClick={handleResend}
             disabled={countdown > 0 || isLoading}
             className={`text-xs transition-colors underline underline-offset-4 ${
               countdown > 0 
                   ? 'text-zinc-500 cursor-not-allowed' // Màu khi đang đếm
                   : 'text-blue-400 hover:text-blue-300' // Màu khi được nhấn (làm nổi bật lên)
             }`}
           >
             {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã'}
           </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800/50 flex flex-col gap-3">
        {/* Logic phân biệt: Nếu KHÔNG phải đăng ký (không có customVerify) thì hiện nút Login Pass */}
        {!customVerify && (
            <Button
              variant="secondary"
              className="w-full h-12 font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
              onClick={goToLogin}
            >
              Đăng nhập bằng mật khẩu
            </Button>
        )}

        {/* Nếu LÀ đăng ký (có nút Back) */}
        {onBack && (
            <button 
                onClick={onBack}
                className="text-xs text-zinc-500 hover:text-white transition-colors py-2"
            >
                Quay lại bước trước
            </button>
        )}
      </div>
    </motion.div>
  );
};