import { useState, useEffect, useCallback } from 'react';
import { moodService } from '../services/mood.service';
import { MoodResponse, MoodRequest } from '../types';
import { toast } from 'react-hot-toast';

export const useBoxMoods = (boxId: string | undefined, currentUserId: string | undefined) => {
    const [moods, setMoods] = useState<MoodResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMoods = useCallback(async () => {
        if (!boxId) return;
        setIsLoading(true);
        try {
            const data = await moodService.getActiveMoods(boxId);
            setMoods(data);
        } catch (error) {
            console.error('Lỗi tải Moods:', error);
        } finally {
            setIsLoading(false);
        }
    }, [boxId]);

    useEffect(() => {
        fetchMoods();
        // Có thể setup setInterval ở đây để tự động fetch lại sau mỗi X phút nếu muốn
    }, [fetchMoods]);

    const handleSetMood = async (data: MoodRequest) => {
        if (!boxId) return;
        try {
            await moodService.setMood(boxId, data);
            toast.success('Đã cập nhật trạng thái!');
            fetchMoods(); // Reload danh sách
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi đăng trạng thái');
            throw error;
        }
    };

    const handleDeleteMood = async () => {
        if (!boxId) return;
        try {
            await moodService.deleteMood(boxId);
            toast.success('Đã gỡ trạng thái!');
            setMoods(prev => prev.filter(m => m.userId !== currentUserId));
        } catch (error: any) {
            toast.error('Lỗi khi gỡ trạng thái');
        }
    };

    const handleReact = async (moodId: string, emoji: string) => {
        try {
            await moodService.reactToMood(moodId, emoji);
            fetchMoods(); // Tạm thời reload lại list để lấy reaction mới (tối ưu hơn là update state local)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi thả cảm xúc');
        }
    };

    const myMood = moods.find(m => m.userId === currentUserId);

    return {
        moods,
        myMood,
        isLoading,
        fetchMoods,
        handleSetMood,
        handleDeleteMood,
        handleReact
    };
};