import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthFlow } from '../store/AuthFlowContext';
import { authService } from '../services/auth.service';
import { passwordSchema, PasswordFormValues } from '../schemas/auth.schema';

export const usePasswordForm = () => {
  const { email, resetFlow, login, isLoading, error, goToOtp } = useAuthFlow();
  const [showPassword, setShowPassword] = useState(false);

  // 1. Setup Form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // 2. Xử lý Submit Login
  const onSubmit = async (data: PasswordFormValues) => {
    await login(data.password);
  };

  // 3. Xử lý chuyển sang đăng nhập OTP
  // [QUAN TRỌNG]: Đã xóa dòng authService.sendOtp(email) để tránh gửi kép
  const handleSwitchToOtp = async () => {
     goToOtp(); 
  };

  // 4. Xử lý quên mật khẩu
  const handleForgotPassword = async () => {
    try {
        await authService.sendMagicLink(email);
        alert('Đã gửi link đặt lại mật khẩu về email!');
    } catch (e) {
        alert('Có lỗi xảy ra khi gửi email reset.');
    }
  };

  return {
    form,
    email,
    isLoading,
    error,
    showPassword,
    toggleShowPassword: () => setShowPassword(prev => !prev),
    onSubmit: form.handleSubmit(onSubmit),
    handleBack: resetFlow,
    handleSwitchToOtp,
    handleForgotPassword
  };
};