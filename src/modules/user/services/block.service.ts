import { http } from '@/lib/http';
import { UserSummary } from './user.service'; // Tái sử dụng interface UserSummary

class BlockService {
  
  // Lấy danh sách chặn (Backend trả về List<UserSummaryResponse>)
  async getBlockList(): Promise<UserSummary[]> {
    const response = await http.get<{ data: UserSummary[] }>('/users/me/blocks');
    return response.data.data;
  }

  // Chặn người dùng (ID string)
  async blockUser(userId: string): Promise<void> {
    await http.post(`/users/blocks/${userId}`);
  }

  // Bỏ chặn (ID string)
  async unblockUser(userId: string): Promise<void> {
    await http.delete(`/users/blocks/${userId}`);
  }
}

export const blockService = new BlockService();