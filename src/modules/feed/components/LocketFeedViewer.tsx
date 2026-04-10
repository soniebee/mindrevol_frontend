import React, { useEffect, useState, useRef } from 'react';
import { JourneyPostCard } from './JourneyPostCard';
import { Send, SmilePlus, Activity } from 'lucide-react';
import { PostProps } from '../types';
import { cn } from '@/lib/utils';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTheme } from '@/contexts/ThemeContext';
// ĐÃ ĐỔI: Import chatService thay vì chỉ dùng feedService cho tin nhắn
import { feedService } from '../services/feed.service'; 
import { chatService } from '@/modules/chat/services/chat.service'; 
import { useAuth } from '@/modules/auth/store/AuthContext'; 
import { ActivityModal } from './ActivityModal'; 
import { toast } from 'react-hot-toast'; // Thêm toast để báo lỗi hoặc thành công (tuỳ chọn)

interface LocketFeedProps {
  posts: PostProps[];
}

const QUICK_REACTIONS = ['❤️', '🔥', '😂', '😮', '🥺'];

export const LocketFeedViewer: React.FC<LocketFeedProps> = ({ posts }) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth(); 

  const [activePostId, setActivePostId] = useState<string | null>(posts[0]?.id || null);
  
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const [headerTarget, setHeaderTarget] = useState<HTMLDivElement | null>(null);

  const activePost = posts.find(p => p.id === activePostId) || posts[0];

  const isOwner = activePost?.userId === currentUser?.id || activePost?.user?.id === currentUser?.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const postId = entry.target.getAttribute('data-post-id');
          if (postId) setActivePostId(postId);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.6 });

    const elements = document.querySelectorAll('.snap-post-container');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [posts]);

  // [CẬP NHẬT LẠI LOGIC GỬI TIN NHẮN]
  const handleSendMessage = async () => {
    if (!message.trim() || !activePost || !activePost.userId) return;
    setIsSending(true);
    try {
      // 1. Lấy ID của người sở hữu bài viết (người nhận tin nhắn)
      const targetUserId = activePost.userId || activePost.user?.id;
      
      // 2. Dùng chatService.sharePostToChat để gửi thẳng vào Chat 1v1
      if (targetUserId) {
         await chatService.sharePostToChat(
            targetUserId,       // ID người nhận
            activePost.id,      // ID bài viết
            activePost.image,   // Ảnh bài viết
            message             // Nội dung tin nhắn
         );
         setMessage('');
         toast.success("Đã gửi tin nhắn riêng");
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn", error);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  const handleReact = async (emoji: string) => {
    if (!activePostId) return;
    try {
      await feedService.toggleReaction(activePostId, emoji);
    } catch (error) {
      console.error("Lỗi thả cảm xúc", error);
    }
  };

  const handleSelectEmoji = (emojiData: any) => {
    handleReact(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (!posts || posts.length === 0) return null;

  return (
    <div className="relative w-full h-full bg-zinc-50 dark:bg-black flex flex-col font-sans transition-colors duration-300 overflow-hidden">
      
      {theme === 'dark' && activePost?.image && (
        <div 
          className="absolute top-0 left-0 w-full h-[60vh] z-0 pointer-events-none"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
          }}
        >
          <div 
            className="absolute inset-0 opacity-50 dark:opacity-30 blur-[60px] scale-[1.5] transform-gpu transition-all duration-700 ease-in-out origin-top"
            style={{
              backgroundImage: `url(${activePost.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </div>
      )}

      <div className="absolute top-0 left-0 w-full z-20 pt-16 md:pt-6 pb-2 pointer-events-none">
        <div ref={setHeaderTarget}></div>
      </div>

      <div className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10">
        {posts.map(post => (
          <div 
            key={post.id} 
            data-post-id={post.id} 
            className="snap-post-container snap-always snap-center h-full w-full flex flex-col items-center justify-center shrink-0 px-4 pt-24 pb-12 md:pb-20"
          >
            <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] relative transition-all duration-300">
              <JourneyPostCard post={post} isActive={activePostId === post.id} headerTarget={headerTarget} />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-zinc-50 via-zinc-50/90 dark:from-black dark:via-black/90 to-transparent pt-8 pb-2 md:pt-20 md:pb-6 px-4 z-30 pointer-events-none transition-all duration-300">
        <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] mx-auto flex flex-col gap-3 pointer-events-auto relative">
            
            {isOwner ? (
              <button 
                onClick={() => setIsActivityModalOpen(true)}
                className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-300 dark:border-white/20 rounded-full py-3 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] gap-2 text-zinc-900 dark:text-white font-bold active:scale-95 transition-transform"
              >
                <Activity className="w-5 h-5 text-blue-500" />
                Xem hoạt động bài viết
              </button>
            ) : (
              <>
                {showEmojiPicker && (
                  <div ref={pickerRef} className="absolute bottom-full left-0 mb-3 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-2xl rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10">
                    <EmojiPicker theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={handleSelectEmoji} lazyLoadEmojis={true} searchDisabled={true} skinTonesDisabled={true} height={350} />
                  </div>
                )}

                <div className="flex-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-300 dark:border-white/20 rounded-full pl-3 pr-2 py-2 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors gap-2">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                      <SmilePlus className="w-6 h-6" />
                  </button>

                  {/* Đã sửa placeholder cho rõ nghĩa */}
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Gửi tin nhắn riêng..." 
                    className="bg-transparent text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-white/60 outline-none w-full text-[15px] font-medium"
                    style={{ fontFamily: '"Jua", sans-serif' }}
                  />

                  {message.trim() ? (
                    <button 
                      onClick={handleSendMessage} 
                      disabled={isSending}
                      className="w-10 h-10 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0 shadow-sm"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0 border-l border-zinc-300 dark:border-white/20 pl-2">
                      {QUICK_REACTIONS.map(em => (
                        <button 
                          key={em} 
                          onClick={() => handleReact(em)} 
                          className="text-[20px] hover:scale-125 hover:-translate-y-1 transition-all active:scale-90 leading-none p-1"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

        </div>
      </div>
      
      {isActivityModalOpen && activePostId && (
        <ActivityModal 
          isOpen={isActivityModalOpen} 
          onClose={() => setIsActivityModalOpen(false)} 
          postId={activePostId} 
        />
      )}

    </div>
  );
};