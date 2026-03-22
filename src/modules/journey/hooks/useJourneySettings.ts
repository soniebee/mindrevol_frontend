import { useState, useEffect } from 'react';
import { JourneyResponse, UpdateJourneySettingsRequest } from '../types';
import { journeyService } from '../services/journey.service';

export const useJourneySettings = (journey: JourneyResponse | null, onUpdateSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<UpdateJourneySettingsRequest>({
    name: '',
    description: '',
    theme: '',
    hasStreak: false,
    requiresFreezeTicket: false,
    isHardcore: false,
    requireApproval: false,
    themeColor: '#3b82f6',
    avatar: '🚀',
    boxId: '' // [THÊM MỚI]
  });

  useEffect(() => {
    if (journey) {
      setSettings({
        name: journey.name,
        description: journey.description,
        theme: journey.theme,
        hasStreak: journey.settingHasStreak,
        requiresFreezeTicket: journey.settingReqFreezeTicket,
        isHardcore: journey.settingIsHardcore,
        requireApproval: journey.requireApproval,
        visibility: journey.visibility as any,
        themeColor: journey.themeColor || '#3b82f6',
        avatar: journey.avatar || '🚀',
        boxId: journey.boxId || '' // [THÊM MỚI]
      });
    }
  }, [journey]);

  const updateField = (field: keyof UpdateJourneySettingsRequest, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!journey) return;
    
    setIsLoading(true);
    try {
      await journeyService.updateSettings(journey.id, settings);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi cập nhật cài đặt");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    updateField,
    handleSave
  };
};