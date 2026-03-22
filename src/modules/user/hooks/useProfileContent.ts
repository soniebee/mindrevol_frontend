import { useState, useEffect, useCallback } from 'react';
import { journeyService } from '@/modules/journey/services/journey.service';
import { checkinService } from '@/modules/checkin/services/checkin.service';
import { UserActiveJourneyResponse } from '@/modules/journey/types';
import { Checkin } from '@/modules/checkin/types';

export const useProfileContent = (currentProfileId: string | undefined, isMe: boolean | undefined, activeTab: string) => {
  const [publicJourneys, setPublicJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [privateJourneys, setPrivateJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [savedCheckins, setSavedCheckins] = useState<Checkin[]>([]);

  const fetchJourneys = useCallback(async () => {
    if (!currentProfileId) return;
    const idStr = String(currentProfileId);
    try {
      const publicRes = await journeyService.getUserPublicJourneys(idStr).catch(() => []);
      setPublicJourneys(publicRes || []);

      if (isMe) {
          const privateRes = await journeyService.getUserPrivateJourneys(idStr).catch(() => []);
          setPrivateJourneys(privateRes || []);
      } else {
          setPrivateJourneys([]);
      }
    } catch (error) {
      console.error("Lỗi tải/phân loại hành trình:", error);
    }
  }, [currentProfileId, isMe]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  useEffect(() => {
    if (isMe && activeTab === 'SAVED' && savedCheckins.length === 0) {
      checkinService.getSavedCheckins()
        .then(data => setSavedCheckins(data as unknown as Checkin[]))
        .catch(err => console.error("Lỗi tải bài đã lưu:", err));
    }
  }, [activeTab, isMe, savedCheckins.length]);

  // [THÊM MỚI] Hàm luân chuyển Hành trình giữa Công khai <-> Riêng tư ngay lập tức
  const toggleLocalVisibility = (journeyId: string, currentVisibility: boolean) => {
    if (currentVisibility) {
        // Đang Công khai -> Ném qua Riêng tư
        const journeyToMove = publicJourneys.find(j => j.id === journeyId);
        if (journeyToMove) {
            setPublicJourneys(prev => prev.filter(j => j.id !== journeyId));
            setPrivateJourneys(prev => [{ ...journeyToMove, isProfileVisible: false }, ...prev]);
        }
    } else {
        // Đang Riêng tư -> Ném về Công khai
        const journeyToMove = privateJourneys.find(j => j.id === journeyId);
        if (journeyToMove) {
            setPrivateJourneys(prev => prev.filter(j => j.id !== journeyId));
            setPublicJourneys(prev => [{ ...journeyToMove, isProfileVisible: true }, ...prev]);
        }
    }
  };

  return { publicJourneys, privateJourneys, savedCheckins, toggleLocalVisibility };
};