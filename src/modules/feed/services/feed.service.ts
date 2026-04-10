import { http } from '@/lib/http';
import { FeedItem, PostProps, AdProps, InteractionType, Emotion } from '../types';

const mapToFeedItem = (item: any): FeedItem => {
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

  const date = new Date(item.timestamp || item.createdAt);
  const formattedTime = date.toLocaleTimeString([], { 
      hour: '2-digit', minute: '2-digit', hour12: false 
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
  getRecentFeed: async (page: number = 0, limit: number = 10): Promise<FeedItem[]> => {
    const response = await http.get<any>(`/checkins/unified`, { params: { page, limit } });
    const rawData = response.data.data || [];
    return rawData.map(mapToFeedItem);
  },

  getJourneyFeed: async (journeyId: string, page: number = 0, limit: number = 10): Promise<FeedItem[]> => {
    const response = await http.get<any>(`/checkins/journey/${journeyId}`, { params: { page, limit } });
    const rawData = response.data.data || []; 
    return rawData.map(mapToFeedItem);
  },

  // [THÊM MỚI] Lấy Grid Feed
  getJourneyGridFeed: async (page: number = 0, limit: number = 18): Promise<FeedItem[]> => {
    const response = await http.get<any>(`/checkins/journeys/grid`, { params: { page, limit } });
    // Hỗ trợ cả 2 trường hợp backend trả về List hoặc Page object
    const rawData = response.data.data.content || response.data.data || [];
    return rawData.map(mapToFeedItem);
  },

  toggleReaction: async (checkinId: string, emoji: string) => {
    return await http.post(`/checkins/${checkinId}/reactions`, { emoji });
  },

  postComment: async (checkinId: string, content: string) => {
      return await http.post(`/checkins/${checkinId}/comments`, { content });
  },

  getPostReactions: async (checkinId: string) => {
    const response = await http.get<any>(`/checkins/${checkinId}/reactions`);
    return response.data.data;
  }
};