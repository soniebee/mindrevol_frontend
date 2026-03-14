import { useState, useEffect } from 'react';
import { journeyService } from '@/modules/journey/services/journey.service';
import { checkinService } from '@/modules/checkin/services/checkin.service';
import { UserActiveJourneyResponse } from '@/modules/journey/types';
import { Checkin } from '@/modules/checkin/types'; // Vẫn giữ import này

export const useProfileContent = (currentProfileId: string | undefined, isMe: boolean | undefined, activeTab: string) => {
  const [activeJourneys, setActiveJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [finishedJourneys, setFinishedJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [savedCheckins, setSavedCheckins] = useState<Checkin[]>([]);

  // 1. Lấy danh sách Hành trình
  useEffect(() => {
    if (!currentProfileId) return;
    const idStr = String(currentProfileId);

    const fetchAndSortJourneys = async () => {
      try {
        const [activeRes, finishedRes] = await Promise.all([
          journeyService.getUserActiveJourneys(idStr).catch(() => []),
          journeyService.getUserFinishedJourneys(idStr).catch(() => [])
        ]);

        const allJourneys = [...(activeRes || []), ...(finishedRes || [])];
        const uniqueJourneys = Array.from(new Map(allJourneys.map(j => [j.id, j])).values());

        const now = new Date();
        const computedActive: UserActiveJourneyResponse[] = [];
        const computedFinished: UserActiveJourneyResponse[] = [];

        uniqueJourneys.forEach(j => {
          let isExpired = false;
          if (j.endDate) {
            const end = new Date(j.endDate);
            end.setHours(23, 59, 59, 999);
            isExpired = end < now;
          }
          const isCompleted = j.status === 'COMPLETED' || j.status === 'FINISHED' || isExpired;

          if (isCompleted) computedFinished.push(j);
          else computedActive.push(j);
        });

        setActiveJourneys(computedActive);
        setFinishedJourneys(computedFinished);
      } catch (error) {
        console.error("Lỗi tải/phân loại hành trình:", error);
      }
    };
    fetchAndSortJourneys();
  }, [currentProfileId]);

  // 2. Lấy danh sách Đã lưu (Chỉ fetch khi mở tab)
  useEffect(() => {
    if (isMe && activeTab === 'SAVED' && savedCheckins.length === 0) {
      checkinService.getSavedCheckins()
        // [ĐÃ SỬA] Ép kiểu an toàn (Type Assertion) để đồng bộ 2 interface Checkin
        .then(data => setSavedCheckins(data as unknown as Checkin[]))
        .catch(err => console.error("Lỗi tải bài đã lưu:", err));
    }
  }, [activeTab, isMe, savedCheckins.length]);

  return { activeJourneys, finishedJourneys, savedCheckins };
};