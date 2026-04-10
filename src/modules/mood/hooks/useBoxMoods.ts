import { useState, useEffect, useCallback } from 'react';
import { moodService } from '../services/mood.service'; 
import { boxService } from '@/modules/box/services/box.service'; 
import { chatService } from '@/modules/chat/services/chat.service'; 
import { MoodResponse, MoodRequest } from '../types';
import { toast } from 'react-hot-toast';

export const useBoxMoods = (boxId: string | undefined, currentUserId: string | undefined) => {
    const [moods, setMoods] = useState<MoodResponse[]>([]);
    const [boxMembers, setBoxMembers] = useState<any[]>([]); 
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!boxId) return;
        setIsLoading(true);
        try {
            const [moodsData, membersData] = await Promise.all([
                moodService.getActiveMoods(boxId),
                boxService.getBoxMembers(boxId, 0, 50)
            ]);
            
            // Sắp xếp: Dùng createdAt
            const sortedMoods = moodsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            
            setMoods(sortedMoods);
            setBoxMembers(membersData.content || []);
        } catch (error) {
            console.error('Không thể tải dữ liệu cảm xúc:', error);
        } finally {
            setIsLoading(false);
        }
    }, [boxId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSetMood = async (data: MoodRequest) => {
        if (!boxId) return;
        try {
            await moodService.setMood(boxId, data);
            toast.success('Đã cập nhật trạng thái!');
            fetchData(); 

            try {
                const conv = await chatService.getBoxConversation(boxId);
                if (conv && conv.id) {
                    const moodContent = data.message ? `${data.icon} ${data.message}` : `${data.icon}`;
                    await chatService.sendMessage({
                        conversationId: conv.id,
                        receiverId: conv.id, 
                        content: `Vừa cập nhật trạng thái: ${moodContent}`,
                        type: 'TEXT' as any,
                        clientSideId: Date.now().toString()
                    } as any);
                }
            } catch (chatError) {
                console.error("Lỗi gửi thông báo vào box chat:", chatError);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
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
        if (!boxId) return;
        try {
            await moodService.reactToMood(boxId, moodId, emoji);
            fetchData(); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi gửi tương tác');
        }
    };

    const handleAskMood = async (targetUserId: string) => {
        if (!boxId || !currentUserId) return;
        try {
            await moodService.askMood(boxId, targetUserId);
            
            // ĐÃ SỬA LỖI: Chỉ truyền 1 tham số targetUserId
            const conv = await chatService.getOrCreateConversation(targetUserId);
            await chatService.sendMessage({
                conversationId: conv.id,
                receiverId: targetUserId,
                content: `Này, bạn đang cảm thấy thế nào? Cập nhật cảm xúc vào Không gian nhé! ✨`,
                type: 'TEXT' as any,
                clientSideId: Date.now().toString()
            } as any);

            toast.success('Đã gửi lời hỏi thăm! ✨');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể gửi lời hỏi thăm');
        }
    };

    const handleReplyToMood = async (targetUserId: string, message: string, moodIcon: string) => {
        if (!currentUserId) return;
        try {
            // ĐÃ SỬA LỖI: Chỉ truyền 1 tham số targetUserId
            const conv = await chatService.getOrCreateConversation(targetUserId);
            await chatService.sendMessage({
                conversationId: conv.id,
                receiverId: targetUserId,
                content: `[Phản hồi trạng thái ${moodIcon}] ${message}`,
                type: 'TEXT' as any,
                clientSideId: Date.now().toString()
            } as any);
            toast.success('Đã gửi tin nhắn riêng!');
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi gửi tin nhắn');
        }
    };

    const myMood = moods.find(m => m.userId === currentUserId);

    return {
        moods,
        boxMembers,
        myMood,
        isLoading,
        fetchData,
        handleSetMood,
        handleDeleteMood,
        handleReact,
        handleAskMood,
        handleReplyToMood
    };
};