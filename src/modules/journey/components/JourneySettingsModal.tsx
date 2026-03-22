import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Loader2, LogOut, Trash2, UserCog, Globe, Lock, Palette, Package, ChevronDown, CheckCircle2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journey: JourneyResponse | null;
  onUpdateSuccess: () => void;
}

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const JourneySettingsModal: React.FC<Props> = ({ 
  isOpen, onClose, journey, onUpdateSuccess 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { settings, isLoading, updateField, handleSave } = useJourneySettings(journey, onUpdateSuccess);
  const [refreshMemberKey, setRefreshMemberKey] = useState(0); 
  const [mounted, setMounted] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // States cho Emoji Picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // States cho Box Dropdown
  const [boxes, setBoxes] = useState<BoxResponse[]>([]);
  const [isBoxDropdownOpen, setIsBoxDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id ? String(user.id) === String(journey?.creatorId) : false;

  // Lấy danh sách Box khi mở Modal
  useEffect(() => {
    const fetchBoxes = async () => {
        try {
            const data = await boxService.getMyBoxes(0, 50);
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

  // Xử lý click outside cho cả Emoji và Dropdown Box
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
              setShowEmojiPicker(false);
          }
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsBoxDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
      updateField('avatar', emojiData.emoji);
      setShowEmojiPicker(false);
  };

  if (!mounted || !isOpen || !journey || !user) return null;

  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  const selectedBox = boxes.find(b => b.id === settings.boxId);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl flex flex-col max-h-[90vh]">
          
          <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
            <h2 className="text-xl font-bold text-white">Cài đặt Hành trình</h2>
            <button onClick={onClose}><X className="text-zinc-400 hover:text-white transition-colors" /></button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* 1. THÔNG TIN CƠ BẢN */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Thông tin chung</h3>
              
              {/* Tên & Icon */}
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Tên & Biểu tượng</label>
                <div className="flex gap-3">
                  <div className="relative" ref={pickerRef}>
                    <button
                      type="button"
                      disabled={!isOwner}
                      onClick={() => isOwner && setShowEmojiPicker(!showEmojiPicker)}
                      className="h-12 w-12 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-xl text-2xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      {settings.avatar || '🚀'}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-[52px] left-0 z-50 shadow-2xl">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} emojiStyle={EmojiStyle.NATIVE} width={300} height={350} />
                      </div>
                    )}
                  </div>
                  <input 
                    value={settings.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    disabled={!isOwner}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              {/* Màu sắc */}
              {isOwner && (
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Màu sắc chủ đạo</label>
                  <div className="flex flex-wrap gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                      {PRESET_COLORS.map(color => (
                          <button
                              key={color} 
                              type="button" 
                              onClick={() => updateField('themeColor', color)}
                              className={`w-8 h-8 rounded-full transition-all duration-200 ${
                                  settings.themeColor === color 
                                  ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#18181b] border border-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                  : 'opacity-50 hover:opacity-100 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                          />
                      ))}
                      
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:scale-105 transition-transform group">
                          <input 
                              type="color" 
                              value={settings.themeColor || '#3b82f6'} 
                              onChange={(e) => updateField('themeColor', e.target.value)} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          />
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                              <Palette size={14} className="text-zinc-400" />
                          </div>
                      </div>
                  </div>
                </div>
              )}

              {/* [THÊM MỚI] GẮN VÀO BOX */}
              {isOwner && (
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="text-sm text-zinc-400 mb-2 block">Gắn vào Không gian</label>
                  <button
                      type="button"
                      onClick={() => setIsBoxDropdownOpen(!isBoxDropdownOpen)}
                      className="w-full bg-zinc-900/50 border border-white/10 text-white rounded-xl p-3 flex items-center justify-between hover:bg-zinc-800 transition-colors"
                  >
                      <div className="flex items-center gap-3">
                          <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-lg",
                              selectedBox ? "bg-black/20" : "bg-zinc-800 text-zinc-500"
                          )}
                          style={selectedBox ? { borderBottom: `2px solid ${selectedBox.themeColor || '#3b82f6'}` } : {}}
                          >
                              {selectedBox ? selectedBox.avatar || '📦' : <Package size={16} />}
                          </div>
                          <div className="flex flex-col items-start">
                              <span className={cn("text-sm font-bold", selectedBox ? "text-white" : "text-zinc-400")}>
                                  {selectedBox ? selectedBox.name : "Không gian chung (Tùy chọn)"}
                              </span>
                          </div>
                      </div>
                      <ChevronDown size={18} className={cn("text-zinc-500 transition-transform duration-200", isBoxDropdownOpen ? "rotate-180" : "")} />
                  </button>

                  {isBoxDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-[#1A1A1A] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                          <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                              <button
                                  type="button"
                                  onClick={() => { updateField('boxId', ''); setIsBoxDropdownOpen(false); }}
                                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors text-left group"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-400">
                                          <Package size={16} />
                                      </div>
                                      <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">Không gắn vào Không gian nào</span>
                                  </div>
                                  {!settings.boxId && <CheckCircle2 size={18} className="text-zinc-500" />}
                              </button>

                              {boxes.length > 0 && <div className="h-px w-full bg-zinc-800/50 my-1" />}

                              {boxes.map(box => (
                                  <button
                                      key={box.id}
                                      type="button"
                                      onClick={() => { updateField('boxId', box.id); setIsBoxDropdownOpen(false); }}
                                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors text-left group"
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl bg-black/20" style={{ borderBottom: `2px solid ${box.themeColor || '#3b82f6'}` }}>
                                              {box.avatar || '📦'}
                                          </div>
                                          <span className={cn("text-sm font-bold transition-colors", settings.boxId === box.id ? "text-blue-400" : "text-zinc-300 group-hover:text-white")}>
                                              {box.name}
                                          </span>
                                      </div>
                                      {settings.boxId === box.id && <CheckCircle2 size={18} className="text-blue-500" />}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
                </div>
              )}

              {/* Chỉnh sửa Quyền riêng tư */}
              {isOwner && (
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Quyền riêng tư</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField('visibility', JourneyVisibility.PUBLIC)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.visibility === JourneyVisibility.PUBLIC 
                          ? 'bg-blue-600/10 border-blue-500/50' 
                          : 'bg-zinc-900 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-white">Công khai</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Ai cũng vào được nếu được mời.</p>
                    </button>

                    <button
                      onClick={() => updateField('visibility', JourneyVisibility.PRIVATE)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.visibility === JourneyVisibility.PRIVATE
                          ? 'bg-blue-600/10 border-blue-500/50' 
                          : 'bg-zinc-900 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-bold text-white">Riêng tư</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Chỉ chủ phòng được mời.</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DANH SÁCH YÊU CẦU */}
            {isOwner && (
               <PendingRequestsList 
                 journeyId={journey.id} 
                 onSuccess={() => {
                   setRefreshMemberKey(prev => prev + 1);
                   onUpdateSuccess(); 
                 }}
               />
            )}

            {/* DANH SÁCH THÀNH VIÊN */}
            <MemberList 
                journeyId={journey.id} 
                currentUserRole={isOwner ? JourneyRole.OWNER : JourneyRole.MEMBER}
                refreshTrigger={refreshMemberKey}
            />

            {/* VÙNG NGUY HIỂM */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">Vùng nguy hiểm</h3>
              {isOwner ? (
                <div className="grid gap-3">
                  <button onClick={() => setShowTransferModal(true)} className="flex items-center justify-between w-full p-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:bg-yellow-500/20"><UserCog className="w-5 h-5" /></div>
                      <div className="text-left"><p className="text-white font-medium text-sm">Chuyển quyền sở hữu</p><p className="text-xs text-zinc-500">Nhường quyền chủ phòng</p></div>
                    </div>
                  </button>
                  <button onClick={() => deleteJourney(journey.id)} disabled={isProcessing} className="flex items-center justify-between w-full p-4 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-500/10 rounded-lg text-red-500"><Trash2 className="w-5 h-5" /></div>
                      <div className="text-left"><p className="text-red-400 font-medium text-sm">Giải tán hành trình</p><p className="text-xs text-red-500/60">Xóa vĩnh viễn nhóm này</p></div>
                    </div>
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-red-500"/>}
                  </button>
                </div>
              ) : (
                <button onClick={() => leaveJourney(journey.id)} disabled={isProcessing} className="flex items-center justify-between w-full p-4 bg-zinc-900 hover:bg-red-500/10 rounded-xl border border-white/5 hover:border-red-500/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-red-500 group-hover:bg-red-500/10"><LogOut className="w-5 h-5" /></div>
                    <div className="text-left"><p className="text-white font-medium text-sm group-hover:text-red-400">Rời hành trình</p><p className="text-xs text-zinc-500">Thoát khỏi nhóm này</p></div>
                  </div>
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-zinc-400"/>}
                </button>
              )}
            </div>
          </div>

          {/* Footer Save */}
          {isOwner && (
            <div className="p-6 border-t border-white/5 flex justify-end shrink-0">
              <button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>

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
    portalTarget
  );
};