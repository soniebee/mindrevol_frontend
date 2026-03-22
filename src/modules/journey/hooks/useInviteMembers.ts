import { useState, useEffect } from 'react';
import { journeyService } from '../services/journey.service';
import { friendService } from '@/modules/user/services/friend.service'; 

export const useInviteMembers = (journeyId: string) => {
  const [friends, setFriends] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // [FIX] Đổi kiểu state từ number[] sang string[] vì ID là UUID string
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const res: any = await friendService.getMyFriends();
        // Kiểm tra cấu trúc trả về
        if (Array.isArray(res)) {
            setFriends(res);
        } else if (res && res.content && Array.isArray(res.content)) {
            setFriends(res.content);
        } else {
            setFriends([]);
        }
      } catch (err) {
        console.error("Failed to load friends", err);
        setFriends([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadFriends();
  }, []);

  // [FIX] Đổi tham số đầu vào từ number sang string
  const inviteUser = async (friendId: string) => {
    try {
      await journeyService.inviteFriend(journeyId, friendId);
      setInvitedIds(prev => [...prev, friendId]);
    } catch (err: any) {
      alert("Lỗi khi mời: " + (err.response?.data?.message || err.message));
    }
  };

  return { friends, isLoading, invitedIds, inviteUser };
};