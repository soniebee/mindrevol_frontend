import { useState, useEffect, useCallback, useMemo } from 'react';
import { journeyService } from '@/modules/journey/services/journey.service';
import { checkinService } from '@/modules/checkin/services/checkin.service';
import { UserActiveJourneyResponse } from '@/modules/journey/types';
import { Checkin } from '@/modules/checkin/types';

export const useProfileContent = (currentProfileId: string | undefined, isMe: boolean | undefined, activeTab: string) => {
  const [publicJourneys, setPublicJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [privateJourneys, setPrivateJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [savedCheckins, setSavedCheckins] = useState<Checkin[]>([]);
  const [archivedCheckins, setArchivedCheckins] = useState<Checkin[]>([]);

  // 🔥 STATE CHO BỘ LỌC THEO BOX
  const [selectedBoxId, setSelectedBoxId] = useState<string>('ALL');

  const fetchJourneys = useCallback(async () => {
    if (!currentProfileId) return;
    const idStr = String(currentProfileId);
    try {
      const publicRes = await journeyService.getUserPublicJourneys(idStr).catch(() => []);
      setPublicJourneys((publicRes || []).map(j => ({ ...j, isProfileVisible: true })));

      if (isMe) {
          const privateRes = await journeyService.getUserPrivateJourneys(idStr).catch(() => []);
          setPrivateJourneys((privateRes || []).map(j => ({ ...j, isProfileVisible: false })));
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
        .catch((err: any) => console.error("Lỗi tải bài đã lưu:", err));
    }

    if (isMe && activeTab === 'ARCHIVED' && archivedCheckins.length === 0) {
      checkinService.getArchivedCheckins()
        .then(data => setArchivedCheckins(data as unknown as Checkin[]))
        .catch((err: any) => console.error("Lỗi tải bài lưu trữ:", err));
    }
  }, [activeTab, isMe, savedCheckins.length, archivedCheckins.length]);

  // 🔥 Tự động Reset bộ lọc khi chuyển Tab (từ Công khai sang Riêng tư, v.v.)
  useEffect(() => {
      setSelectedBoxId('ALL');
  }, [activeTab]);

  const toggleLocalVisibility = (journeyId: string, currentVisibility: boolean) => {
    if (currentVisibility) {
        const journeyToMove = publicJourneys.find(j => j.id === journeyId);
        if (journeyToMove) {
            setPublicJourneys(prev => prev.filter(j => j.id !== journeyId));
            setPrivateJourneys(prev => [{ ...journeyToMove, isProfileVisible: false }, ...prev]);
        }
    } else {
        const journeyToMove = privateJourneys.find(j => j.id === journeyId);
        if (journeyToMove) {
            setPrivateJourneys(prev => prev.filter(j => j.id !== journeyId));
            setPublicJourneys(prev => [{ ...journeyToMove, isProfileVisible: true }, ...prev]);
        }
    }
  };

  // 🔥 TỰ ĐỘNG TRÍCH XUẤT DANH SÁCH BOX TỪ NHỮNG HÀNH TRÌNH ĐÃ TẢI VỀ
  const availableBoxes = useMemo(() => {
      const journeysToProcess = activeTab === 'PUBLIC' ? publicJourneys : (activeTab === 'PRIVATE' ? privateJourneys : []);
      const boxMap = new Map<string, { id: string, name: string, avatar: string | null }>();
      
      journeysToProcess.forEach(j => {
          // Lấy ID của Box (Hỗ trợ cấu trúc DTO linh hoạt)
          const bId = (j as any).boxId || (j as any).box?.id;
          const bName = (j as any).boxName || (j as any).box?.name || "Không gian";
          const bAvatar = (j as any).boxAvatar || (j as any).box?.avatar || null;

          if (bId) {
              if (!boxMap.has(bId)) {
                  boxMap.set(bId, { id: bId, name: bName, avatar: bAvatar });
              }
          }
      });
      
      return Array.from(boxMap.values());
  }, [activeTab, publicJourneys, privateJourneys]);

  // 🔥 LỌC HÀNH TRÌNH 0 ĐỘ TRỄ
  const filteredPublicJourneys = useMemo(() => {
      if (selectedBoxId === 'ALL') return publicJourneys;
      return publicJourneys.filter(j => ((j as any).boxId || (j as any).box?.id) === selectedBoxId);
  }, [publicJourneys, selectedBoxId]);

  const filteredPrivateJourneys = useMemo(() => {
      if (selectedBoxId === 'ALL') return privateJourneys;
      return privateJourneys.filter(j => ((j as any).boxId || (j as any).box?.id) === selectedBoxId);
  }, [privateJourneys, selectedBoxId]);

  // Trả về danh sách đã lọc thay vì danh sách gốc
  return { 
      publicJourneys: filteredPublicJourneys, 
      privateJourneys: filteredPrivateJourneys, 
      savedCheckins, 
      archivedCheckins, 
      toggleLocalVisibility,
      // Xuất các state và data cho bộ lọc
      selectedBoxId,
      setSelectedBoxId,
      availableBoxes
  };
};