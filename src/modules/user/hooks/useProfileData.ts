import { useState, useEffect } from 'react';
import { userService, UserProfile } from '../services/user.service';
import { friendService } from '../services/friend.service';

export const useProfileData = (currentProfileId: string | undefined, isViewingOther: boolean) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentProfileId) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        let data;
        if (isViewingOther) {
          data = await userService.getUserProfile(currentProfileId);
        } else {
          data = await userService.getMyProfile();
          data.isMe = true; 
        }
        setUserProfile(data);
      } catch (error) {
        console.error("Lỗi tải thông tin cá nhân:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [currentProfileId, isViewingOther]);

  const handleFriendRequest = async () => {
    if (!userProfile) return;
    try {
      await friendService.sendFriendRequest(userProfile.id);
      setUserProfile({ ...userProfile, friendshipStatus: 'PENDING' });
    } catch (error) {
      console.error("Failed to send request", error);
    }
  };

  return { userProfile, isLoading, handleFriendRequest };
};