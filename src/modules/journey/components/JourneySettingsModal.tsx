import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Loader2, LogOut, Trash2, UserCog, Globe, Lock, Palette, Package, ChevronDown, CheckCircle2, Settings, BellRing, ChevronRight } from 'lucide-react';
import EmojiPicker, { Theme, EmojiStyle, EmojiClickData } from 'emoji-picker-react';
import { JourneyResponse, JourneyRole, JourneyVisibility } from '../types';
import { useJourneySettings } from '../hooks/useJourneySettings';
import { useJourneyAction } from '../hooks/useJourneyAction';
import { TransferOwnershipModal } from './TransferOwnershipModal';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { PendingRequestsList } from './PendingRequestsList';
import { MemberList } from './MemberList';
import { boxService } from '@/modules/box/services/box.service'; 
import { BoxResponse } from '@/modules/box/types';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journey: JourneyResponse | null;
  onUpdateSuccess: () => void;
}

const PRESET_COLORS = ['#1A1A1A', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const JourneySettingsModal: React.FC<Props> = ({ 
  isOpen, onClose, journey, onUpdateSuccess 
}) => {
  const { user } = useAuth();
  const { theme: appTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { settings, isLoading, updateField, handleSave } = useJourneySettings(journey, onUpdateSuccess);
  const [refreshMemberKey, setRefreshMemberKey] = useState(0); 
  const [mounted, setMounted] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [boxes, setBoxes] = useState<BoxResponse[]>([]);
  const [isBoxDropdownOpen, setIsBoxDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id ? String(user.id) === String(journey?.creatorId) : false;

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const onDragStart = (clientY: number) => { dragStartY.current = clientY; setIsDragging(true); };
  const onDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onDragEnd = () => {
    setIsDragging(false);
    if (dragY > 150) { onClose(); setTimeout(() => setDragY(0), 300); } 
    else { setDragY(0); }
  };

  useEffect(() => {
    const fetchBoxes = async () => {
        try {
            const data = await boxService.getMyBoxes('all', '', 0, 50);
            setBoxes(data.content || []);
        } catch (error) {
            console.error("Lỗi tải danh sách Box", error);
        }
    };
    if (isOwner && isOpen) fetchBoxes();
  }, [isOwner, isOpen]);

  const handleLeaveOrDeleteSuccess = () => {
    onUpdateSuccess();
    onClose();
    const currentJourneyId = searchParams.get('journeyId');
    if (currentJourneyId === journey?.id) {
        navigate('/', { replace: true });
    }
  };

  const { deleteJourney, leaveJourney, isProcessing } = useJourneyAction(handleLeaveOrDeleteSuccess);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setShowEmojiPicker(false);
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsBoxDropdownOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
      updateField('avatar', emojiData.emoji);
      setShowEmojiPicker(false);
  };

  if (!mounted || !isOpen || !journey || !user) return null;

  const selectedBox = boxes.find(b => b.id === settings.boxId);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9990] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" onClick={onClose} />

        <div 
          className={cn(
            "relative w-full md:w-[560px] h-[95vh] md:h-auto bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95",
            !isDragging ? "transition-transform duration-300 ease-out" : ""
          )}
          style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : 'none' }}
        >
          
          <div 
              className="w-full shrink-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md cursor-grab active:cursor-grabbing touch-none z-30"
              onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
              onTouchEnd={onDragEnd}
              onMouseDown={(e) => onDragStart(e.clientY)}
              onMouseMove={(e) => onDragMove(e.clientY)}
              onMouseUp={onDragEnd}
              onMouseLeave={() => { if (isDragging) onDragEnd(); }}
          >
              <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                  <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
              </div>

              <div className="flex items-center justify-between px-6 md:px-8 py-2 md:py-5 border-b border-[#F4EBE1] dark:border-[#2B2A29]">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center shadow-sm">
                          <Settings className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                      </div>
                      <h2 className="text-[#1A1A1A] dark:text-white text-[1.4rem] font-black tracking-tight pointer-events-none">
                          Cài đặt Hành trình
                      </h2>
                  </div>
                  <button 
                      onMouseDown={e => e.stopPropagation()}
                      onTouchStart={e => e.stopPropagation()}
                      onClick={onClose} 
                      className="p-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95 cursor-pointer"
                  >
                      <X size={20} strokeWidth={2.5} />
                  </button>
              </div>
          </div>

          <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-[#F4EBE1]/30 to-white dark:from-[#1A1A1A]/30 dark:to-[#0A0A0A]">
            
            <div className="space-y-6">
              <h3 className="text-[0.75rem] font-extrabold text-[#8A8580] dark:text-[#A09D9A] uppercase tracking-widest pl-1">Thông tin chung</h3>
              
              <div className="flex gap-4">
                <div className="relative shrink-0" ref={pickerRef}>
                  <button
                    type="button"
                    disabled={!isOwner}
                    onClick={() => isOwner && setShowEmojiPicker(!showEmojiPicker)}
                    className="h-[56px] w-[56px] flex items-center justify-center bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] rounded-[20px] text-[1.6rem] hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {settings.avatar || '🚀'}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-[64px] left-0 z-50 shadow-[0_16px_40px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden border border-[#D6CFC7]/50 dark:border-[#3A3734] bg-white dark:bg-[#1A1A1A] animate-in fade-in slide-in-from-top-2">
                      <EmojiPicker onEmojiClick={onEmojiClick} theme={appTheme === 'dark' ? Theme.DARK : Theme.LIGHT} emojiStyle={EmojiStyle.NATIVE} width={300} height={350} previewConfig={{showPreview: false}}/>
                    </div>
                  )}
                </div>
                <input 
                  value={settings.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  disabled={!isOwner}
                  placeholder="Tên hành trình..."
                  className="flex-1 h-[56px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] rounded-[20px] px-5 text-[#1A1A1A] dark:text-white font-bold text-[1.05rem] focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] outline-none disabled:opacity-50 transition-all shadow-sm"
                />
              </div>

              {isOwner && (
                <div>
                  <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-3 pl-1">Quyền truy cập</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateField('visibility', JourneyVisibility.PUBLIC)}
                      className={cn(
                        "p-4 rounded-[24px] border-2 text-left transition-all active:scale-95",
                        settings.visibility === JourneyVisibility.PUBLIC 
                          ? "bg-[#1A1A1A] dark:bg-white border-transparent shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-1" 
                          : "bg-white/60 dark:bg-[#1A1A1A]/60 border-[#D6CFC7] dark:border-[#3A3734] hover:bg-white dark:hover:bg-[#2B2A29]"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className={cn("w-5 h-5", settings.visibility === JourneyVisibility.PUBLIC ? "text-white dark:text-[#1A1A1A]" : "text-blue-500")} strokeWidth={2.5} />
                        <span className={cn("text-[1rem] font-black", settings.visibility === JourneyVisibility.PUBLIC ? "text-white dark:text-[#1A1A1A]" : "text-[#1A1A1A] dark:text-white")}>Mở cửa</span>
                      </div>
                      <p className={cn("text-[0.8rem] font-semibold leading-snug", settings.visibility === JourneyVisibility.PUBLIC ? "text-white/80 dark:text-[#1A1A1A]/80" : "text-[#8A8580] dark:text-[#A09D9A]")}>
                          {settings.boxId ? "Tất cả thành viên Không gian đều thấy." : "Mọi người đều có thể thấy và tham gia."}
                      </p>
                    </button>

                    <button
                      onClick={() => updateField('visibility', JourneyVisibility.PRIVATE)}
                      className={cn(
                        "p-4 rounded-[24px] border-2 text-left transition-all active:scale-95",
                        settings.visibility === JourneyVisibility.PRIVATE
                          ? "bg-[#1A1A1A] dark:bg-white border-transparent shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-1" 
                          : "bg-white/60 dark:bg-[#1A1A1A]/60 border-[#D6CFC7] dark:border-[#3A3734] hover:bg-white dark:hover:bg-[#2B2A29]"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className={cn("w-5 h-5", settings.visibility === JourneyVisibility.PRIVATE ? "text-white dark:text-[#1A1A1A]" : "text-orange-500")} strokeWidth={2.5} />
                        <span className={cn("text-[1rem] font-black", settings.visibility === JourneyVisibility.PRIVATE ? "text-white dark:text-[#1A1A1A]" : "text-[#1A1A1A] dark:text-white")}>Khép kín</span>
                      </div>
                      <p className={cn("text-[0.8rem] font-semibold leading-snug", settings.visibility === JourneyVisibility.PRIVATE ? "text-white/80 dark:text-[#1A1A1A]/80" : "text-[#8A8580] dark:text-[#A09D9A]")}>
                          Chỉ những người được mời mới thấy.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="pt-2 border-t border-[#F4EBE1] dark:border-[#2B2A29]">
                <button 
                  onClick={() => setShowRequestsModal(true)} 
                  className="flex items-center justify-between w-full p-4 bg-white dark:bg-[#1A1A1A] hover:bg-[#F4EBE1]/50 dark:hover:bg-[#2B2A29] rounded-[24px] border border-[#D6CFC7]/50 dark:border-white/5 transition-all shadow-sm active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-[16px] text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <BellRing size={22} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[#1A1A1A] dark:text-white font-black text-[1rem]">Yêu cầu tham gia</p>
                      <p className="text-[0.85rem] font-semibold text-[#8A8580] dark:text-[#A09D9A]">Duyệt thành viên mới</p>
                    </div>
                  </div>
                  <ChevronRight size={20} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A]" />
                </button>
              </div>
            )}

            <MemberList 
                journeyId={journey.id} 
                currentUserRole={isOwner ? JourneyRole.OWNER : JourneyRole.MEMBER}
                refreshTrigger={refreshMemberKey}
            />

            <div className="space-y-4 pt-6 border-t border-[#F4EBE1] dark:border-[#2B2A29]">
              <h3 className="text-[0.75rem] font-extrabold text-red-500 uppercase tracking-widest pl-1">Vùng nguy hiểm</h3>
              {isOwner ? (
                <div className="grid gap-4">
                  <button onClick={() => setShowTransferModal(true)} className="flex items-center justify-between w-full p-5 bg-white dark:bg-[#1A1A1A] hover:bg-[#FFF9E6] dark:hover:bg-[#332A1A] rounded-[24px] border border-yellow-200 dark:border-yellow-900/50 transition-colors shadow-sm active:scale-[0.98] group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-500/20 rounded-[16px] text-yellow-600 dark:text-yellow-500 group-hover:scale-110 transition-transform"><UserCog size={22} strokeWidth={2.5} /></div>
                      <div className="text-left"><p className="text-[#1A1A1A] dark:text-white font-black text-[1rem]">Chuyển quyền sở hữu</p><p className="text-[0.85rem] font-semibold text-[#8A8580] dark:text-[#A09D9A]">Nhường quyền chủ phòng</p></div>
                    </div>
                  </button>
                  <button onClick={() => deleteJourney(journey.id)} disabled={isProcessing} className="flex items-center justify-between w-full p-5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-[24px] border border-red-200 dark:border-red-500/30 transition-colors shadow-sm active:scale-[0.98] group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-red-500/20 rounded-[16px] text-red-500 group-hover:scale-110 transition-transform shadow-sm"><Trash2 size={22} strokeWidth={2.5} /></div>
                      <div className="text-left"><p className="text-red-600 dark:text-red-400 font-black text-[1rem]">Giải tán hành trình</p><p className="text-[0.85rem] font-semibold text-red-500/80 dark:text-red-400/80">Xóa vĩnh viễn nhóm này</p></div>
                    </div>
                    {isProcessing && <Loader2 className="w-5 h-5 animate-spin text-red-500"/>}
                  </button>
                </div>
              ) : (
                <button onClick={() => leaveJourney(journey.id)} disabled={isProcessing} className="flex items-center justify-between w-full p-5 bg-white dark:bg-[#1A1A1A] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[24px] border border-[#D6CFC7] dark:border-[#3A3734] hover:border-red-200 dark:hover:border-red-500/30 transition-colors shadow-sm active:scale-[0.98] group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] group-hover:bg-white dark:group-hover:bg-red-500/20 group-hover:text-red-500 group-hover:scale-110 transition-transform"><LogOut size={22} strokeWidth={2.5} /></div>
                    <div className="text-left"><p className="text-[#1A1A1A] dark:text-white font-black text-[1rem] group-hover:text-red-600 dark:group-hover:text-red-400">Rời hành trình</p><p className="text-[0.85rem] font-semibold text-[#8A8580] dark:text-[#A09D9A]">Thoát khỏi nhóm này</p></div>
                  </div>
                  {isProcessing && <Loader2 className="w-5 h-5 animate-spin text-red-500"/>}
                </button>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="p-6 md:p-8 bg-white dark:bg-[#121212] border-t border-[#F4EBE1] dark:border-[#2B2A29] shrink-0">
              <button 
                onClick={handleSave} 
                disabled={isLoading} 
                className="w-full h-[60px] bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[24px] font-black text-[1.1rem] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />} Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>

      <PendingRequestsList 
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        journeyId={journey.id}
        onSuccess={() => {
          setRefreshMemberKey(prev => prev + 1);
          onUpdateSuccess();
        }}
      />

      <TransferOwnershipModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        journeyId={journey.id}
        currentUserId={String(user.id)}
        onSuccess={() => {
          setShowTransferModal(false);
          onUpdateSuccess();
          onClose();
        }}
      />
    </>,
    document.body
  );
};