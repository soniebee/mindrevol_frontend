import { useState, useEffect, useCallback } from 'react';
import { moodService } from '../services/mood.service';
import { MoodResponse, MoodRequest } from '../types';
import { toast } from 'react-hot-toast';
// [THÊM IMPORT CHAT SERVICE]
import { chatService } from '../../chat/services/chat.service'; 

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
    }, [fetchMoods]);

    const handleSetMood = async (data: MoodRequest) => {
        if (!boxId) return;
        try {
            // 1. Lưu trạng thái Mood lên Server
            await moodService.setMood(boxId, data);
            toast.success('Đã cập nhật trạng thái!');
            fetchMoods(); // Reload danh sách mood

            // ==========================================
            // 2. TỰ ĐỘNG BẮN TIN NHẮN VÀO BOX CHAT
            // ==========================================
            try {
                // Lấy thông tin Conversation tương ứng với Box này để lấy đúng ID
                const conv = await chatService.getBoxConversation(boxId);
                
                if (conv && conv.id) {
                    // Tạo nội dung tin nhắn. VD: "😎 Đang code dạo..."
                    const moodContent = data.message ? `${data.icon} ${data.message}` : `${data.icon}`;
                    
                    // Gọi API gửi tin nhắn
                    await chatService.sendMessage({
                        conversationId: conv.id,
                        receiverId: conv.id, // Trong ngữ cảnh Box/Group thì receiverId có thể là ID của Box luôn (tuỳ logic backend của bro)
                        content: `Vừa cập nhật trạng thái: ${moodContent}`,
                        type: 'TEXT' as any,
                        clientSideId: Date.now().toString()
                    } as any);
                }
            } catch (chatError) {
                console.error("Lỗi khi tự động gửi tin nhắn mood vào box:", chatError);
                // Lỗi gửi tin nhắn thì cứ kệ nó, không cần báo lỗi cho user vì mood đã lưu thành công rồi
            }
            // ==========================================

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
            fetchMoods(); 
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