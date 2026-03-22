import React, { useState, useRef, useEffect } from 'react';
import { Smile, Send } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    setShowEmojiPicker(false);
  };

  return (
    <div className="px-4 pb-6 pt-3 bg-white dark:bg-[#121212] border-t border-zinc-200 dark:border-white/5 shrink-0 z-30 transition-colors duration-300">
      
      {/* Khung Input Neo-Brutalism */}
      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-[32px] p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)] relative transition-all focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus-within:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)]">
        
        {/* Nút Emoji */}
        <div className="relative" ref={emojiPickerRef}>
            {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-2xl border-2 border-black dark:border-white overflow-hidden">
                    <EmojiPicker 
                      theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} 
                      onEmojiClick={(e) => setText(p => p + e.emoji)} 
                      width={300} 
                      height={400} 
                      searchDisabled 
                      skinTonesDisabled 
                    />
                </div>
            )}
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              className={cn(
                "p-3 rounded-full transition-transform active:scale-90", 
                showEmojiPicker ? "text-orange-500 bg-orange-100 dark:bg-orange-500/20" : "text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
              )}
            >
              <Smile className="w-6 h-6" />
            </button>
        </div>

        {/* Nhập text */}
        <div className="flex-1 py-3 px-2">
          <input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder="Aa..." 
            className="w-full bg-transparent border-none outline-none text-black dark:text-white placeholder:text-zinc-400 text-lg leading-relaxed" 
            style={{ fontFamily: '"Jua", sans-serif' }} 
          />
        </div>

        {/* Nút Gửi */}
        <button 
          onClick={handleSend} 
          disabled={!text.trim()} 
          className={cn(
            "w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center mb-[2px]", 
            text.trim() ? "bg-black text-white dark:bg-white dark:text-black hover:scale-105 shadow-md" : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
          )}
        >
          <Send className={cn("w-5 h-5", text.trim() && "ml-1")} />
        </button>

      </div>
    </div>
  );
};