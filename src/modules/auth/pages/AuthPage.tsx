import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout'; 
import { AuthFlowProvider, useAuthFlow } from '../store/AuthFlowContext';
import { EmailForm } from '../components/EmailForm';
import { PasswordForm } from '../components/PasswordForm';
import { RegisterWizard } from '../components/RegisterWizard';
import { OtpForm } from '../components/OtpForm';
import { SocialSetupWizard } from '../components/SocialSetupWizard'; 
import { AnimatePresence, motion } from 'framer-motion';

const AuthHeader = () => {
  const { currentStep } = useAuthFlow();
  
  const getTitle = () => {
    switch (currentStep) {
      case 'EMAIL_INPUT': return 'Bắt đầu nào!';
      case 'OTP_INPUT': return 'Xác nhận nhé';
      case 'PASSWORD_LOGIN': return 'Chào mừng lại!';
      default: return 'MindRevol';
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 'EMAIL_INPUT': return 'Đăng nhập hoặc tạo tài khoản mới.';
      case 'OTP_INPUT': return 'Mã 6 số vừa được gửi qua mail của cậu.';
      case 'PASSWORD_LOGIN': return 'Mở cửa bước vào thế giới của cậu.';
      default: return '';
    }
  };

  return (
    <div className="mb-8 flex flex-col items-center text-center w-full">
      {/* MASCOT TỪ FILE INDEX.HTML - Chuyển sang React SVG */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-[100px] h-[100px] mb-4 drop-shadow-[0_10px_15px_rgba(0,0,0,0.05)]"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M10 50C10 27.9086 27.9086 10 50 10C72.0914 10 90 27.9086 90 50C90 72.0914 72.0914 90 50 90C35 90 25 90 10 90C10 75 10 72.0914 10 50Z" fill="#FFF2F2" stroke="#2B2A29" strokeWidth="4" strokeLinejoin="round"/>
            <circle cx="35" cy="45" r="5" fill="#2B2A29"/>
            <circle cx="65" cy="45" r="5" fill="#2B2A29"/>
            <ellipse cx="25" cy="55" rx="4" ry="3" fill="#FFB7C5" opacity="0.6"/>
            <ellipse cx="75" cy="55" rx="4" ry="3" fill="#FFB7C5" opacity="0.6"/>
            <path d="M45 55C45 55 48 58 50 58C52 58 55 55 55 55" stroke="#2B2A29" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-[2.2rem] font-extrabold text-[#1A1A1A] mb-2 leading-tight tracking-tight">
          {getTitle()}
        </h1>
        <p className="text-[1.05rem] font-semibold text-[#4A4A4A] opacity-90 px-4">
          {getSubtitle()}
        </p>
      </motion.div>
    </div>
  );
};

const AuthContent = () => {
  const { currentStep } = useAuthFlow();
  const isWizardFlow = currentStep === 'REGISTER_WIZARD' || currentStep === 'SOCIAL_SETUP';

  return (
    <>
      {!isWizardFlow && <AuthHeader />}
      
      <div className={`relative w-full ${isWizardFlow ? 'min-h-[500px] flex flex-col justify-center' : 'min-h-[350px]'}`}> 
        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 'EMAIL_INPUT' && (
             <div key="email" className="absolute inset-0 w-full"><EmailForm /></div>
          )}
          {currentStep === 'OTP_INPUT' && (
             <div key="otp" className="absolute inset-0 w-full"><OtpForm initialCountdown={60} /></div>
          )}
          {currentStep === 'PASSWORD_LOGIN' && (
             <div key="password" className="absolute inset-0 w-full"><PasswordForm /></div>
          )}
          {currentStep === 'REGISTER_WIZARD' && (
             <div key="register" className="w-full"><RegisterWizard /></div>
          )}
          {currentStep === 'SOCIAL_SETUP' && (
             <div key="social_setup" className="w-full"><SocialSetupWizard /></div>
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