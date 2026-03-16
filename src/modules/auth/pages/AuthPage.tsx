import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout'; 
import { AuthFlowProvider, useAuthFlow } from '../store/AuthFlowContext';
import { EmailForm } from '../components/EmailForm';
import { PasswordForm } from '../components/PasswordForm';
import { RegisterWizard } from '../components/RegisterWizard';
import { OtpForm } from '../components/OtpForm';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const AuthHeader = () => {
  const { currentStep, userInfo } = useAuthFlow();

  if (currentStep === 'EMAIL_INPUT') return null;
  
  const getTitle = () => {
    switch (currentStep) {
      case 'OTP_INPUT': return 'Verification';
      case 'PASSWORD_LOGIN': return userInfo?.fullname ? `Hi, ${userInfo.fullname.split(' ')[0]}!` : 'Welcome back';
      case 'REGISTER_WIZARD': return 'Sign up';
      default: return 'MindRevol';
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 'OTP_INPUT': return 'Enter the 6-digit code we just sent.';
      case 'PASSWORD_LOGIN': return 'Enter your password to continue.';
      case 'REGISTER_WIZARD': return 'Complete your account details.';
      default: return '';
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">Authentication</p>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          {getTitle()}
        </h1>
        <p className="text-sm text-slate-600">
          {getSubtitle()}
        </p>
      </motion.div>
    </div>
  );
};

const AuthContent = () => {
  const { currentStep } = useAuthFlow();
  const shouldReduceMotion = useReducedMotion();

  const renderStep = () => {
    switch (currentStep) {
      case 'EMAIL_INPUT':
        return <EmailForm />;
      case 'OTP_INPUT':
        return <OtpForm initialCountdown={60} />;
      case 'PASSWORD_LOGIN':
        return <PasswordForm />;
      case 'REGISTER_WIZARD':
        return <RegisterWizard />;
      default:
        return <EmailForm />;
    }
  };

  return (
    <>
      <AuthHeader />

      <div className="w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            className="w-full"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderStep()}
          </motion.div>
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