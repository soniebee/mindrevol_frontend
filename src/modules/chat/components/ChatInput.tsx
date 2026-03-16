import React, { useState, useRef, useEffect } from 'react';
import { Smile, Send, Mic, Trash2 } from 'lucide-react'; // Đã xóa import Image
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface ChatInputProps {
  // Sửa chỗ này: Thay 'AUDIO' bằng 'VOICE'
  onSend: (content: string, type?: 'TEXT' | 'IMAGE' | 'VOICE', file?: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useAudioRecorder();

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
    onSend(text, 'TEXT');
    setText('');
    setShowEmojiPicker(false);
  };

  const handleSendAudio = async () => {
    const audioFile = await stopRecording();
    if (audioFile) {
       // SỬA DÒNG NÀY THÀNH 'VOICE'
       onSend('[Voice Message]', 'VOICE', audioFile); 
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent shrink-0 z-30 font-['Jua'] relative">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-neutral-100 border border-neutral-200 rounded-[26px] p-1.5 shadow-sm relative">
        
        {isRecording ? (
            <div className="flex-1 flex items-center justify-between px-3 h-11">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-500 font-mono font-medium">{formatTime(recordingTime)}</span>
                  <span className="text-neutral-500 text-sm ml-2 hidden sm:inline">Đang ghi âm...</span>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={cancelRecording}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-200 rounded-full transition-colors"
                    title="Hủy ghi âm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSendAudio}
                    className="w-9 h-9 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                    title="Gửi ghi âm"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
               </div>
            </div>
        ) : (
            <>
                <div className="relative" ref={emojiPickerRef}>
                    {showEmojiPicker && (
                        <div className="absolute bottom-14 left-0 z-50 shadow-xl rounded-2xl border border-neutral-200 overflow-hidden">
                            <EmojiPicker 
                              theme={Theme.LIGHT} 
                              onEmojiClick={onEmojiClick}
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
                          "p-2.5 transition-all rounded-full active:scale-90",
                          showEmojiPicker 
                            ? "text-yellow-600 bg-yellow-100" 
                            : "text-neutral-400 hover:text-yellow-600 hover:bg-yellow-50"
                      )}
                      title="Biểu cảm"
                    >
                      <Smile className="w-6 h-6" />
                    </button>
                </div>

                {/* Đã xóa nút Image ở đây */}

                {/* Nút Ghi Âm (Mic) */}
                <button 
                  onClick={startRecording}
                  className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-full active:scale-90"
                  title="Ghi âm"
                >
                  <Mic className="w-6 h-6" />
                </button>

                <div className="flex-1 py-3 px-1">
                  <input 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Gửi tin nhắn..."
                      className="w-full bg-transparent border-none outline-none text-black placeholder:text-neutral-400 text-[16px] font-normal leading-relaxed"
                  />
                </div>
                
                <button 
                  onClick={() => handleSend()}
                  disabled={!text.trim()}
                  className={cn(
                      "w-11 h-11 rounded-full transition-all duration-300 flex items-center justify-center mb-[1px]",
                      text.trim() 
                      ? "bg-black text-white hover:bg-zinc-800 hover:scale-105 shadow-md" 
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  )}
                >
                  <Send className={cn("w-5 h-5", text.trim() && "ml-0.5")} />
                </button>
            </>
        )}
      </div>
    </div>
  );
};