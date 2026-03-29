import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Smile, Send, Mic, Trash2, AtSign } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useChatStore } from '../store/useChatStore';
import { useAuth } from '@/modules/auth/store/AuthContext'; // THÊM DÒNG NÀY ĐỂ LẤY USER ĐANG ĐĂNG NHẬP

interface ChatInputProps {
  onSend: (content: string, type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE', file?: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const { theme } = useTheme();
  const { user } = useAuth(); // Lấy thông tin mình để loại ra khỏi tag
  const { conversations, activeConversationId } = useChatStore();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useAudioRecorder();

  const mentionSuggestions = useMemo(() => {
    const activeConv = conversations.find(c => c.id === activeConversationId);
    if (!activeConv) return [];
    
    const isGroup = !!activeConv.boxId;
    const list = isGroup ? ((activeConv as any).members || []) : [activeConv.partner];

    return list.filter((u: any) => {
      if (!u) return false;
      
      // CHỈ LOẠI MÌNH RA NẾU LÀ CHAT NHÓM
      // Nếu là chat 1-1 thì phải cho phép tag partner chứ!
      if (isGroup && u.id === user?.id) return false;

      return u.fullname?.toLowerCase().includes(mentionSearch.toLowerCase());
    });
  }, [conversations, activeConversationId, mentionSearch, user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false);
        }
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="px-4 pb-6 pt-3 bg-white dark:bg-[#121212] border-t border-zinc-200 dark:border-white/5 shrink-0 z-30">
      <div className="max-w-4xl mx-auto relative">
        
        {/* MENU GỢI Ý MENTION */}
        {showMentionMenu && mentionSuggestions.length > 0 && (
          <div className="absolute bottom-full mb-4 left-0 w-64 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50">
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-zinc-400">
              <AtSign size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Nhắc tên bạn bè</span>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {mentionSuggestions.map((userItem: any) => (
                <button
                  key={userItem.id}
                  onClick={() => insertMention(userItem.fullname)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-lime-50 dark:hover:bg-lime-900/20 transition-colors text-left"
                >
                  <img src={userItem.avatarUrl || "https://placehold.co/32x32"} className="w-8 h-8 rounded-full border border-black/10" alt="" />
                  <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200" style={{ fontFamily: '"Jua", sans-serif' }}>
                    {userItem.fullname}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-[32px] p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)] transition-all focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {!isRecording && (
            <div className="relative" ref={emojiPickerRef}>
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-2xl border-2 border-black dark:border-white overflow-hidden">
                  <EmojiPicker theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={(e) => setText(p => p + e.emoji)} width={300} height={400} searchDisabled skinTonesDisabled />
                </div>
              )}
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={cn("p-3 rounded-full transition-transform active:scale-90", showEmojiPicker ? "text-orange-500 bg-orange-100" : "text-zinc-400 hover:text-orange-500 hover:bg-orange-50")}>
                <Smile className="w-6 h-6" />
              </button>
            </div>
          )}

          {isRecording ? (
            <div className="flex-1 flex items-center justify-between py-[10px] px-4 mx-2 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <span className="text-red-500 font-medium font-['Jua'] text-lg tracking-wider">{formatTime(recordingTime)}</span>
              </div>
              <button onClick={cancelRecording} className="text-zinc-400 hover:text-red-500 transition-colors p-1"><Trash2 size={22} /></button>
            </div>
          ) : (
            <div className="flex-1 py-3 px-2">
              <input 
                ref={inputRef}
                value={text} 
                onChange={handleInputChange} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Aa..." 
                className="w-full bg-transparent border-none outline-none text-black dark:text-white placeholder:text-zinc-400 text-lg"
                style={{ fontFamily: '"Jua", sans-serif' }}
              />
            </div>
          )}

          {!text.trim() && !isRecording ? (
            <button onMouseDown={startRecording} onMouseUp={stopRecording} className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"><Mic size={20} /></button>
          ) : (
            <button onClick={handleSend} className="w-12 h-12 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black shadow-md"><Send size={20} className="ml-1" /></button>
          )}
        </div>
      </div>
    </div>
  );
};