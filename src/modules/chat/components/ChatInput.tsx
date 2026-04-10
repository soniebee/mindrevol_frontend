// File: src/modules/chat/components/ChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Trash2, X, Reply, Sticker, Smile, Edit2 } from 'lucide-react'; // Đã thêm icon Smile
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useChatStore } from '../store/useChatStore';
import { socket } from '@/lib/socket';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { GifPicker } from './GifPicker';
import { StickerPicker } from './StickerPicker'; // [IMPORT STICKER PICKER]

interface ChatInputProps {
  onSend: (content: string, type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE', file?: File) => void;
  onEdit?: (messageId: string, content: string) => void; 
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onEdit }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  
  // State quản lý 3 bảng chọn
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false); // [STATE STICKER]
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { user } = useAuth();
  const { activeConversationId, replyingTo, setReplyingTo, editingMessage, setEditingMessage } = useChatStore(); 
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useAudioRecorder();

  useEffect(() => {
      if (editingMessage) {
          setText(editingMessage.content);
          setReplyingTo(null);
      }
  }, [editingMessage]);

  const handleSend = () => {
    if (!text.trim() && !selectedFile) return;

    if (editingMessage && onEdit) {
        onEdit(editingMessage.id, text);
        setEditingMessage(null);
    } else {
        if (selectedFile) {
           const type = selectedFile.type.startsWith('image/') ? 'IMAGE' : 'FILE';
           onSend(text || "File đính kèm", type, selectedFile);
           setSelectedFile(null);
        } else {
           onSend(text, 'TEXT');
        }
    }
    
    setText('');
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setShowStickerPicker(false);
  };

  const handleSendGif = (gifUrl: string) => {
    onSend(gifUrl, 'IMAGE');
    setShowGifPicker(false);
  };

  // [HÀM MỚI] Xử lý gửi Sticker
  const handleSendSticker = (stickerUrl: string) => {
    onSend(stickerUrl, 'IMAGE'); // Vẫn gửi dưới dạng ảnh
    setShowStickerPicker(false);
  };

  // Các hàm bật/tắt để đảm bảo chỉ 1 bảng được mở
  const toggleEmoji = () => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); setShowStickerPicker(false); };
  const toggleGif = () => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); setShowStickerPicker(false); };
  const toggleSticker = () => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); setShowGifPicker(false); };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
      if (!activeConversationId || !user) return;

      socket.send(`/app/chat/typing`, { conversationId: activeConversationId, senderId: user.id, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
          socket.send(`/app/chat/typing`, { conversationId: activeConversationId, senderId: user.id, isTyping: false });
      }, 2500);
  };

  return (
    <div className="absolute bottom-5 left-0 right-0 px-4 sm:px-10 z-20 pointer-events-none flex flex-col items-center">
      
      {/* Banner Đang trả lời */}
      {replyingTo && !editingMessage && (
         <div className="w-full max-w-3xl flex items-center justify-between mb-2 p-3 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-[#EAF3EA] dark:border-zinc-700 rounded-2xl shadow-sm pointer-events-auto">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="w-8 h-8 rounded-full bg-[#F4FAF6] flex items-center justify-center"><Reply className="w-4 h-4 text-[#75B085]" /></div>
                <div className="flex flex-col min-w-0 flex-1">
                   <span className="text-[13px] font-bold text-zinc-800 dark:text-white truncate" style={{ fontFamily: '"Nunito", sans-serif' }}>Đang trả lời tin nhắn</span>
                   <span className="text-[14px] font-semibold text-zinc-500 dark:text-zinc-400 truncate" style={{ fontFamily: '"Nunito", sans-serif' }}>
                       {replyingTo.type === 'IMAGE' ? '[Hình ảnh]' : replyingTo.type === 'VOICE' ? '[Ghi âm]' : replyingTo.content}
                   </span>
                </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full"><X className="w-4 h-4" /></button>
         </div>
      )}

      {/* Banner Đang chỉnh sửa */}
      {editingMessage && (
         <div className="w-full max-w-3xl flex items-center justify-between mb-2 p-3 bg-blue-50/95 dark:bg-blue-900/20 backdrop-blur-md border border-blue-100 dark:border-blue-800/30 rounded-2xl shadow-sm pointer-events-auto">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"><Edit2 className="w-4 h-4 text-blue-500" /></div>
                <div className="flex flex-col min-w-0 flex-1">
                   <span className="text-[13px] font-bold text-blue-800 dark:text-blue-300 truncate" style={{ fontFamily: '"Nunito", sans-serif' }}>Đang chỉnh sửa tin nhắn</span>
                </div>
            </div>
            <button onClick={() => { setEditingMessage(null); setText(''); }} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full"><X className="w-4 h-4 text-blue-500" /></button>
         </div>
      )}

      <div className="w-full max-w-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-[32px] p-2 shadow-[0_8px_24px_rgba(117,176,133,0.08)] flex items-end gap-2 pointer-events-auto border border-white/60 dark:border-zinc-700 focus-within:ring-4 focus-within:ring-[#D5E8D8]/50 transition-all">

        {!isRecording && (
          <div className="relative shrink-0 flex gap-1" ref={emojiPickerRef}>
              
              {/* CÁC BẢNG POPUP */}
              {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-[#D5E8D8] dark:border-zinc-700">
                      <EmojiPicker theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={(e) => setText(p => p + e.emoji)} width={300} height={400} />
                  </div>
              )}
              {showGifPicker && (
                  <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-[#D5E8D8] dark:border-zinc-700">
                      <GifPicker onSelect={handleSendGif} />
                  </div>
              )}
              {showStickerPicker && (
                  <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-[#D5E8D8] dark:border-zinc-700">
                      <StickerPicker onSelect={handleSendSticker} />
                  </div>
              )}

              {/* NÚT EMOJI */}
              <button onClick={toggleEmoji} className="w-10 h-10 rounded-full bg-[#F4FAF6] dark:bg-zinc-800 text-[#75B085] dark:text-zinc-400 hover:bg-[#D5E8D8] dark:hover:bg-zinc-700 flex items-center justify-center transition-transform active:scale-90" title="Emoji">
                <Smile className="w-5 h-5" />
              </button>

              {/* NÚT STICKER */}
              <button onClick={toggleSticker} className="w-10 h-10 rounded-full bg-orange-50 dark:bg-zinc-800 text-orange-500 dark:text-zinc-400 hover:bg-orange-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-transform active:scale-90" title="Sticker">
                <Sticker className="w-5 h-5" />
              </button>

              {/* NÚT GIF */}
              <button onClick={toggleGif} className="w-10 h-10 rounded-full bg-blue-50 dark:bg-zinc-800 text-blue-500 dark:text-zinc-400 hover:bg-blue-100 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-xs transition-transform active:scale-90" style={{ fontFamily: '"Jua", sans-serif' }} title="GIF">
                GIF
              </button>
          </div>
        )}

        {/* INPUT & MIC */}
        {isRecording ? (
            <div className="flex-1 flex items-center justify-between py-[8px] px-4 mx-2 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-100 dark:border-red-500/30">
                <span className="text-red-500 font-bold tracking-wider">{recordingTime}s</span>
                <button onClick={cancelRecording} className="text-zinc-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
        ) : (
            <div className="flex-1 min-w-0 py-2.5 px-3">
              <input 
                value={text} 
                onChange={handleTextChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder={editingMessage ? "Nhập nội dung mới..." : "Nói gì đó đi..."} 
                className="w-full bg-transparent border-none outline-none text-zinc-800 dark:text-white font-semibold text-[15.5px]" 
                style={{ fontFamily: '"Nunito", sans-serif' }}
              />
            </div>
        )}

        {/* SEND BUTTON */}
        {(!text.trim() && !selectedFile && !isRecording) ? (
            <button
              type="button" onMouseDown={startRecording} onMouseUp={stopRecording} 
              className="w-11 h-11 shrink-0 rounded-[24px] bg-zinc-800 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center active:scale-95"
            >
              <Mic className="w-5 h-5" />
            </button>
        ) : (
            <button 
              onClick={handleSend}
              className="w-11 h-11 shrink-0 rounded-[24px] bg-[#75B085] text-white flex items-center justify-center active:scale-95"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
        )}
      </div>
    </div>
  );
};