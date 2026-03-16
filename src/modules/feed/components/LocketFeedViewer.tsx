import React, { useEffect, useState, useRef } from 'react';
import { JourneyPostCard } from './JourneyPostCard';
import { Send, SmilePlus } from 'lucide-react';
import { PostProps } from '../types';
import { cn } from '@/lib/utils';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTheme } from '@/contexts/ThemeContext';
import { feedService } from '../services/feed.service';

interface LocketFeedProps {
  posts: PostProps[];
}

const QUICK_REACTIONS = ['❤️', '🔥', '😂', '😮', '🥺'];

export const LocketFeedViewer: React.FC<LocketFeedProps> = ({ posts }) => {
  const { theme } = useTheme();
  const [activePostId, setActivePostId] = useState<string | null>(posts[0]?.id || null);
  
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const [headerTarget, setHeaderTarget] = useState<HTMLDivElement | null>(null);

  // Đóng bảng Emoji khi bấm ra ngoài
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

  const handleSendMessage = async () => {
    if (!message.trim() || !activePostId) return;
    setIsSending(true);
    try {
      await feedService.postComment(activePostId, message);
      setMessage('');
    } catch (error) {
      console.error("Lỗi gửi tin nhắn", error);
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
    <div className="relative w-full h-full bg-zinc-50 dark:bg-black flex flex-col font-sans transition-colors duration-300">
      
      {/* [ĐÃ SỬA] VÙNG PORTAL CỐ ĐỊNH HEADER */}
      {/* Thêm nền bg-zinc-50 dark:bg-black để làm một "bức tường" che khuất ảnh khi cuộn qua đường hr */}
      <div 
        className="absolute top-0 left-0 w-full z-[50] bg-zinc-50 dark:bg-black pt-16 md:pt-6 pb-2 pointer-events-none transition-colors duration-300"
      >
        <div ref={setHeaderTarget}></div>
      </div>

      {/* KHUNG CUỘN */}
      <div className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10">
        {posts.map(post => (
          <div 
            key={post.id} 
            data-post-id={post.id} 
            // Thêm pt-24 để bức ảnh lùi xuống một chút, không bị cấn vào cái Header
            className="snap-post-container snap-always snap-center h-full w-full flex flex-col items-center justify-center shrink-0 px-4 pt-24 pb-20"
          >
            <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] relative transition-all duration-300">
              <JourneyPostCard post={post} isActive={activePostId === post.id} headerTarget={headerTarget} />
            </div>
          </div>
        ))}
      </div>

      {/* THANH NHẬP LIỆU BÁM ĐÁY */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-zinc-50 via-zinc-50/90 dark:from-black dark:via-black/90 to-transparent pt-20 pb-4 md:pb-6 px-4 z-[60] pointer-events-none transition-all duration-300">
        <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] mx-auto flex flex-col gap-3 pointer-events-auto relative">
            
            {/* Bảng Emoji Picker */}
            {showEmojiPicker && (
              <div ref={pickerRef} className="absolute bottom-full left-0 mb-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-2xl rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10">
                <EmojiPicker theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={handleSelectEmoji} lazyLoadEmojis={true} searchDisabled={true} skinTonesDisabled={true} height={350} />
              </div>
            )}

            {/* Input */}
            <div className="flex-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-300 dark:border-white/20 rounded-full pl-3 pr-2 py-2 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors gap-2">
              
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                  <SmilePlus className="w-6 h-6" />
              </button>

              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Viết bình luận..."
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
        </div>
      </div>
      
    </div>
  );
};