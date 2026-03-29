import { http } from '@/lib/http';
import { MoodResponse, MoodRequest } from '../types';

export const moodService = {
    // 1. Get active moods
    getActiveMoods: async (boxId: string): Promise<MoodResponse[]> => {
        const response = await http.get<{ data: MoodResponse[] }>(`/boxes/${boxId}/moods`);
        return response.data.data;
    },

    // 2. Set mood
    setMood: async (boxId: string, data: MoodRequest): Promise<MoodResponse> => {
        const response = await http.post<{ data: MoodResponse }>(`/boxes/${boxId}/moods`, data);
        return response.data.data;
    },

    // 3. Delete mood (Có /me để xóa trạng thái của mình)
    deleteMood: async (boxId: string): Promise<void> => {
        await http.delete(`/boxes/${boxId}/moods/me`);
    },

    // 4. React to mood
    reactToMood: async (boxId: string, moodId: string, emoji: string): Promise<void> => {
        await http.post(`/boxes/${boxId}/moods/${moodId}/reactions`, null, { params: { emoji } });
    },

    // 5. Remove reaction
    removeReaction: async (boxId: string, moodId: string): Promise<void> => {
        await http.delete(`/boxes/${boxId}/moods/${moodId}/reactions`);
    }
};