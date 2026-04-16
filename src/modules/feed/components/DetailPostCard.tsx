import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; 
import { 
  MoreHorizontal, Trash2, Edit2, Flag, 
  MapPin, Share2, Bookmark, BookmarkCheck, Clock,
  Send, Activity, SmilePlus, Loader2
} from 'lucide-react';
import { ReportModal } from '@/modules/report/components/ReportModal';
import { ReportTargetType } from '@/modules/report/services/report.service';
import { usePostCardLogic } from '../hooks/usePostCardLogic';
import { PostProps } from '../types'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext'; 

import EmojiPicker, { Theme } from 'emoji-picker-react';
import { checkinService } from '@/modules/checkin/services/checkin.service';
import { feedService } from '../services/feed.service'; 
import { chatService } from '@/modules/chat/services/chat.service'; 
import { ActivityModal } from './ActivityModal';
import { ShareModal } from './ShareModal'; 
import { LivePhotoViewer } from '@/components/ui/LivePhotoViewer';
import toast from 'react-hot-toast';

interface DetailPostCardProps {
  post: PostProps & { videoUrl?: string }; 
  isActive: boolean;
  headerTarget?: HTMLDivElement | null; 
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string, newCaption: string) => void;
}

const QUICK_REACTIONS = ['❤️', '🔥', '😂', '😮', '🥺'];

export const DetailPostCard = ({ post, isActive, headerTarget, onDelete, onUpdate }: DetailPostCardProps) => {
  const { theme } = useTheme(); 

  const { 
    isOwner, showMenu, setShowMenu, toggleMenu,
    showReportModal, setShowReportModal,
    isEditing, editCaption, setEditCaption, isSaving, handlers
  } = usePostCardLogic({ post, onDelete, onUpdate });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); 
  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSaved(post.isSaved || false);
  }, [post.isSaved]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSave = async () => {
    const newSavedStatus = !isSaved;
    setIsSaved(newSavedStatus);
    post.isSaved = newSavedStatus; 
    setShowMenu(false); 
    try {
      await checkinService.toggleSave(post.id);
    } catch (error) {
      setIsSaved(!newSavedStatus);
      post.isSaved = !newSavedStatus;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      const targetUserId = post.userId || post.user?.id;
      if (targetUserId) {
         await chatService.sharePostToChat(
            targetUserId, 
            post.id, 
            post.image, 
            message 
         );
         setMessage('');
         toast.success("Đã gửi tin nhắn riêng");
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn", error);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  const handleReact = async (emoji: string) => {
    try {
      await feedService.toggleReaction(post.id, emoji);
    } catch (error) {
      console.error("Lỗi thả cảm xúc", error);
    }
  };

  const handleSelectEmoji = (emojiData: any) => {
    handleReact(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const HeaderContent = (
    <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] mx-auto flex flex-col pointer-events-auto">
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-white/20 shadow-lg">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none hover:underline cursor-pointer tracking-tight">
              {post.user.name}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] font-medium text-white/90 drop-shadow-md">{post.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button onClick={toggleMenu} className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors">
            <MoreHorizontal className="w-5 h-5 drop-shadow-md" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-30 animate-in fade-in zoom-in-95 origin-top-right">
                <button onClick={() => { setIsShareModalOpen(true); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                  <Share2 className="w-4 h-4 text-zinc-500"/> Chia sẻ
                </button>
                <button onClick={handleToggleSave} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                  {isSaved ? <><BookmarkCheck className="w-4 h-4 text-primary"/> Bỏ lưu bài viết</> : <><Bookmark className="w-4 h-4 text-zinc-500"/> Lưu bài viết</>}
                </button>
                {isOwner ? (
                  <>
                    <button onClick={handlers.handleEditClick} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                      <Edit2 className="w-4 h-4 text-zinc-500"/> Chỉnh sửa
                    </button>
                    <button onClick={handlers.handleDelete} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 border-t border-zinc-100 dark:border-white/5 transition-colors">
                      <Trash2 className="w-4 h-4"/> Xóa bài
                    </button>
                  </>
                ) : (
                  <button onClick={handlers.handleReport} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-zinc-100 dark:border-white/5 transition-colors">
                    <Flag className="w-4 h-4 text-zinc-500"/> Báo cáo
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full relative flex flex-col">

      {isActive && headerTarget ? createPortal(HeaderContent, headerTarget) : null}

      <div className="relative w-full aspect-square z-10">
        <div className="absolute inset-0 rounded-[32px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200/50 dark:border-white/10">
          <LivePhotoViewer imageUrl={post.image} videoUrl={post.videoUrl} className="w-full h-full" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="absolute bottom-4 left-4 right-12 z-10 pointer-events-none flex flex-col gap-2 items-start">
          <div className="flex flex-wrap gap-1.5 pointer-events-auto">
            {post.locationName && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                    <MapPin className="w-3 h-3 text-white" />
                    <span className="text-[11px] font-bold tracking-wide truncate max-w-[120px] drop-shadow-md">{post.locationName}</span>
                </div>
            )}
            
            {post.activityName && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                    <span className="text-[11px] font-bold tracking-wide truncate max-w-[200px] drop-shadow-md">{post.activityName}</span>
                </div>
            )}

            <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-[11px] font-bold tracking-wide drop-shadow-md">{post.timestamp}</span>
            </div>
          </div>

          <div className="pointer-events-auto">
              {isEditing ? (
                <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-lg rounded-2xl p-3 border border-white/10 w-[300px]">
                  <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="w-full bg-transparent p-0 text-sm text-white placeholder:text-white/50 focus:outline-none resize-none min-h-[60px]" placeholder="Viết ghi chú..." autoFocus />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button onClick={handlers.handleCancelEdit} className="px-3 py-1 text-white/80 text-xs font-medium hover:text-white transition-colors">Hủy</button>
                    <button onClick={handlers.handleSaveEdit} disabled={isSaving} className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">Lưu</button>
                  </div>
                </div>
              ) : (
                post.caption && (
                  <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 shadow-inner">
                    <p className="text-[14px] text-white font-medium leading-relaxed whitespace-pre-line line-clamp-3">
                      {typeof post.caption === 'string' ? post.caption : (post.caption as any).caption || ''}
                    </p>
                  </div>
                )
              )}
          </div>
        </div>
      </div>

      {/* CHÂN BÀI ĐĂNG DÀNH RIÊNG CHO MODAL */}
      <div className="mt-3.5 px-1 w-full z-10 pointer-events-auto relative">
        {isOwner ? (
          <button 
            onClick={() => setIsActivityModalOpen(true)}
            className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-300 dark:border-white/20 rounded-full py-3.5 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] gap-2 text-zinc-900 dark:text-white font-bold active:scale-95 transition-transform"
          >
            <Activity className="w-5 h-5 text-blue-500" />
            Xem hoạt động bài viết
          </button>
        ) : (
          <div className="relative flex flex-col w-full">
            {showEmojiPicker && (
              <div ref={pickerRef} className="absolute bottom-[calc(100%+12px)] left-0 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-2xl rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10">
                <EmojiPicker theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={handleSelectEmoji} lazyLoadEmojis={true} searchDisabled={true} skinTonesDisabled={true} height={350} />
              </div>
            )}

            <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-300 dark:border-white/20 rounded-full pl-3 pr-2 py-2 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors gap-2">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors shrink-0"
              >
                  <SmilePlus className="w-6 h-6" />
              </button>

              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Nhắn cho ${post.user.name.split(' ')[0]}...`}
                className="bg-transparent text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-white/60 outline-none w-full text-[15px] font-medium"
                style={{ fontFamily: '"Jua", sans-serif' }}
              />

              {message.trim() ? (
                <button 
                  onClick={handleSendMessage} 
                  disabled={isSending}
                  className="w-10 h-10 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0 shadow-sm"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
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
        )}
      </div>

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} targetId={post.id} targetType={ReportTargetType.CHECKIN} />
      {isActivityModalOpen && <ActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} postId={post.id} />}
      {isShareModalOpen && <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} postId={post.id} postImage={post.image} />}
    </div>
  );
};