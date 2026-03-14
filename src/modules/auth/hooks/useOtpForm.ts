import { useState, useEffect, useRef, ClipboardEvent } from 'react';
import { useAuthFlow } from '../store/AuthFlowContext';
import { toast } from 'react-hot-toast';

interface UseOtpFormProps {
  customVerify?: (email: string, otp: string) => Promise<any>;
  onResend?: (email: string) => Promise<any>;
  initialCountdown?: number; 
}

export const useOtpForm = ({ customVerify, onResend, initialCountdown = 0 }: UseOtpFormProps = {}) => {
  const { verifyOtp, resendOtp: defaultResend, isLoading: contextLoading, error: contextError, email, goToLogin, resetFlow } = useAuthFlow();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(initialCountdown);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // LOG DEBUG: Kiểm tra xem số 60 có vào được đây không
  useEffect(() => {
    console.log("useOtpForm initialized with countdown:", initialCountdown);
  }, [initialCountdown]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    setLocalError(null);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;
    const digits = pastedData.split('').slice(0, 6);
    const newOtp = [...otp];
    digits.forEach((digit, i) => { if (i < 6) newOtp[i] = digit; });
    setOtp(newOtp);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
    if (digits.length === 6) executeSubmit(digits.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter' && otp.every(d => d !== '')) executeSubmit(otp.join(''));
  };

  const executeSubmit = async (otpCode: string) => {
     if (!email) {
        setLocalError("Không tìm thấy email.");
        return;
     }
     setLocalError(null);
     
     if (customVerify) {
        setLocalLoading(true);
        try {
            await customVerify(email, otpCode);
        } catch (err: any) {
            setLocalError(err.response?.data?.message || "Mã xác thực không đúng");
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        } finally {
            setLocalLoading(false);
        }
     } else {
        verifyOtp(otpCode); 
     }
  };

  const handleSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) executeSubmit(otpCode);
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setLocalLoading(true);
    try {
        if (onResend) await onResend(email);
        else await defaultResend();
        
        setCountdown(60); 
        toast.success(`Đã gửi lại mã tới ${email}`);
    } catch (e) {
        toast.error("Gửi mã thất bại. Vui lòng thử lại sau.");
    } finally {
        setLocalLoading(false);
    }
  };

  return {
    otp, inputRefs, email,
    isLoading: contextLoading || localLoading, 
    error: contextError || localError,
    isComplete: otp.every(d => d !== ''),
    countdown,
    handleChange, handleKeyDown, handlePaste, handleSubmit, handleResend,
    goToLogin, resetFlow
  };
};