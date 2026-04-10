import { useState, useEffect } from 'react';
import { feedService } from '../services/feed.service';
import { FeedItem } from '../types';

export const useJourneyGridFeed = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchGridData = async (currentPage: number) => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const newItems = await feedService.getJourneyGridFeed(currentPage, 18); // Lấy 18 ảnh mỗi lần
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => currentPage === 0 ? newItems : [...prev, ...newItems]);
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Lỗi khi tải Grid Feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGridData(0);
  }, []);

  const loadMore = () => fetchGridData(page);

  return { items, isLoading, hasMore, loadMore };
};