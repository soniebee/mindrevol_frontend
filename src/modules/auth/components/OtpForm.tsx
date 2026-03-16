import React from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useOtpForm } from '../hooks/useOtpForm';
import { ShieldCheck } from 'lucide-react';

interface Props {
  onBack?: () => void;
  customVerify?: (email: string, otp: string) => Promise<any>;
  onResend?: (email: string) => Promise<any>;
  initialCountdown?: number;
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
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col space-y-6"
    >
      {/* ── Header ── */}
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-2xl font-bold text-zinc-900">Verify your email</h3>
          <p className="text-sm text-zinc-600">We sent a 6-digit code to</p>
          <p className="text-sm font-semibold text-zinc-800">{email || 'your-email@example.com'}</p>
        </div>
      </div>

      {/* ── OTP Input Grid ── */}
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
              w-11 h-14 sm:w-12 sm:h-16
              text-center text-2xl font-bold rounded-lg
              bg-white border-2 transition-all duration-200 outline-none
              ${digit ? 'border-sky-500 text-sky-600' : 'border-zinc-200 text-zinc-900'}
              focus:border-sky-500 focus:ring-2 focus:ring-sky-200
              hover:border-zinc-300 disabled:opacity-50
            `}
          />
        ))}
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* ── Submit Button ── */}
      <Button 
        onClick={handleSubmit} 
        isLoading={isLoading} 
        disabled={!isComplete}
        className="h-11 w-full rounded-lg bg-zinc-900 text-sm font-semibold text-white transition-all hover:bg-zinc-800 shadow-[0_4px_12px_rgba(15,23,42,0.15)] disabled:opacity-50"
      >
        Verify code
      </Button>

      {/* ── Resend Code ── */}
      <div className="text-center">
        <button 
          type="button" 
          onClick={handleResend}
          disabled={countdown > 0 || isLoading}
          className={`text-sm font-medium transition-colors ${
            countdown > 0 
              ? 'text-zinc-400 cursor-not-allowed' 
              : 'text-sky-600 hover:text-sky-700 hover:underline'
          }`}
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
        </button>
      </div>

      {/* ── Footer Actions ── */}
      <div className="flex flex-col gap-2 border-t border-zinc-200 pt-6">
        {!customVerify && (
          <Button
            variant="outline"
            type="button"
            onClick={goToLogin}
            className="h-11 w-full rounded-lg border-zinc-200 bg-white text-zinc-700 font-medium hover:bg-zinc-50 text-sm"
          >
            Sign in with password
          </Button>
        )}

        {onBack && (
          <button 
            onClick={onBack}
            className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors py-2"
          >
            ← Back to previous step
          </button>
        )}
      </div>
    </motion.div>
  );
};