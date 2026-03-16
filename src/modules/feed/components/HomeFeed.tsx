import React, { useEffect, useState, useMemo } from 'react';
import { feedService } from '../services/feed.service';
import { FeedItem, PostProps } from '../types';
import { LocketFeedViewer } from './LocketFeedViewer'; 
import { Loader2 } from 'lucide-react';
import { MemberFilter } from './MemberFilter'; 
import { useAuth } from '@/modules/auth/store/AuthContext'; 

interface HomeFeedProps {
  selectedJourneyId: string | null;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ selectedJourneyId }) => {
  const { user } = useAuth(); 
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setPosts([]); 
      setSelectedUserId(null); 
      try {
        let data: FeedItem[] = [];
        if (selectedJourneyId) {
          data = await feedService.getJourneyFeed(selectedJourneyId);
        } else {
          data = await feedService.getRecentFeed();
        }
        setPosts(data);
      } catch (error) {
        console.error("Lỗi tải feed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedJourneyId]);

  const feedMembers = useMemo(() => {
    const membersMap = new Map();
    posts.forEach(post => {
      if (post.type !== 'AD') {
        const uid = post.user?.id || post.userId;
        if (uid && !membersMap.has(uid)) {
          membersMap.set(uid, {
            id: uid, name: post.user?.name || 'User', avatar: post.user?.avatar, status: 'NORMAL', presenceRate: 0 
          });
        }
      }
    });
    return Array.from(membersMap.values());
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedUserId) return posts; 
    return posts.filter(post => {
      if (post.type !== 'AD') {
          const uid = post.user?.id || post.userId;
          return String(uid) === String(selectedUserId);
      }
      return false; 
    });
  }, [posts, selectedUserId]);

  const actualPostsForLocket = useMemo(() => {
     return filteredPosts.filter(p => p.type !== 'AD') as PostProps[];
  }, [filteredPosts]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (filteredPosts.length === 0) {
     return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 bg-transparent">
            {selectedUserId ? "Thành viên này chưa có bài viết nào ở đây." : selectedJourneyId ? "Hành trình này chưa có bài viết nào." : "Chưa có hoạt động nào gần đây."}
        </div>
     );
  }

  return (
    <div className="w-full h-full flex flex-col relative bg-transparent">
        
      {/* Bộ lọc thành viên (nếu có) */}
      {feedMembers.length > 0 && (
        <div className="absolute top-2 left-0 right-0 z-[60] flex justify-center pointer-events-auto">
            <MemberFilter members={feedMembers} currentUser={user} selectedUserId={selectedUserId} onSelectUser={setSelectedUserId} />
        </div>
      )}

      {/* Vùng Locket (Đã xóa FeedHeader tĩnh) */}
      <div className="flex-1 w-full relative overflow-hidden">
        <LocketFeedViewer posts={actualPostsForLocket} />
      </div>
      
    </div>
  );
};