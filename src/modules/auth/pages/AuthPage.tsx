import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout'; 
import { AuthFlowProvider, useAuthFlow } from '../store/AuthFlowContext';
import { EmailForm } from '../components/EmailForm';
import { PasswordForm } from '../components/PasswordForm';
import { RegisterWizard } from '../components/RegisterWizard';
import { OtpForm } from '../components/OtpForm';
import { AnimatePresence, motion } from 'framer-motion';

const AuthHeader = () => {
  const { currentStep } = useAuthFlow();
  
  const getTitle = () => {
    switch (currentStep) {
      case 'EMAIL_INPUT': return 'Xin chào';
      case 'OTP_INPUT': return 'Xác thực';
      case 'PASSWORD_LOGIN': return 'Mật khẩu';
      case 'REGISTER_WIZARD': return 'Đăng ký';
      default: return 'MindRevol';
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 'EMAIL_INPUT': return 'Đăng nhập để tiếp tục hành trình.';
      case 'OTP_INPUT': return 'Nhập mã gồm 6 số vừa được gửi.';
      case 'PASSWORD_LOGIN': return 'Nhập mật khẩu của bạn.';
      case 'REGISTER_WIZARD': return 'Hoàn tất thông tin tài khoản.';
      default: return '';
    }
  };

  return (
    <div className="mb-10">
      {/* Logo + Brand Name */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#FFF5C0] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,245,192,0.2)]">
          <span className="text-black font-extrabold text-xl">M</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">MindRevol</span>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {getTitle()}
        </h1>
        <p className="text-zinc-400 text-base">
          {getSubtitle()}
        </p>
      </motion.div>
    </div>
  );
};

const AuthContent = () => {
  const { currentStep } = useAuthFlow();

  return (
    <>
      <AuthHeader />
      
      <div className="relative w-full min-h-[400px]"> 
        <AnimatePresence mode="wait" initial={false}>
          
          {currentStep === 'EMAIL_INPUT' && (
            <div key="email" className="absolute inset-0">
              <EmailForm />
            </div>
          )}
          
          {/* --- SỬA Ở ĐÂY: Thêm initialCountdown={60} --- */}
          {currentStep === 'OTP_INPUT' && (
            <div key="otp" className="absolute inset-0">
              <OtpForm initialCountdown={60} />
            </div>
          )}
          {/* ------------------------------------------- */}

          {currentStep === 'PASSWORD_LOGIN' && (
            <div key="password" className="absolute inset-0">
              <PasswordForm />
            </div>
          )}
          
          {currentStep === 'REGISTER_WIZARD' && (
            <div key="register" className="absolute inset-0">
              <RegisterWizard />
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const AuthPage = () => {
  return (
    <AuthLayout>
      <AuthFlowProvider>
        <AuthContent />
      </AuthFlowProvider>
    </AuthLayout>
  );
};

export default AuthPage;