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
    <div className="w-full">
      {/* HEADER - Ẩn khi ở màn OTP */}
      {step !== 4 && (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Đăng ký tài khoản</div>
          <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{email}</div>
        </div>
      )}

      {/* PROGRESS BAR */}
      {step !== 4 && (
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-surface border border-border'}`} />
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
            <StepPassword key="step1" onNext={handlers.onPasswordSubmit} />
        )}
        {step === 2 && (
            <StepBasicInfo key="step2" onNext={handlers.onInfoSubmit} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
            <StepHandle key="step3" onFinish={handlers.onHandleSubmit} onBack={() => setStep(2)} isLoading={isLoading} />
        )}
        {/* STEP 4: OTP */}
        {step === 4 && (
            <OtpForm 
                key="step4" 
                customVerify={handlers.onOtpVerify} 
                onResend={handlers.onResendOtp}     
                onBack={() => setStep(3)}  
                initialCountdown={60} // Tự động đếm ngược 60s
            />
        )}
      </AnimatePresence>
      
      {step === 1 && (
        <button onClick={resetFlow} className="w-full mt-6 text-xs text-muted hover:text-foreground underline underline-offset-2 transition-colors">
          Không phải email của bạn? Nhập lại
        </button>
      )}
    </div>
  );
};