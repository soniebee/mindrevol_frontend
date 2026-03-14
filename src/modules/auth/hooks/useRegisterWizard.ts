import { useState } from 'react';
import { useAuthFlow } from '../store/AuthFlowContext';
import { StepBasicInfoValues } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useGlobalAuth } from './useGlobalAuth'; 

type RegisterStep = 1 | 2 | 3 | 4; 

export const useRegisterWizard = () => {
  const { updateRegisterData, registerData, email, resetFlow } = useAuthFlow();
  const { login } = useGlobalAuth(); // Hàm này sẽ lưu token vào localStorage
  const navigate = useNavigate();
  
  const [step, setStep] = useState<RegisterStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = (password: string) => {
    updateRegisterData({ password });
    setStep(2);
  };

  const handleInfoSubmit = (data: StepBasicInfoValues) => {
    updateRegisterData(data);
    setStep(3);
  };

  // Bước 3: Gửi thông tin -> Nhận OTP
  const handleHandleSubmit = async (handle: string) => {
    setIsLoading(true);
    setError(null);
    try {
      updateRegisterData({ handle });
      
      const payload = {
        email: email!,
        handle,
        password: registerData.password, 
        fullname: registerData.fullname,
        dateOfBirth: registerData.dateOfBirth,
        gender: registerData.gender,
        agreedToTerms: true 
      };

      await authService.registerStep1(payload as any);
      
      setStep(4); // Chuyển sang màn nhập OTP
      toast.success(`Mã xác thực đã được gửi tới ${email}`);

    } catch (err: any) {
      console.error("Register Error:", err);
      const msg = err.response?.data?.message || "Đăng ký thất bại";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- BƯỚC 4: XÁC THỰC OTP & AUTO LOGIN ---
  const handleOtpVerify = async (email: string, otpCode: string) => {
    // Không cần try-catch vì OtpForm đã xử lý lỗi
    const { data } = await authService.verifyRegisterOtp(email, otpCode);
    
    // 1. Lưu token vào hệ thống (QUAN TRỌNG: dùng await nếu login là async)
    await login(data.data.accessToken, data.data.refreshToken);
    
    // 2. Thông báo thành công
    toast.success("Đăng ký thành công! Đang vào trang chủ...");
    
    // 3. Reset luồng đăng ký để dọn dẹp data cũ
    resetFlow();

    // 4. Chuyển hướng ngay lập tức về trang chủ
    navigate('/', { replace: true });
  };

  const handleResendOtp = async (email: string) => {
      await authService.resendRegisterOtp(email);
  }

  return {
    step, setStep, email, error, isLoading, resetFlow,
    handlers: {
      onPasswordSubmit: handlePasswordSubmit,
      onInfoSubmit: handleInfoSubmit,
      onHandleSubmit: handleHandleSubmit,
      onOtpVerify: handleOtpVerify,
      onResendOtp: handleResendOtp
    }
  };
};