import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { cn } from '@/lib/utils';
import { 
  MoreHorizontal, Trash2, Edit2, Flag, 
  MapPin, Share2, Bookmark, BookmarkCheck 
} from 'lucide-react';
import { ReportModal } from '@/modules/report/components/ReportModal';
import { ReportTargetType } from '@/modules/report/services/report.service';
import { usePostCardLogic } from '../hooks/usePostCardLogic';
import { PostProps, Emotion } from '../types'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext'; 

import { checkinService } from '@/modules/checkin/services/checkin.service';
import { ActivityModal } from './ActivityModal';
import { ShareModal } from './ShareModal'; 

// [THÊM MỚI] Import LivePhotoViewer
import { LivePhotoViewer } from '@/components/ui/LivePhotoViewer';

interface JourneyPostCardProps {
  post: PostProps & { videoUrl?: string }; // Nhận thêm videoUrl
  isActive: boolean;
  headerTarget?: HTMLDivElement | null; 
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string, newCaption: string) => void;
}

export const JourneyPostCard = ({ post, isActive, headerTarget, onDelete, onUpdate }: JourneyPostCardProps) => {
  const { theme } = useTheme(); 

  const { 
    isOwner, showMenu, setShowMenu, toggleMenu,
    showReportModal, setShowReportModal,
    isEditing, editCaption, setEditCaption, isSaving, handlers
  } = usePostCardLogic({ post, onDelete, onUpdate });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); 
  
  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  useEffect(() => {
    setIsSaved(post.isSaved || false);
  }, [post.isSaved]);

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
      console.error("Lỗi khi lưu bài viết", error);
    }
  };

  const HeaderContent = (
    <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] mx-auto flex flex-col pointer-events-auto">
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-zinc-900 dark:text-white leading-none hover:underline cursor-pointer">
              {post.user.name}
            </span>
            <div className="flex items-center gap-1.5 mt-1 opacity-80">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{post.timestamp}</span>
              {post.locationName && (
                <>
                  <span className="text-[10px] text-zinc-400">•</span>
                  <div className="flex items-center gap-0.5 text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs truncate max-w-[110px]">{post.locationName}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={toggleMenu} 
            className="p-2 bg-zinc-100/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden py-1 z-30 animate-in fade-in zoom-in-95 origin-top-right">
                
                <button onClick={() => { setIsShareModalOpen(true); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                  <Share2 className="w-4 h-4 text-zinc-500"/> Chia sẻ
                </button>

                <button onClick={handleToggleSave} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                  {isSaved ? <><BookmarkCheck className="w-4 h-4 text-primary"/> Bỏ lưu bài viết</> : <><Bookmark className="w-4 h-4 text-zinc-500"/> Lưu bài viết</>}
                </button>

                {isOwner ? (
                  <>
                    <button onClick={handlers.handleEditClick} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                      <Edit2 className="w-4 h-4 text-zinc-500"/> Chỉnh sửa
                    </button>
                    <button onClick={handlers.handleDelete} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
                      <Trash2 className="w-4 h-4"/> Xóa bài
                    </button>
                  </>
                ) : (
                  <button onClick={handlers.handleReport} className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
                    <Flag className="w-4 h-4 text-zinc-500"/> Báo cáo
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <hr className="w-full border-zinc-200 dark:border-white/10" />
    </div>
  );

  return (
    <div className="w-full relative flex flex-col">

      {isActive && headerTarget ? createPortal(HeaderContent, headerTarget) : null}

      <div className="relative w-full aspect-square z-10 mt-1">
        
        {/* [ĐÃ SỬA] Thay thế <img /> bằng LivePhotoViewer */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-white/10">
          <LivePhotoViewer 
             imageUrl={post.image} 
             videoUrl={post.videoUrl} 
             className="w-full h-full" 
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        </div>

        <div className="absolute bottom-4 left-4 max-w-[80%] z-10 pointer-events-none">
          <div className="pointer-events-auto">
              {isEditing ? (
                <div className="flex flex-col gap-2 bg-black/50 backdrop-blur-lg rounded-2xl p-3 border border-white/10 w-[300px]">
                  <textarea 
                    value={editCaption} 
                    onChange={(e) => setEditCaption(e.target.value)} 
                    className="w-full bg-transparent p-0 text-sm text-white placeholder:text-white/50 focus:outline-none resize-none min-h-[60px]" 
                    placeholder="Viết ghi chú..."
                    autoFocus 
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button onClick={handlers.handleCancelEdit} className="px-3 py-1 text-white/80 text-xs font-medium hover:text-white transition-colors">Hủy</button>
                    <button onClick={handlers.handleSaveEdit} disabled={isSaving} className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">Lưu</button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 shadow-inner">
                  <p className="text-[14px] text-white font-medium leading-relaxed whitespace-pre-line line-clamp-3">
                    {post.caption ? (
                        typeof post.caption === 'string' ? post.caption : (post.caption as any).caption || ''
                    ) : (
                        <span className="italic text-white/60 text-sm">Không có ghi chú...</span>
                    )}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} targetId={post.id} targetType={ReportTargetType.CHECKIN} />
      {isActivityModalOpen && <ActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} postId={post.id} />}
      {isShareModalOpen && <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} postId={post.id} postImage={post.image} />}

    </div>
  );
};