import { http } from '@/lib/http';
import { FeedItem, PostProps, AdProps, InteractionType, Emotion } from '../types';

// Helper map dữ liệu từ Backend sang UI Model
const mapToFeedItem = (item: any): FeedItem => {
  // 1. Map Quảng Cáo
  if (item.type === 'AD' || item.feedType === 'AD') {
      return {
          id: item.id,
          type: 'AD',
          title: item.title || "Quảng cáo",
          description: item.description,
          imageUrl: item.imageUrl || item.image,
          ctaText: item.ctaText || "Xem thêm",
          ctaLink: item.ctaLink || "#",
          brandName: item.brandName,
          brandLogo: item.brandLogo
      } as AdProps;
  }

  // 2. Map Bài Post (Checkin)
  const date = new Date(item.timestamp || item.createdAt);
  const formattedTime = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
  });

  return {
    ...item,
    type: 'POST',
    id: item.id,
    userId: item.user?.id || item.userId,
    user: {
      id: item.user?.id,
      name: item.user?.fullname || item.user?.name || "Người dùng",
      avatar: item.user?.avatarUrl || item.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.fullname || 'User')}`,
    },
    image: item.imageUrl || item.image || item.thumbnailUrl,
    caption: item.caption,
    
    timestamp: formattedTime, 
    
    status: item.status?.toLowerCase() || 'normal',
    reactionCount: item.reactionCount || 0,
    commentCount: item.commentCount || 0,
    latestReactions: item.latestReactions || [],
    emotion: item.emotion || Emotion.NORMAL,
    interactionType: item.interactionType || InteractionType.GROUP_DISCUSS,
    activityName: item.activityName,
    locationName: item.locationName,
    taskName: item.taskTitle || item.taskName
  } as PostProps;
};

export const feedService = {
  // 1. Lấy Feed Mặc định (Backend tự lọc 3 ngày gần nhất)
  getRecentFeed: async (page: number = 0, limit: number = 10): Promise<FeedItem[]> => {
    // Gọi endpoint Unified của CheckinController
    const response = await http.get<any>(`/checkins/unified`, { 
      params: { page, limit }
    });
    const rawData = response.data.data || [];
    return rawData.map(mapToFeedItem);
  },

  // 2. Lấy Feed của Hành trình (Lấy tất cả)
  getJourneyFeed: async (journeyId: string, page: number = 0, limit: number = 10): Promise<FeedItem[]> => {
    // Gọi endpoint Journey của CheckinController
    const response = await http.get<any>(`/checkins/journey/${journeyId}`, {
      params: { page, limit }
    });
    
    const rawData = response.data.data || []; // CheckinController trả về List<CheckinResponse>
    // Nếu API trả về Page object, cần sửa thành response.data.data.content
    return rawData.map(mapToFeedItem);
  },

  // 3. Tương tác (Thả tim/Reaction)
  toggleReaction: async (checkinId: string, emoji: string) => {
    return await http.post(`/checkins/${checkinId}/reactions`, { emoji });
  },

  // 4. Bình luận
  postComment: async (checkinId: string, content: string) => {
      return await http.post(`/checkins/${checkinId}/comments`, { content });
  },

  // 5. Lấy danh sách Reaction
  getPostReactions: async (checkinId: string) => {
    const response = await http.get<any>(`/checkins/${checkinId}/reactions`);
    return response.data.data;
  }
};