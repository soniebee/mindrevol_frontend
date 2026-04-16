import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useJourneyGridFeed } from '../../feed/hooks/useJourneyGridFeed';
import { PostProps } from '../../feed/types';
import { ChevronDown, Check, Globe, MapPin, Grid3X3, Sparkles, Video } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { cn } from '@/lib/utils';
import { GlobalRecapModal } from '@/modules/recap/components/GlobalRecapModal';
// [THÊM MỚI] Import Modal chi tiết bài đăng
import { CheckinDetailModal } from '@/modules/checkin/components/CheckinDetailModal';
import { Checkin } from '@/modules/checkin/types';

const JourneyGridFeedPage = () => {
  const { items, isLoading, hasMore, loadMore } = useJourneyGridFeed();
  const { user: currentUser } = useAuth(); 
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [showGlobalRecap, setShowGlobalRecap] = useState(false);
  
  // [THÊM MỚI] State lưu trữ bài đăng đang được chọn để xem chi tiết
  const [selectedPost, setSelectedPost] = useState<Checkin | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueUsers = useMemo(() => {
    const usersMap = new Map();
    items.forEach(item => {
      if (item.type === 'POST') {
        const post = item as PostProps;
        if (post.user && post.user.id) {
          if (!usersMap.has(post.user.id)) {
            usersMap.set(post.user.id, post.user);
          }
        }
      }
    });
    return Array.from(usersMap.values());
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedUserId) return items;
    return items.filter(item => {
      if (item.type !== 'POST') return false;
      return (item as PostProps).user?.id === selectedUserId;
    });
  }, [items, selectedUserId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 100;
    if (bottom && !isLoading && hasMore) {
      loadMore();
    }
  };

  const handleSelectUser = (id: string | null) => {
    setSelectedUserId(id);
    setIsDropdownOpen(false);
  };

  const selectedUserDisplay = useMemo(() => {
    if (selectedUserId === null) return { name: "Tất cả", isMe: false, avatar: null };
    if (selectedUserId === currentUser?.id) {
      return { 
        name: "Bản thân", 
        isMe: true, 
        // @ts-ignore
        avatar: currentUser?.avatarUrl || currentUser?.avatar || `https://ui-avatars.com/api/?name=Me`
      };
    }
    const u = uniqueUsers.find(u => u.id === selectedUserId);
    return { name: u?.name?.split(' ').pop() || "User", isMe: false, avatar: u?.avatar };
  }, [selectedUserId, currentUser, uniqueUsers]);

  const otherUsers = uniqueUsers.filter(u => u.id !== currentUser?.id);

  // ĐÃ SỬA: Bổ sung kiểu dữ liệu mở rộng cho PostProps
  const openPostDetail = (post: PostProps & { journeyId?: string; videoUrl?: string }) => {
      const checkinObj: any = {
          id: post.id,
          userId: post.user?.id,
          user: post.user,
          journeyId: post.journeyId,
          imageUrl: post.image,
          videoUrl: post.videoUrl,
          caption: post.caption,
          status: post.status,
          emotion: post.emotion,
          activityName: post.activityName,
          locationName: post.locationName,
          createdAt: post.timestamp, // Tạm mượn trường này
          reactionCount: post.reactionCount,
          commentCount: post.commentCount,
          latestReactions: post.latestReactions
      };
      setSelectedPost(checkinObj as Checkin);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A] w-full relative font-quicksand transition-colors duration-500">
        
        {/* Sticky Header: Gồm Filter ở giữa và Nút Video góc phải */}
        <div className="sticky top-0 z-30 px-4 md:px-6 pt-4 pb-4 bg-gradient-to-b from-[#F4EBE1] via-[#F4EBE1]/95 to-transparent dark:from-[#121212] dark:via-[#121212]/95 pointer-events-none">
          <div className="grid grid-cols-3 items-center">
            
            <div></div>

            {/* Cột giữa: Combobox Filter viền nét đứt */}
            <div className="flex justify-center relative pointer-events-auto" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-5 py-2 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[24px] shadow-sm border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] hover:bg-white dark:hover:bg-[#2B2A29] active:scale-95 transition-all"
              >
                {selectedUserId === null ? (
                  <div className="w-6 h-6 rounded-full bg-[#F4EBE1] dark:bg-[#2B2A29] flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                  </div>
                ) : (
                  <img 
                    src={selectedUserDisplay.avatar} 
                    alt={selectedUserDisplay.name} 
                    className="w-6 h-6 rounded-full object-cover border border-[#E8E2D9] dark:border-[#3A3734]" 
                  />
                )}
                
                <span className="text-[0.95rem] font-black text-[#1A1A1A] dark:text-white truncate max-w-[120px] md:max-w-[160px]">
                  {selectedUserDisplay.name}
                </span>
                
                <ChevronDown className={cn("w-4 h-4 text-[#8A8580] dark:text-[#A09D9A] transition-transform duration-300", isDropdownOpen && 'rotate-180')} strokeWidth={3} />
              </button>

              {/* Menu thả xuống */}
              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] w-[240px] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-[#D6CFC7]/50 dark:border-[#3A3734] py-2 origin-top animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-1.5">
                      <button 
                        onClick={() => handleSelectUser(null)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] transition-colors group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[12px] bg-[#F4EBE1] dark:bg-[#3A3734] flex items-center justify-center group-hover:bg-white dark:group-hover:bg-[#1A1A1A] transition-colors">
                              <Globe className="w-4 h-4 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                            </div>
                            <span className={cn("text-[0.95rem]", selectedUserId === null ? "font-black text-[#1A1A1A] dark:text-white" : "font-bold text-[#8A8580] dark:text-[#A09D9A]")}>Tất cả</span>
                        </div>
                        {selectedUserId === null && <Check className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={3} />}
                      </button>

                      {currentUser && (
                      <button 
                          onClick={() => handleSelectUser(currentUser.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] transition-colors group active:scale-[0.98]"
                      >
                          <div className="flex items-center gap-3">
                            {/* @ts-ignore */}
                            <img src={currentUser.avatarUrl || currentUser.avatar || `https://ui-avatars.com/api/?name=Me`} className="w-9 h-9 rounded-[12px] object-cover border border-white dark:border-[#3A3734]" />
                            <span className={cn("text-[0.95rem]", selectedUserId === currentUser.id ? "font-black text-[#1A1A1A] dark:text-white" : "font-bold text-[#8A8580] dark:text-[#A09D9A]")}>Bản thân</span>
                          </div>
                          {selectedUserId === currentUser.id && <Check className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={3} />}
                      </button>
                      )}

                      {otherUsers.length > 0 && <div className="h-px bg-[#F4EBE1] dark:bg-[#3A3734] my-1 mx-3" />}

                      {otherUsers.map(user => (
                      <button 
                          key={user.id}
                          onClick={() => handleSelectUser(user.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] transition-colors group active:scale-[0.98]"
                      >
                          <div className="flex items-center gap-3 truncate">
                            <img src={user.avatar} className="w-9 h-9 rounded-[12px] object-cover border border-white dark:border-[#3A3734] shrink-0" />
                            <span className={cn("text-[0.95rem] truncate", selectedUserId === user.id ? "font-black text-[#1A1A1A] dark:text-white" : "font-bold text-[#8A8580] dark:text-[#A09D9A]")}>
                                {user.name}
                            </span>
                          </div>
                          {selectedUserId === user.id && <Check className="w-5 h-5 text-[#1A1A1A] dark:text-white shrink-0" strokeWidth={3} />}
                      </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cột phải: Nút Recap Máy Quay */}
            <div className="flex justify-end pointer-events-auto">
               <button
                  onClick={() => setShowGlobalRecap(true)}
                  className="w-12 h-12 bg-white dark:bg-[#1A1A1A] rounded-[18px] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] flex items-center justify-center hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] hover:scale-105 active:scale-95 transition-all shadow-sm text-purple-500 group"
                  title="Nấu thước phim tổng hợp"
               >
                  <Video size={22} strokeWidth={2.5} className="group-hover:fill-purple-500/20 transition-all" />
               </button>
            </div>

          </div>
        </div>

        {/* Vùng cuộn chứa Grid ảnh */}
        <div 
          className="flex-1 overflow-y-auto px-1.5 md:px-2 pt-1 pb-10 custom-scrollbar"
          onScroll={handleScroll}
        >
          {/* Lưới ảnh */}
          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            {filteredItems.map((item) => {
              if (item.type !== 'POST') return null;
              
              // ĐÃ SỬA: Ép kiểu mở rộng khi gọi map
              const post = item as PostProps & { journeyId?: string; videoUrl?: string };

              return (
                <div 
                  key={post.id} 
                  onClick={() => openPostDetail(post)} 
                  className="relative aspect-square bg-[#F4EBE1] dark:bg-[#2B2A29] overflow-hidden cursor-pointer group rounded-[16px] md:rounded-[24px] shadow-sm border border-white/50 dark:border-white/5"
                >
                  <img 
                    src={post.image} 
                    alt="Checkin" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {post.locationName && (
                    <div className="absolute bottom-2 right-2 pointer-events-none z-10">
                      <div className="bg-black/30 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-sm border border-white/10">
                        <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isLoading && (
            <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#1A1A1A] dark:border-white border-t-transparent"></div>
            </div>
          )}
          
          {!hasMore && items.length > 0 && (
            <div className="py-10 text-center text-[0.85rem] font-extrabold uppercase tracking-widest text-[#8A8580] dark:text-[#A09D9A] flex items-center justify-center gap-2 opacity-60">
              <Sparkles className="w-4 h-4" /> Bạn đã xem hết kỷ niệm
            </div>
          )}

          {filteredItems.length === 0 && !isLoading && (
             <div className="py-20 flex flex-col items-center justify-center text-[#8A8580] dark:text-[#A09D9A] opacity-70">
                <div className="w-16 h-16 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[20px] flex items-center justify-center mb-4 shadow-inner">
                    <Grid3X3 className="w-8 h-8" strokeWidth={2} />
                </div>
                <p className="text-[1.1rem] font-black text-[#1A1A1A] dark:text-white mb-1">Chưa có ảnh nào</p>
                <p className="text-[0.9rem] font-semibold text-[#8A8580] dark:text-[#A09D9A]">Người dùng này chưa đăng ảnh.</p>
             </div>
          )}
        </div>
      </div>

      {/* [THÊM MỚI] Modal xem chi tiết Locket */}
      {selectedPost && (
        <CheckinDetailModal 
          checkin={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

      {showGlobalRecap && (
        <GlobalRecapModal isOpen={true} onClose={() => setShowGlobalRecap(false)} />
      )}

    </MainLayout>
  );
};

export default JourneyGridFeedPage;