import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout'; 
import { AuthFlowProvider, useAuthFlow } from '../store/AuthFlowContext';
import { EmailForm } from '../components/EmailForm';
import { PasswordForm } from '../components/PasswordForm';
import { RegisterWizard } from '../components/RegisterWizard';
import { OtpForm } from '../components/OtpForm';
import { SocialSetupWizard } from '../components/SocialSetupWizard'; // Import thêm component mới
import { AnimatePresence, motion } from 'framer-motion';

const AuthHeader = () => {
  const { currentStep } = useAuthFlow();
  
  const getTitle = () => {
    switch (currentStep) {
      case 'EMAIL_INPUT': return 'Xin chào!';
      case 'OTP_INPUT': return 'Xác thực';
      case 'PASSWORD_LOGIN': return 'Mật khẩu';
      default: return 'MindRevol';
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 'EMAIL_INPUT': return 'Đăng nhập để tiếp tục hành trình.';
      case 'OTP_INPUT': return 'Nhập mã gồm 6 số vừa được gửi.';
      case 'PASSWORD_LOGIN': return 'Nhập mật khẩu của bạn.';
      default: return '';
    }
  };

  return (
    <div className="mb-8 text-center sm:text-left">
      <div className="flex items-center justify-center sm:justify-start gap-3 mb-6">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center origin-top-left rotate-[-5deg]">
          <span className="text-red-950 font-medium font-['Baloo_2'] text-2xl">M</span>
        </div>
        <span className="text-2xl font-semibold font-['Baloo_2'] text-red-950 tracking-wide mt-2">MindRevol</span>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold font-['Baloo_2'] text-blue-950 mb-2">
          {getTitle()}
        </h1>
        <p className="text-stone-600 font-['Nunito'] text-base font-semibold">
          {getSubtitle()}
        </p>
      </motion.div>
    </div>
  );
};

const AuthContent = () => {
  const { currentStep } = useAuthFlow();

  // Kiểm tra xem có đang ở các luồng cần ẩn Header không (Đăng ký hoặc Setup Social)
  const isWizardFlow = currentStep === 'REGISTER_WIZARD' || currentStep === 'SOCIAL_SETUP';

  return (
    <>
      {/* Ẩn Header chung nếu đang ở Wizard để form không bị đẩy xuống dưới quá nhiều */}
      {!isWizardFlow && <AuthHeader />}
      
      <div className={`relative w-full ${isWizardFlow ? 'min-h-[500px] flex flex-col justify-center' : 'min-h-[420px]'}`}> 
        <AnimatePresence mode="wait" initial={false}>
          
          {currentStep === 'EMAIL_INPUT' && (
            <div key="email" className="absolute inset-0">
              <EmailForm />
            </div>
          )}
          
          {currentStep === 'OTP_INPUT' && (
            <div key="otp" className="absolute inset-0">
              <OtpForm initialCountdown={60} />
            </div>
          )}

          {currentStep === 'PASSWORD_LOGIN' && (
            <div key="password" className="absolute inset-0">
              <PasswordForm />
            </div>
          )}
          
          {/* LUỒNG 1: Đăng ký truyền thống bằng Email */}
          {currentStep === 'REGISTER_WIZARD' && (
            <div key="register" className="w-full">
              <RegisterWizard />
            </div>
          )}
          
          {/* LUỒNG 2: Thiết lập thông tin cho tài khoản Social vừa tạo lần đầu */}
          {currentStep === 'SOCIAL_SETUP' && (
            <div key="social_setup" className="w-full">
              <SocialSetupWizard />
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