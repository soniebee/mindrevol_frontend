import { useState } from 'react';
import { journeyService } from '../services/journey.service';
import { toast } from 'react-hot-toast';

export const useJoinJourney = (onSuccess?: () => void) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    
    try {
      await journeyService.joinJourney({ inviteCode });
      // Trường hợp 1: Vào thẳng thành công
      toast.success('Tham gia hành trình thành công!');
      setInviteCode('');
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      
      // Trường hợp 2: Bị chặn lại do cần duyệt (Backend trả về lỗi 400 kèm message đặc biệt)
      if (msg.includes("phê duyệt") || msg.includes("chờ duyệt") || msg.includes("đã được gửi")) {
        // Đây thực ra là thông báo thành công (gửi request thành công)
        toast.success("Yêu cầu tham gia đã được gửi! Vui lòng chờ chủ phòng duyệt.");
        setInviteCode('');
        if (onSuccess) onSuccess(); // Đóng modal luôn cho gọn
      } else {
        // Trường hợp 3: Lỗi thật (sai code, block...)
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    inviteCode, 
    setInviteCode, 
    handleJoin, 
    isLoading 
  };
};