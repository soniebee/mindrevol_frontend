import React from 'react';
import { X, Loader2, MapPin, Smile, ChevronDown, Archive, Sparkles } from 'lucide-react'; 
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Cropper from 'react-easy-crop';
import { useCheckinModal, ACTIVITY_PRESETS } from '../hooks/useCheckinModal'; 
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  journeyId: string;
  onSuccess: () => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = (props) => {
  const { isOpen, onClose, file } = props;
  const { theme: appTheme } = useTheme();

  const {
    caption, setCaption, selectedActivity, setSelectedActivity,
    customContext, setCustomContext, previewUrl, isSubmitting,
    showEmojiPicker, setShowEmojiPicker, pickerRef, emojiTarget, setEmojiTarget, handleEmojiSelect,
    handleSubmit, crop, setCrop, zoom, setZoom, onCropComplete,
    activeJourneys, selectedJourneyId, setSelectedJourneyId, 
    isJourneyDropdownOpen, setIsJourneyDropdownOpen, journeyDropdownRef,
    latitude, isLocating, handleAutoLocate, locationSearch, 
    handleLocationInputChange, locationSuggestions, isSearchingLocation, handleSelectSuggestion, locationContainerRef,
    isVideo, videoDuration, startTime, setStartTime
  } = useCheckinModal(props);

  if (!isOpen || !file) return null;

  const trimmedVideoUrl = isVideo && previewUrl ? `${previewUrl}#t=${startTime},${startTime + 3}` : undefined;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand animate-in fade-in duration-300">
      
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] md:block hidden" onClick={onClose} />

      {/* MODAL CONTAINER */}
      <div className="relative w-full h-[95vh] md:h-[85vh] max-w-[1100px] md:max-h-[750px] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl z-10 animate-in slide-in-from-bottom-1/2 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#F4EBE1] dark:border-[#2B2A29] shrink-0 bg-white dark:bg-[#121212] pt-safe md:pt-0">
          <button onClick={onClose} className="p-2.5 -ml-2.5 bg-[#F4EBE1]/50 hover:bg-[#F4EBE1] dark:bg-[#2B2A29]/50 dark:hover:bg-[#3A3734] text-[#8A8580] dark:text-[#A09D9A] rounded-[16px] transition-colors active:scale-95">
             <X size={20} strokeWidth={2.5}/>
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
            <h2 className="text-[#1A1A1A] dark:text-white font-black text-[1.3rem] tracking-tight">Bài viết mới</h2>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={cn(
                "px-6 h-[44px] font-black rounded-[18px] transition-all flex items-center gap-2 active:scale-95 shadow-sm",
                isSubmitting 
                    ? "bg-[#E2D9CE] dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] cursor-not-allowed shadow-none" 
                    : "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:-translate-y-0.5"
            )}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Chia sẻ"}
          </button>
        </div>

        {/* BODY 2 CỘT */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            
            {/* CỘT TRÁI: ẢNH VÀ CROP (55%) */}
            <div className="w-full md:w-[55%] h-[45vh] min-h-[45vh] md:min-h-0 md:h-full bg-[#0A0A0A] relative group flex items-center justify-center border-b md:border-b-0 md:border-r border-[#F4EBE1] dark:border-[#2B2A29] overflow-hidden shrink-0">
                {previewUrl ? (
                    <Cropper
                        image={!isVideo ? previewUrl : undefined} 
                        video={isVideo ? trimmedVideoUrl : undefined} 
                        crop={crop} 
                        zoom={zoom} 
                        aspect={1} 
                        onCropChange={setCrop} 
                        onCropComplete={onCropComplete} 
                        onZoomChange={setZoom}
                        classes={{ containerClassName: 'bg-[#0A0A0A]' }}
                    />
                ) : (
                    <Loader2 className="w-8 h-8 text-[#8A8580] animate-spin" />
                )}

                {/* THANH TRƯỢT ZOOM (Kính mờ) */}
                <div className="absolute top-4 left-4 w-[180px] z-30 bg-black/40 backdrop-blur-md rounded-[20px] px-4 py-3 border border-white/10 flex items-center shadow-[0_8px_24px_rgba(0,0,0,0.15)] pointer-events-auto">
                    <span className="text-white/80 text-[0.7rem] font-black mr-3 uppercase tracking-widest">Zoom</span>
                    <input 
                        type="range" value={zoom} min={1} max={3} step={0.05}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                    />
                </div>

                {/* THANH CHỌN THỜI GIAN (VIDEO) */}
                {isVideo && videoDuration > 3 && (
                    <div className="absolute top-20 left-4 w-[220px] z-30 bg-black/40 backdrop-blur-md rounded-[20px] px-4 py-3 border border-white/10 flex items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] pointer-events-auto">
                        <span className="text-amber-400 text-[0.7rem] font-black uppercase tracking-widest whitespace-nowrap">Đoạn (3s)</span>
                        <input 
                            type="range" min={0} max={Math.max(0, videoDuration - 3)} step={0.1}
                            value={startTime}
                            onChange={(e) => setStartTime(Number(e.target.value))}
                            className="flex-1 accent-amber-400 cursor-pointer"
                        />
                    </div>
                )}

                {/* OVERLAY TAGS & CAPTION (Kính mờ trên ảnh) */}
                <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none flex flex-col gap-2 items-start">
                    <div className="flex flex-wrap gap-2 pointer-events-auto">
                        {locationSearch && (
                            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-black/40 backdrop-blur-md rounded-[14px] border border-white/10 text-white shadow-sm">
                                <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                <span className="text-[0.8rem] font-bold tracking-wide truncate max-w-[140px]">{locationSearch}</span>
                            </div>
                        )}
                        {(customContext || selectedActivity.type !== 'DEFAULT') && (
                            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-black/40 backdrop-blur-md rounded-[14px] border border-white/10 text-white shadow-sm">
                                <span className="text-[0.8rem] font-bold tracking-wide truncate max-w-[160px]">
                                    {customContext ? customContext : `${selectedActivity.emoji} ${selectedActivity.label}`}
                                </span>
                            </div>
                        )}
                    </div>
                    {caption && (
                        <div className="bg-black/40 backdrop-blur-md rounded-[20px] px-5 py-3.5 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.1)] inline-block pointer-events-auto max-w-[90%]">
                            <p className="text-[0.95rem] text-white font-semibold leading-relaxed whitespace-pre-line line-clamp-3">
                                {caption}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: NỘI DUNG VÀ SETTINGS (45%) */}
            <div className="w-full md:w-[45%] flex-1 bg-white dark:bg-[#121212] overflow-y-auto custom-scrollbar flex flex-col pb-safe md:pb-0" ref={pickerRef}>
                
                <div className="p-6 md:p-8 space-y-8 flex-1">
                    
                    {/* KHỐI CHỌN HÀNH TRÌNH */}
                    <div className="relative" ref={journeyDropdownRef}>
                        <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">
                            Đăng vào Hành trình
                        </label>
                        <button 
                            onClick={() => setIsJourneyDropdownOpen(!isJourneyDropdownOpen)} 
                            className="w-full h-[56px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] rounded-[20px] px-5 flex items-center justify-between hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] transition-all focus:border-[#1A1A1A] dark:focus:border-white"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                {selectedJourneyId ? (() => {
                                    const j = activeJourneys.find(x => x.id === selectedJourneyId);
                                    return j ? (
                                        <>
                                            <div className="w-8 h-8 bg-white dark:bg-[#3A3734] rounded-[10px] flex items-center justify-center text-[1.1rem] shadow-sm border border-[#D6CFC7]/50 dark:border-transparent shrink-0">
                                                {j.avatar || '🚀'}
                                            </div>
                                            <span className="text-[1.05rem] text-[#1A1A1A] dark:text-white font-bold truncate">{j.name}</span>
                                        </>
                                    ) : <span className="text-sm text-[#8A8580]">Đang tải...</span>;
                                })() : (
                                    <>
                                        <div className="w-8 h-8 bg-white dark:bg-[#3A3734] rounded-[10px] flex items-center justify-center shadow-sm border border-[#D6CFC7]/50 dark:border-transparent shrink-0">
                                            <Archive className="w-4 h-4 text-[#1A1A1A] dark:text-white" strokeWidth={2.5}/>
                                        </div>
                                        <span className="text-[1.05rem] text-[#1A1A1A] dark:text-white font-bold truncate">Lưu trữ cá nhân</span>
                                    </>
                                )}
                            </div>
                            <ChevronDown size={20} className="text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                        </button>
                        
                        {isJourneyDropdownOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#3A3734] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-50 p-2 max-h-[220px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
                                <button 
                                    onClick={() => { setSelectedJourneyId(''); setIsJourneyDropdownOpen(false); }} 
                                    className="w-full text-left px-4 py-3 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] transition-colors flex items-center gap-3 active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-[#F4EBE1] dark:bg-[#3A3734] rounded-[10px] flex items-center justify-center shrink-0">
                                        <Archive className="w-4 h-4 text-[#1A1A1A] dark:text-white" strokeWidth={2.5}/>
                                    </div>
                                    <span className="text-[1rem] font-bold text-[#1A1A1A] dark:text-white truncate">Lưu trữ cá nhân</span>
                                </button>
                                
                                {activeJourneys.map(j => (
                                    <button 
                                        key={j.id} 
                                        onClick={() => { setSelectedJourneyId(j.id); setIsJourneyDropdownOpen(false); }} 
                                        className="w-full text-left px-4 py-3 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] transition-colors flex items-center gap-3 active:scale-[0.98]"
                                    >
                                        <div className="w-8 h-8 bg-[#F4EBE1] dark:bg-[#3A3734] rounded-[10px] flex items-center justify-center text-[1.1rem] shrink-0">
                                            {j.avatar || '🚀'}
                                        </div>
                                        <span className="text-[1rem] font-bold text-[#1A1A1A] dark:text-white truncate">{j.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* GHI CHÚ */}
                    <div>
                        <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">
                            Ghi chú & Kỷ niệm
                        </label>
                        <div className="relative">
                            <textarea 
                                value={caption} 
                                onChange={e => setCaption(e.target.value)} 
                                placeholder="Chia sẻ câu chuyện của bạn..." 
                                className="w-full bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] rounded-[24px] p-5 text-[1rem] font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors min-h-[120px] resize-none shadow-sm" 
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-3">
                                <span className="text-[0.75rem] font-extrabold text-[#A09D9A]">{caption.length}/2200</span>
                                <button 
                                    onClick={() => { setEmojiTarget('caption'); setShowEmojiPicker(!showEmojiPicker); }} 
                                    className="p-2 bg-white dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] hover:text-[#1A1A1A] dark:hover:text-white rounded-[14px] shadow-sm border border-[#D6CFC7]/50 dark:border-transparent transition-all active:scale-95"
                                >
                                    <Smile size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {showEmojiPicker && emojiTarget === 'caption' && (
                            <div className="absolute right-6 mt-2 z-[60] shadow-[0_16px_40px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden border border-[#D6CFC7]/50 dark:border-[#3A3734] bg-white dark:bg-[#1A1A1A] animate-in fade-in slide-in-from-top-2">
                                <EmojiPicker onEmojiClick={handleEmojiSelect} theme={appTheme === 'dark' ? Theme.DARK : Theme.LIGHT} width={300} height={350} previewConfig={{ showPreview: false }} />
                            </div>
                        )}
                    </div>

                    {/* VỊ TRÍ */}
                    <div className="relative z-20" ref={locationContainerRef}>
                        <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">
                            Vị trí
                        </label>
                        <div className="flex items-center gap-3 bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] focus-within:border-[#1A1A1A] dark:focus-within:border-white rounded-[20px] px-5 h-[56px] transition-all shadow-sm">
                            <MapPin size={20} strokeWidth={2.5} className={latitude ? "text-blue-500 shrink-0" : "text-[#8A8580] dark:text-[#A09D9A] shrink-0"} />
                            <div className="flex-1 relative">
                                <input 
                                    value={locationSearch} 
                                    onChange={handleLocationInputChange} 
                                    placeholder="Tìm kiếm địa điểm..." 
                                    className="w-full bg-transparent text-[1rem] font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] focus:outline-none py-1" 
                                />
                            </div>
                            {isSearchingLocation ? <Loader2 size={18} className="text-[#8A8580] animate-spin shrink-0" /> : (
                                <button onClick={handleAutoLocate} disabled={isLocating} className="p-2 rounded-[14px] bg-white dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] hover:text-[#1A1A1A] dark:hover:text-white shadow-sm border border-[#D6CFC7]/50 dark:border-transparent transition-all active:scale-95 shrink-0">
                                    {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} strokeWidth={2.5} />}
                                </button>
                            )}
                        </div>

                        {locationSuggestions.length > 0 && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#3A3734] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar z-50 animate-in fade-in zoom-in-95 p-2">
                                {locationSuggestions.map((suggestion, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleSelectSuggestion(suggestion)} 
                                        className="w-full text-left px-4 py-3 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] transition-colors flex items-start gap-3 active:scale-[0.98]"
                                    >
                                        <MapPin size={18} strokeWidth={2.5} className="text-[#8A8580] dark:text-[#A09D9A] mt-0.5 shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[0.95rem] font-bold text-[#1A1A1A] dark:text-white truncate">{suggestion.name || suggestion.display_name.split(',')[0]}</span>
                                            <span className="text-[0.75rem] font-semibold text-[#8A8580] dark:text-[#A09D9A] truncate">{suggestion.display_name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* HOẠT ĐỘNG */}
                    <div className="space-y-4">
                        <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block pl-1">
                            Gắn thẻ hoạt động
                        </label>

                        <div className="flex flex-wrap gap-2.5">
                            {ACTIVITY_PRESETS.map((item) => (
                                <button 
                                    key={item.type} 
                                    onClick={() => { setSelectedActivity(item); setCustomContext(''); }}
                                    className={cn(
                                        "px-4 h-[44px] rounded-[16px] text-[0.95rem] font-bold flex items-center gap-2 transition-all active:scale-95 border",
                                        (!customContext && selectedActivity.type === item.type)
                                        ? "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] border-transparent shadow-[0_6px_16px_rgba(0,0,0,0.12)] -translate-y-0.5"
                                        : "bg-[#F4EBE1]/50 dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#3A3734] border-[#D6CFC7]/50 dark:border-transparent"
                                    )}
                                >
                                    <span className="text-[1.1rem]">{item.emoji}</span> {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => { setEmojiTarget('activity'); setShowEmojiPicker(!showEmojiPicker); }}
                                className="w-[52px] h-[52px] rounded-[16px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] hover:text-[#1A1A1A] dark:hover:text-white transition-colors flex items-center justify-center shrink-0"
                            >
                                <Smile size={22} strokeWidth={2.5} />
                            </button>
                            <input 
                                value={customContext} 
                                onChange={e => setCustomContext(e.target.value)} 
                                placeholder="Hoạt động khác (VD: Đọc sách)" 
                                className="flex-1 h-[52px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] focus:border-[#1A1A1A] dark:focus:border-white rounded-[16px] px-5 text-[1rem] font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] outline-none transition-all shadow-sm"
                            />
                        </div>

                        {showEmojiPicker && emojiTarget === 'activity' && (
                            <div className="absolute right-6 mt-2 z-[60] shadow-[0_16px_40px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden border border-[#D6CFC7]/50 dark:border-[#3A3734] bg-white dark:bg-[#1A1A1A] animate-in fade-in slide-in-from-top-2">
                                <EmojiPicker onEmojiClick={handleEmojiSelect} theme={appTheme === 'dark' ? Theme.DARK : Theme.LIGHT} width={300} height={350} previewConfig={{ showPreview: false }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};