import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthFlow } from '../store/AuthFlowContext';
import { authService } from '../services/auth.service';
import { passwordSchema, PasswordFormValues } from '../schemas/auth.schema';
import { toast } from 'react-hot-toast';

type ForgotStatus = 'idle' | 'loading' | 'sent' | 'error';

export const usePasswordForm = () => {
  const { email, userInfo, resetFlow, login, isLoading, error, goToOtp } = useAuthFlow();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<ForgotStatus>('idle');

  // 1. Setup form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // 2. Handle login submit
  const onSubmit = async (data: PasswordFormValues) => {
    await login(data.password);
  };

  // 3. Switch to OTP login
  // IMPORTANT: authService.sendOtp(email) was removed to avoid duplicate sends
  const handleSwitchToOtp = async () => {
     goToOtp(); 
  };

  // 4. Handle forgot password
  const handleForgotPassword = async () => {
    if (forgotStatus === 'loading' || forgotStatus === 'sent') return;

    setForgotStatus('loading');
    try {
      await authService.forgotPassword(email);
      setForgotStatus('sent');
      toast.success('Password reset link has been sent to your email!');
    } catch (e: any) {
      setForgotStatus('error');
      const msg = e.response?.data?.message || 'Unable to send email, please try again.';
      toast.error(msg);
      // Auto-reset after 4 seconds so the user can retry
      setTimeout(() => setForgotStatus('idle'), 4000);
    }
  };

  return {
    form,
    email,
    userInfo,
    isLoading,
    error,
    forgotStatus,
    showPassword,
    toggleShowPassword: () => setShowPassword(prev => !prev),
    onSubmit: form.handleSubmit(onSubmit),
    handleBack: resetFlow,
    handleSwitchToOtp,
    handleForgotPassword
  };
};