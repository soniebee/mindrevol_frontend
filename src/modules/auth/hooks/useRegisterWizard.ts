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
  const { login } = useGlobalAuth(); // This function stores tokens in localStorage
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

  // Step 3: Submit profile info -> Receive OTP
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
      
      setStep(4); // Move to OTP input step
      toast.success(`Verification code sent to ${email}`);

    } catch (err: any) {
      console.error("Register Error:", err);
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 4: VERIFY OTP & AUTO LOGIN ---
  const handleOtpVerify = async (email: string, otpCode: string) => {
    // No try-catch here because OtpForm already handles errors
    const { data } = await authService.verifyRegisterOtp(email, otpCode);
    
    // 1. Store tokens in auth system (IMPORTANT: await if login is async)
    await login(data.data.accessToken, data.data.refreshToken);
    
    // 2. Notify success
    toast.success("Registration successful! Redirecting to home...");
    
    // 3. Reset registration flow to clean stale data
    resetFlow();

    // 4. Redirect to home immediately
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