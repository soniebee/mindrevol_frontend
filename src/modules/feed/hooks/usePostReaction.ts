import { useState, useRef, useEffect } from 'react';
import { feedService } from '../services/feed.service';
import { EmojiClickData } from 'emoji-picker-react';

export const usePostReaction = (postId: string, initialCount: number, initialIsLiked: boolean = false) => {
  const [localReactionCount, setLocalReactionCount] = useState(initialCount);
  const [hasReacted, setHasReacted] = useState(initialIsLiked);
  const [myCurrentEmoji, setMyCurrentEmoji] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const pickerRef = useRef<HTMLDivElement>(null);

  // Logic Click Outside để đóng bảng Emoji
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

  // Logic Optimistic UI (Cập nhật giao diện trước, gọi API sau)
  const handleSelectEmoji = async (emojiData: EmojiClickData) => {
    if (isReacting) return;
    
    setShowEmojiPicker(false);
    setIsReacting(true);

    const selectedEmoji = emojiData.emoji;
    const prevCount = localReactionCount;
    const prevHasReacted = hasReacted;
    const prevMyEmoji = myCurrentEmoji;

    // Xử lý logic đếm số trên UI
    if (!hasReacted) {
      setLocalReactionCount(prev => prev + 1);
      setHasReacted(true);
      setMyCurrentEmoji(selectedEmoji);
    } else {
      if (myCurrentEmoji === selectedEmoji) {
        setLocalReactionCount(prev => prev - 1); // Hủy thả
        setHasReacted(false);
        setMyCurrentEmoji(null);
      } else {
        setMyCurrentEmoji(selectedEmoji); // Đổi icon
      }
    }

    try {
      await feedService.toggleReaction(postId, selectedEmoji);
    } catch (error) {
      console.error("Lỗi thả cảm xúc:", error);
      // Rollback nếu lỗi
      setLocalReactionCount(prevCount);
      setHasReacted(prevHasReacted);
      setMyCurrentEmoji(prevMyEmoji);
    } finally {
      setIsReacting(false);
    }
  };

  const toggleEmojiPicker = () => setShowEmojiPicker(prev => !prev);

  return {
    localReactionCount,
    showEmojiPicker,
    pickerRef,
    handleSelectEmoji,
    toggleEmojiPicker
  };
};