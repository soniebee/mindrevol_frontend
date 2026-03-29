import { useState, useEffect, useCallback } from 'react';
// Bây giờ nó sẽ tìm thấy moodService từ file bên trên!
import { moodService } from '../services/mood.service'; 
import { MoodResponse, MoodRequest } from '../types';
import { toast } from 'react-hot-toast';
import { chatService } from '@/modules/chat/services/chat.service'; 

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
            console.error('Failed to load moods:', error);
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
            await moodService.setMood(boxId, data);
            toast.success('Status updated!');
            fetchMoods(); 

            try {
                const conv = await chatService.getBoxConversation(boxId);
                if (conv && conv.id) {
                    const moodContent = data.message ? `${data.icon} ${data.message}` : `${data.icon}`;
                    await chatService.sendMessage({
                        conversationId: conv.id,
                        receiverId: conv.id, 
                        content: `Just updated status: ${moodContent}`,
                        type: 'TEXT' as any,
                        clientSideId: Date.now().toString()
                    } as any);
                }
            } catch (chatError) {
                console.error("Error sending automated mood message to box:", chatError);
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
            throw error;
        }
    };

    const handleDeleteMood = async () => {
        if (!boxId) return;
        try {
            await moodService.deleteMood(boxId);
            toast.success('Status removed!');
            setMoods(prev => prev.filter(m => m.userId !== currentUserId));
        } catch (error: any) {
            toast.error('Failed to remove status');
        }
    };

    const handleReact = async (moodId: string, emoji: string) => {
        if (!boxId) return;
        try {
            await moodService.reactToMood(boxId, moodId, emoji);
            fetchMoods(); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to react');
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