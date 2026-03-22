// src/modules/feed/hooks/usePostActivities.ts
import { useState, useEffect } from 'react';
import { feedService } from '../services/feed.service';

// Nên move interface này ra file types.ts chung
export interface ActivityItem {
  id: string | number;
  userAvatar: string;
  userFullName: string;
  createdAt: string;
  type?: 'COMMENT' | 'REACTION' | string;
  content?: string;
  emoji?: string;
}

export const usePostActivities = (postId: string, isOpen: boolean) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && postId) {
      fetchActivities();
    }
  }, [isOpen, postId]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await feedService.getPostReactions(postId);
      if (Array.isArray(data)) {
        setActivities(data as unknown as ActivityItem[]);
      }
    } catch (error) {
      console.error("Failed to load activities", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { activities, isLoading, refetch: fetchActivities };
};