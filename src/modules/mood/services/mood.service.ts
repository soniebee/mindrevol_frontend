import { http } from '@/lib/http';
import { MoodResponse, MoodRequest } from '../types';

export const moodService = {
    // Lấy danh sách cảm xúc đang hoạt động
    getActiveMoods: async (boxId: string): Promise<MoodResponse[]> => {
        const response = await http.get<{ data: MoodResponse[] }>(`/boxes/${boxId}/moods`);
        return response.data.data;
    },

    // Cài đặt hoặc cập nhật cảm xúc
    setMood: async (boxId: string, data: MoodRequest): Promise<MoodResponse> => {
        const response = await http.post<{ data: MoodResponse }>(`/boxes/${boxId}/moods`, data);
        return response.data.data;
    },

    // Tự xóa trạng thái của bản thân
    deleteMood: async (boxId: string): Promise<void> => {
        await http.delete(`/boxes/${boxId}/moods/me`);
    },

    // Thả cảm xúc vào trạng thái của bạn bè
    reactToMood: async (boxId: string, moodId: string, emoji: string): Promise<void> => {
        await http.post(`/boxes/${boxId}/moods/${moodId}/reactions`, null, { params: { type: emoji } });
    },

    // Hủy bỏ cảm xúc đã thả
    removeReaction: async (boxId: string, moodId: string): Promise<void> => {
        await http.delete(`/boxes/${boxId}/moods/${moodId}/reactions`);
    },

    // 🔥 TÍNH NĂNG MỚI: Hỏi thăm/Chọc bạn bè
    askMood: async (boxId: string, targetUserId: string): Promise<void> => {
        await http.post(`/boxes/${boxId}/moods/ask/${targetUserId}`);
    }
};