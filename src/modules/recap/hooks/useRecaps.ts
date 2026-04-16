import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { RecapResponse } from '../types';
import { recapService } from '../services/recap.service';

export const useRecaps = (shouldFetch: boolean = true) => {
  const [recaps, setRecaps] = useState<RecapResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecaps = useCallback(async () => {
    if (!shouldFetch) return;
    setIsLoading(true);
    try {
      const data = await recapService.getMyRecaps();
      setRecaps(data);
    } catch (error: any) {
      console.error('Lỗi tải danh sách Recap:', error);
    } finally {
      setIsLoading(false);
    }
  }, [shouldFetch]);

  useEffect(() => {
    fetchRecaps();
  }, [fetchRecaps]);

  const deleteRecap = async (recapId: string) => {
    try {
      await recapService.deleteRecap(recapId);
      setRecaps(prev => prev.filter(r => r.id !== recapId));
      toast.success('Đã xóa video nhìn lại');
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa video');
    }
  };

  return { recaps, isLoading, fetchRecaps, deleteRecap };
};