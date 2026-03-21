import React, { useState, useRef, useEffect } from 'react';
import { Smile, Send } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';

interface Props {
  onSend: (text: string) => void;
}

export const MobileChatInput: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
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
    <div className="px-4 pb-6 pt-3 bg-white border-t border-zinc-200 shrink-0 z-30 shadow-[0px_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white border-2 border-black rounded-[32px] p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative transition-all focus-within:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:-translate-y-[2px]">
        <div className="relative" ref={emojiPickerRef}>
            {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-2xl border-2 border-black overflow-hidden">
                    <EmojiPicker theme={Theme.LIGHT} onEmojiClick={(e) => setText(p => p + e.emoji)} width={300} height={400} searchDisabled skinTonesDisabled />
                </div>
            )}
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={cn("p-3 rounded-full transition-transform active:scale-90", showEmojiPicker ? "text-orange-500 bg-orange-100" : "text-zinc-400 hover:text-orange-500 hover:bg-orange-50")}>
              <Smile className="w-6 h-6" />
            </button>
        </div>
        <div className="flex-1 py-3 px-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Aa..." className="w-full bg-transparent border-none outline-none text-black placeholder:text-zinc-400 text-lg leading-relaxed" style={{ fontFamily: '"Jua", sans-serif' }} />
        </div>
        <button onClick={handleSend} disabled={!text.trim()} className={cn("w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center mb-[2px]", text.trim() ? "bg-black text-white hover:scale-105 shadow-md" : "bg-zinc-200 text-zinc-400 cursor-not-allowed")}>
          <Send className={cn("w-5 h-5", text.trim() && "ml-1")} />
        </button>
      </div>
    </div>
  );
};