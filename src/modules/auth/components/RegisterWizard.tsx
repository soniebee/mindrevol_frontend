import React from 'react';
import { StepPassword } from './registration/StepPassword';
import { StepHandle } from './registration/StepHandle';
import { StepBasicInfo } from './registration/StepBasicInfo';
import { OtpForm } from './OtpForm'; 
import { AnimatePresence } from 'framer-motion';
import { useRegisterWizard } from '../hooks/useRegisterWizard';

export const RegisterWizard = () => {
  const { step, setStep, email, error, isLoading, resetFlow, handlers } = useRegisterWizard();

  return (
    <div className="w-full space-y-4">
      {step !== 4 && (
        <div className="mb-5 flex items-center justify-between font-quicksand">
          <div className="text-sm font-bold text-cute-dark/60 uppercase tracking-wider">Tạo tài khoản</div>
          <div className="text-xs font-bold text-cute-dark bg-cute-yellow/60 border-2 border-cute-dark px-3 py-1.5 rounded-[10px]">
            {email}
          </div>
        </div>
      )}

      {step !== 4 && (
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-2.5 flex-1 rounded-[5px] transition-all duration-500 border-2 ${
                step >= i 
                  ? 'bg-cute-green border-cute-dark' 
                  : 'bg-white border-cute-dark/20'
              }`} 
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 border-2 border-red-400 rounded-[15px] bg-red-50 text-red-600 text-sm font-bold text-center">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && <StepPassword key="step1" onNext={handlers.onPasswordSubmit} />}
        {step === 2 && <StepBasicInfo key="step2" onNext={handlers.onInfoSubmit} onBack={() => setStep(1)} />}
        {step === 3 && <StepHandle key="step3" onFinish={handlers.onHandleSubmit} onBack={() => setStep(2)} isLoading={isLoading} />}
        {step === 4 && <OtpForm key="step4" customVerify={handlers.onOtpVerify} onResend={handlers.onResendOtp} onBack={() => setStep(3)} initialCountdown={60} />}
      </AnimatePresence>
      
      {step === 1 && (
        <button onClick={resetFlow} className="w-full mt-6 text-sm font-bold text-cute-dark/60 hover:text-cute-dark underline decoration-cute-green decoration-2 underline-offset-4 transition-colors">
          Không phải email của bạn? Nhập lại nhé
        </button>
      )}
    </div>
  );
};