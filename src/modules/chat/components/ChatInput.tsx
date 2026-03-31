import React, { useState, useRef, useEffect } from 'react';
// Gộp tất cả các icon từ lucide-react vào 1 dòng duy nhất
import { Smile, Send, Mic, Trash2, Paperclip, X, Reply } from 'lucide-react'; 
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useChatStore } from '../store/useChatStore';
import { socket } from '@/lib/socket';
import { useAuth } from '@/modules/auth/store/AuthContext';

interface ChatInputProps {
  onSend: (content: string, type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE', file?: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useAuth(); // Để lấy currentUserId
  const { activeConversationId, conversations } = useChatStore(); 
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook Ghi âm
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const { replyingTo, setReplyingTo } = useChatStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo preview nếu là hình ảnh
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null); // File khác không preview
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (!text.trim() && !selectedFile) return;
    
    if (selectedFile) {
       // Nếu có file, mượn tạm text để gửi kèm (nếu backend hỗ trợ) hoặc tạo preview
       const type = selectedFile.type.startsWith('image/') ? 'IMAGE' : 
                    selectedFile.type.startsWith('video/') ? 'VIDEO' : 'FILE';
       const tempUrl = previewUrl || text || "File đính kèm"; // Gửi tạm URL để UI hiện nhanh
       onSend(tempUrl, type, selectedFile);
       removeFile();
    } else {
       onSend(text, 'TEXT');
    }
    
    setText('');
    setShowEmojiPicker(false);
  };

  // --- Xử lý sự kiện nhấn giữ nút Mic ---
  const handleMicMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if(selectedFile) return; // Đang chọn file thì k cho ghi âm
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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);

      if (!activeConversationId || !user) return;

      // 2. Tự động moi ID của đối phương ra từ danh sách cuộc trò chuyện
      const currentConv = conversations.find(c => c.id === activeConversationId);
      const receiverId = currentConv?.partner?.id;

      // Nếu không có receiverId (ví dụ chat nhóm) thì tạm thời không gửi typing 1-1
      if (!receiverId) return;

      // 3. Nhét thêm receiverId vào lúc gửi
      socket.send(`/app/chat/typing`, {
          conversationId: activeConversationId,
          senderId: user.id,
          receiverId: receiverId, // <--- THÊM CÁI NÀY LÀ BACKEND NÓ NHẬN ĐƯỢC NGAY
          isTyping: true
      });

      if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
          socket.send(`/app/chat/typing`, {
              conversationId: activeConversationId,
              senderId: user.id,
              receiverId: receiverId, // <--- GỬI KÈM LÚC TẮT LUÔN
              isTyping: false
          });
      }, 2500);
  };

  return (
    <div className="w-full shrink-0 px-4 pb-6 pt-3 bg-white dark:bg-[#121212] border-t border-zinc-200 dark:border-white/5 shrink-0 z-30 transition-colors duration-300">
      
      {/* [THÊM MỚI] Khu vực hiển thị tin nhắn đang Reply */}
      {replyingTo && (
         <div className="w-full mx-auto flex items-center justify-between mb-2 p-2.5 bg-zinc-100 dark:bg-zinc-800/80 border-l-[4px] border-black dark:border-white rounded-r-xl shadow-sm relative transition-all">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
                <Reply className="w-4 h-4 text-zinc-500 shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                   <span className="text-xs font-bold text-black dark:text-white truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                       Đang trả lời {replyingTo.senderId /* Chỗ này nếu có thông tin User thì render tên, không thì tạm để Đang trả lời */}
                   </span>
                   <span className="text-sm text-zinc-600 dark:text-zinc-300 truncate" style={{ fontFamily: '"Jua", sans-serif' }}>
                       {replyingTo.type === 'IMAGE' ? '[Hình ảnh]' : replyingTo.type === 'VOICE' ? '[Ghi âm]' : replyingTo.content}
                   </span>
                </div>
            </div>
            <button 
                onClick={() => setReplyingTo(null)} 
                className="p-1.5 ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
            >
                <X className="w-4 h-4 text-zinc-500" />
            </button>
         </div>
      )}

      {/* Khung Input Neo-Brutalism - SỬA LẠI ĐỘ RỘNG THÀNH w-full CHỨ KHÔNG DÙNG MAX-W */}
      <div className="w-full mx-auto flex items-end gap-2 sm:gap-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-[32px] p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)] relative transition-all focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus-within:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)]">

        {/* Nút Emoji */}
        {!isRecording && (
          <div className="relative shrink-0" ref={emojiPickerRef}>
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
        )}

        {/* Khu vực trung tâm */}
        {isRecording ? (
            <div className="flex-1 flex items-center justify-between py-[10px] px-4 mx-2 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-200 dark:border-red-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-red-500 font-medium font-['Jua'] text-lg tracking-wider">
                        {formatTime(recordingTime)}
                    </span>
                </div>
                <button onClick={cancelRecording} className="text-zinc-400 hover:text-red-500 transition-colors p-1" title="Hủy ghi âm">
                    <Trash2 className="w-[22px] h-[22px]" />
                </button>
            </div>
        ) : (
            <div className="flex-1 min-w-0 py-3 px-2">
              <input 
                value={text} 
                onChange={handleTextChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Gửi tin nhắn..." 
                className="w-full bg-transparent border-none outline-none text-black dark:text-white placeholder:text-zinc-400 text-lg leading-relaxed truncate" 
                style={{ fontFamily: '"Jua", sans-serif' }} 
              />
            </div>
        )}

        {/* Nút Gửi / Nút Mic */}
        {(!text.trim() && !selectedFile && !isRecording) ? (
            <button
              type="button"
              onMouseDown={handleMicMouseDown}
              onTouchStart={handleMicMouseDown}
              onMouseUp={handleMicMouseUp}
              onTouchEnd={handleMicMouseUp}
              onMouseLeave={isRecording ? cancelRecording : undefined} 
              className="w-12 h-12 shrink-0 rounded-full transition-all duration-300 flex items-center justify-center mb-[2px] bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer shadow-sm"
              title="Giữ để ghi âm"
            >
              <Mic className="w-5 h-5" />
            </button>
        ) : (
            <button 
              onClick={isRecording ? undefined : handleSend} 
              onMouseUp={isRecording ? handleMicMouseUp : undefined}
              onTouchEnd={isRecording ? handleMicMouseUp : undefined}
              className={cn(
                "w-12 h-12 shrink-0 rounded-full transition-all duration-300 flex items-center justify-center mb-[2px]", 
                isRecording 
                   ? "bg-red-500 text-white shadow-md animate-pulse" 
                   : "bg-black text-white dark:bg-white dark:text-black hover:scale-105 shadow-md"
              )}
            >
              <Send className={cn("w-5 h-5", "ml-1")} />
            </button>
        )}

      </div>
    </div>
  );
};