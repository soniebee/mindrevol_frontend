import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Send, Smile, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { http } from '@/lib/http';
import { feedService } from '../services/feed.service';
import { useAuth } from '@/modules/auth/store/AuthContext';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'; 
import { useTheme } from '@/contexts/ThemeContext'; // [THÊM MỚI] Để bắt theme Sáng/Tối

interface PostCommentsProps {
  postId: string;
  onClose: () => void; 
}

const parseContent = (content?: string | null) => {
  if (!content) return "";
  try {
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      const parsed = JSON.parse(content);
      return parsed.content || content;
    }
  } catch (e) {
    // Ignore error
  }
  return content;
};

export const PostComments = ({ postId, onClose }: PostCommentsProps) => {
  const { user } = useAuth();
  const { theme } = useTheme(); // [THÊM MỚI] Lấy theme hiện tại
  
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await http.get(`/checkins/${postId}/comments`);
        setComments(res.data.data?.content || res.data?.content || res.data.data || []); 
      } catch (error) {
        console.error("Lỗi tải bình luận:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    const currentContent = content;
    setContent('');
    setShowEmojiPicker(false);
    setIsSubmitting(true);

    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      userFullName: user?.fullname || "Tôi",
      userAvatar: user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullname || 'U'}&background=random`,
      content: currentContent,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [tempComment, ...prev]);

    try {
      const res = await feedService.postComment(postId, currentContent);
      const realComment = res.data?.data || res.data;
      if (realComment && realComment.id) {
        setComments(prev => prev.map(c => c.id === tempId ? realComment : c));
      }
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      setComments(prev => prev.filter(c => c.id !== tempId));
      setContent(currentContent);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // [ĐÃ SỬA] Nền tổng thể của khu vực bình luận
    <div className="w-full bg-zinc-50/80 dark:bg-[#121212]/50 border-t border-border p-3 animate-in fade-in slide-in-from-top-2 duration-300">
      
      {/* 1. Danh sách bình luận */}
      <div className="max-h-[250px] overflow-y-auto pr-1 flex flex-col gap-3 mb-3 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-4">
             <Loader2 className="w-5 h-5 text-muted animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted">
             Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        ) : (
          comments.map((cmt) => (
            <div key={cmt.id} className="flex gap-2.5 items-start">
              <Avatar className="w-7 h-7 border border-border shrink-0 mt-0.5 bg-surface">
                <AvatarImage src={cmt.userAvatar} />
                <AvatarFallback className="text-[10px] text-foreground">
                   {cmt.userFullName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* [ĐÃ SỬA] Nền bong bóng bình luận */}
              <div className="flex flex-col bg-white dark:bg-zinc-800/40 shadow-sm dark:shadow-none rounded-2xl rounded-tl-none px-3 py-2 text-sm max-w-[85%] border border-border">
                <span className="font-semibold text-foreground text-[13px]">{cmt.userFullName}</span>
                <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5 text-[13px]">
                   {parseContent(cmt.content)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. Khung nhập bình luận */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 mt-2 pt-2 border-t border-border">
        
        <Avatar className="w-8 h-8 border border-border shrink-0 bg-surface">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback className="text-foreground text-xs">
            {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* [ĐÃ SỬA] Nền input bình luận */}
        <div className="flex-1 flex items-center bg-white dark:bg-zinc-800/50 shadow-sm dark:shadow-none border border-border rounded-full pr-1 pl-4 transition-colors focus-within:border-primary relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Thêm bình luận..."
            className="flex-1 bg-transparent border-none text-[13px] text-foreground placeholder:text-muted focus:outline-none py-1.5 min-w-0"
          />
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-muted hover:text-yellow-500 transition-colors shrink-0"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 transition-colors shrink-0"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 -ml-0.5" />}
        </button>

        {showEmojiPicker && (
          <div ref={pickerRef} className="absolute bottom-full right-8 mb-2 z-50 shadow-2xl rounded-xl">
            <EmojiPicker 
              theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} // [ĐÃ SỬA] Emoji picker tự nhận diện theme
              onEmojiClick={handleEmojiClick} 
              lazyLoadEmojis={true} 
              height={320} 
              searchDisabled={true} 
              skinTonesDisabled={true} 
            />
          </div>
        )}
      </form>

      {/* 3. Nút thu gọn */}
      <button 
        onClick={onClose} 
        className="flex items-center justify-center gap-1.5 w-full mt-3 pt-3 border-t border-border text-xs font-medium text-muted hover:text-foreground transition-colors"
      >
        <ChevronUp className="w-4 h-4" />
        Thu gọn bình luận
      </button>

    </div>
  );
};