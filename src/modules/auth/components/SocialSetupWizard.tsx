import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StepBasicInfo } from './registration/StepBasicInfo';
import { StepHandle } from './registration/StepHandle';
import { useAuthFlow } from '../store/AuthFlowContext';
import { StepBasicInfoValues } from '../schemas/auth.schema';
import { toast } from 'react-hot-toast';
import { http } from '@/lib/http';

export const SocialSetupWizard = () => {
  const { tempToken, completeSocialSetup, resetFlow } = useAuthFlow();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [basicInfo, setBasicInfo] = useState<StepBasicInfoValues | null>(null);

  const handleBasicInfoSubmit = (data: StepBasicInfoValues) => {
    setBasicInfo(data);
    setStep(2);
  };

  const handleHandleSubmit = async (handle: string) => {
    if (!tempToken) return;
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (basicInfo?.fullname) formData.append('fullname', basicInfo.fullname);
      if (basicInfo?.dateOfBirth) formData.append('dateOfBirth', basicInfo.dateOfBirth);
      if (basicInfo?.gender) formData.append('gender', basicInfo.gender);
      formData.append('handle', handle);

      await http.put('/users/me', formData, {
        headers: {
          Authorization: `Bearer ${tempToken.accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Hồ sơ đã được thiết lập!', { icon: '🎉' });
      completeSocialSetup();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="mb-5 flex items-center justify-between font-sans px-2">
        <div className="text-[0.9rem] font-bold text-[#8A8580] uppercase tracking-wider">Hoàn tất hồ sơ</div>
        <div className="text-[0.95rem] font-extrabold text-[#1A1A1A] bg-[#FFF8E7] px-3 py-1 rounded-[12px]">
          Bước {step}/2
        </div>
      </div>

      <div className="flex gap-2 mb-8 px-2">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className={`h-2 flex-1 rounded-full transition-all duration-500 ${
              step >= i ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'
            }`} 
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-white shadow-[0_4px_12px_rgba(239,68,68,0.1)] rounded-[16px] text-red-500 text-[0.9rem] font-bold text-center">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepBasicInfo 
            key="step1" 
            onNext={handleBasicInfoSubmit} 
            onBack={resetFlow} 
          />
        )}
        {step === 2 && (
          <StepHandle 
            key="step2" 
            onFinish={handleHandleSubmit} 
            onBack={() => setStep(1)} 
            isLoading={isLoading} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};