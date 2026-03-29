import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Smile, Send, Mic, Trash2, AtSign } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useChatStore } from '../store/useChatStore';
import { useAuth } from '@/modules/auth/store/AuthContext'; // 1. THÊM DÒNG NÀY

interface Props {
  onSend: (content: string, type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE', file?: File) => void;
}

export const MobileChatInput: React.FC<Props> = ({ onSend }) => {
  const { user } = useAuth(); // 2. LẤY USER ĐANG ĐĂNG NHẬP Ở ĐÂY
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { conversations, activeConversationId } = useChatStore();

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useAudioRecorder();

  // Logic gợi ý bạn bè để mention
  const mentionSuggestions = useMemo(() => {
    const activeConv = conversations.find(c => c.id === activeConversationId);
    if (!activeConv) return [];
    
    const isGroup = !!activeConv.boxId;
    const list = isGroup ? ((activeConv as any).members || []) : [activeConv.partner];

    return list.filter((u: any) => {
      if (!u) return false;
      
      // 3. LOGIC CHUẨN: Chỉ ẩn chính mình nếu là trong nhóm (Box)
      if (isGroup && String(u.id) === String(user?.id)) return false;

      return u.fullname?.toLowerCase().includes(mentionSearch.toLowerCase());
    });
  }, [conversations, activeConversationId, mentionSearch, user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    const words = value.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentionMenu(true);
      setMentionSearch(lastWord.slice(1));
    } else {
      setShowMentionMenu(false);
    }
  };

  const insertMention = (username: string) => {
    const words = text.split(' ');
    words[words.length - 1] = `@${username} `;
    setText(words.join(' '));
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text, 'TEXT');
    setText('');
    setShowEmojiPicker(false);
    setShowMentionMenu(false);
  };

  const handleMicMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      startRecording();
  };

  const handleMicMouseUp = async (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isRecording) return;
      const audioFile = await stopRecording();
      if (audioFile) {
          const tempUrl = URL.createObjectURL(audioFile);
          onSend(tempUrl, 'VOICE', audioFile);
      }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="px-4 pb-6 pt-3 bg-white border-t border-zinc-200 shrink-0 z-30 shadow-[0px_-4px_10px_rgba(0,0,0,0.02)] relative">
      
      {showMentionMenu && mentionSuggestions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border-2 border-black rounded-2xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2">
          <div className="p-2 bg-zinc-50 border-b-2 border-black flex items-center gap-2">
            <AtSign size={14} className="text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500" style={{ fontFamily: '"Jua", sans-serif' }}>Nhắc tên</span>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {mentionSuggestions.map((uItem: any) => (
              <button
                key={uItem.id}
                onClick={() => insertMention(uItem.fullname)}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 active:bg-lime-50 border-b border-zinc-100 last:border-0"
              >
                <img src={uItem.avatarUrl || "https://placehold.co/32x32"} className="w-8 h-8 rounded-full border border-black/10" alt="" />
                <span className="font-bold text-black" style={{ fontFamily: '"Jua", sans-serif' }}>{uItem.fullname}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white border-2 border-black rounded-[32px] p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative transition-all focus-within:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:-translate-y-[2px]">
        {isRecording ? (
            <div className="flex-1 flex items-center justify-between py-[10px] px-4 mx-2 bg-red-50 rounded-full border border-red-200">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-red-500 font-medium font-['Jua'] text-lg tracking-wider">{formatTime(recordingTime)}</span>
                </div>
                <button onClick={cancelRecording} className="text-zinc-400 hover:text-red-500 transition-colors p-1" title="Hủy ghi âm">
                    <Trash2 className="w-[22px] h-[22px]" />
                </button>
            </div>
        ) : (
            <>
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
                  <input ref={inputRef} value={text} onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Aa..." className="w-full bg-transparent border-none outline-none text-black placeholder:text-zinc-400 text-lg leading-relaxed" style={{ fontFamily: '"Jua", sans-serif' }} />
                </div>
            </>
        )}

        {!text.trim() && !isRecording ? (
            <button onMouseDown={handleMicMouseDown} onTouchStart={handleMicMouseDown} onMouseUp={handleMicMouseUp} onTouchEnd={handleMicMouseUp} onMouseLeave={isRecording ? cancelRecording : undefined} className="w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center mb-[2px] bg-zinc-100 text-black hover:bg-zinc-200 cursor-pointer shadow-sm">
              <Mic className="w-5 h-5" />
            </button>
        ) : (
            <button onClick={isRecording ? undefined : handleSend} onMouseUp={isRecording ? handleMicMouseUp : undefined} onTouchEnd={isRecording ? handleMicMouseUp : undefined} className={cn("w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center mb-[2px]", isRecording ? "bg-red-500 text-white shadow-md animate-pulse" : "bg-black text-white hover:scale-105 shadow-md")}>
              <Send className={cn("w-5 h-5", "ml-1")} />
            </button>
        )}
      </div>
    </div>
  );
};