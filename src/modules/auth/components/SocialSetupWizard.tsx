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

  // Lưu trữ thông tin tạm từ Step 1
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
      // [ĐÃ SỬA]: Chuyển sang dùng FormData vì Backend hiện tại yêu cầu Multipart-form-data
      const formData = new FormData();
      if (basicInfo?.fullname) formData.append('fullname', basicInfo.fullname);
      if (basicInfo?.dateOfBirth) formData.append('dateOfBirth', basicInfo.dateOfBirth);
      if (basicInfo?.gender) formData.append('gender', basicInfo.gender);
      formData.append('handle', handle);

      // [ĐÃ SỬA]: URL chuẩn là /users/me và đính kèm header Content-Type
      await http.put('/users/me', formData, {
        headers: {
          Authorization: `Bearer ${tempToken.accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Hồ sơ đã được thiết lập!', { icon: '🎉' });
      completeSocialSetup(); // Hoàn tất và chính thức đăng nhập
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="mb-4 flex items-center justify-between font-['Nunito']">
        <div className="text-sm font-bold text-stone-600 uppercase tracking-wider">Hoàn tất hồ sơ</div>
        <div className="text-sm font-bold text-lime-800 bg-lime-100/70 px-3 py-1.5 rounded-xl">Bước {step}/2</div>
      </div>

      {/* PROGRESS BAR - Rút gọn còn 2 bước */}
      <div className="flex gap-2 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-lime-400 shadow-[0px_2px_4px_0px_rgba(163,230,53,0.5)]' : 'bg-neutral-200'}`} />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-100 text-red-600 text-sm font-['Nunito'] font-bold text-center">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepBasicInfo 
            key="step1" 
            onNext={handleBasicInfoSubmit} 
            onBack={resetFlow} // Hủy luồng, quay về màn hình nhập Email
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