import { http } from '@/lib/http';
import { MoodResponse, MoodRequest } from '../types';

export const moodService = {
    // 1. Lấy danh sách Mood đang hoạt động trong Box
    getActiveMoods: async (boxId: string): Promise<MoodResponse[]> => {
        const response = await http.get<{ data: MoodResponse[] }>(`/boxes/${boxId}/moods`);
        return response.data.data;
    },

    // 2. Đăng / Cập nhật Mood
    setMood: async (boxId: string, data: MoodRequest): Promise<MoodResponse> => {
        const response = await http.post<{ data: MoodResponse }>(`/boxes/${boxId}/moods`, data);
        return response.data.data;
    },

    // 3. Xóa Mood của bản thân
    deleteMood: async (boxId: string): Promise<void> => {
        await http.delete(`/boxes/${boxId}/moods`);
    },

    // 4. Thả cảm xúc vào Mood của người khác
    reactToMood: async (moodId: string, emoji: string): Promise<void> => {
        await http.post(`/moods/${moodId}/reactions`, null, { params: { emoji } });
    },

    // 5. Gỡ cảm xúc
    removeReaction: async (moodId: string): Promise<void> => {
        await http.delete(`/moods/${moodId}/reactions`);
    }
};