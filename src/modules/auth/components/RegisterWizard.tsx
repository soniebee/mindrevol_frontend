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
        <div className="mb-4 flex items-center justify-between font-['Nunito']">
          <div className="text-sm font-bold text-stone-600 uppercase tracking-wider">Tạo tài khoản</div>
          <div className="text-sm font-bold text-blue-900 bg-blue-100/70 px-3 py-1.5 rounded-xl">{email}</div>
        </div>
      )}

      {step !== 4 && (
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-lime-400 shadow-[0px_2px_4px_0px_rgba(163,230,53,0.5)]' : 'bg-neutral-200'}`} />
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-100 text-red-600 text-sm font-['Nunito'] font-bold text-center">
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
        <button onClick={resetFlow} className="w-full mt-8 text-sm font-['Nunito'] font-bold text-stone-500 hover:text-red-950 underline underline-offset-4 transition-colors">
          Không phải email của bạn? Nhập lại
        </button>
      )}
    </div>
  );
};