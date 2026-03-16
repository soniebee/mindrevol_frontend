import React from 'react';
import { StepPassword } from './registration/StepPassword';
import { StepHandle } from './registration/StepHandle';
import { StepBasicInfo } from './registration/StepBasicInfo';
import { OtpForm } from './OtpForm'; 
import { AnimatePresence, motion } from 'framer-motion';
import { useRegisterWizard } from '../hooks/useRegisterWizard';

export const RegisterWizard = () => {
  const { step, setStep, email, error, isLoading, resetFlow, handlers } = useRegisterWizard();

  return (
    <div className="w-full max-w-md mx-auto space-y-6 px-4 sm:px-0">
      {/* ── Header & Progress (Hidden at OTP step) ── */}
      {step !== 4 && (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900">Create your account</h2>
            <p className="text-sm text-zinc-600">Step {step} of 4 - {email}</p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-2 flex-1 rounded-full bg-zinc-200 overflow-hidden"
                initial={false}
              >
                {step >= i && (
                  <motion.div
                    className="h-full w-full bg-zinc-900"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium shadow-sm"
        >
          <span>⚠️</span>
          {error}
        </motion.div>
      )}

      {/* Steps */}
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
        {step === 4 && (
          <OtpForm 
            key="step4" 
            customVerify={handlers.onOtpVerify} 
            onResend={handlers.onResendOtp}     
            onBack={() => setStep(3)}  
            initialCountdown={60}
          />
        )}
      </AnimatePresence>
      
      {/* Reset button at step 1 */}
      {step === 1 && (
        <motion.button
          onClick={resetFlow}
          className="mt-2 w-full rounded-lg py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ← Change email
        </motion.button>
      )}
    </div>
  );
};