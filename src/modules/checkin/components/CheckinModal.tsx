import React from 'react';
import { X, Loader2, MapPin, Smile, ChevronDown } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Cropper from 'react-easy-crop';
import { useCheckinModal, ACTIVITY_PRESETS } from '../hooks/useCheckinModal'; 

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  journeyId: string;
  onSuccess: () => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = (props) => {
  const { isOpen, onClose, file } = props;

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

  // [THỦ THUẬT HTML5]: Cắt video phát lặp lại trong đoạn startTime đến startTime + 3s
  const trimmedVideoUrl = isVideo && previewUrl ? `${previewUrl}#t=${startTime},${startTime + 3}` : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300 px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[900px] h-[85vh] max-h-[700px] bg-[#1c1c1e] rounded-2xl overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10 z-10">
        
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0 bg-[#121212]">
          <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
             <X size={24} strokeWidth={1.5}/>
          </button>
          <h2 className="text-white font-bold text-base">Tạo bài viết mới</h2>
          <button 
            onClick={handleSubmit} disabled={isSubmitting || !selectedJourneyId}
            className="text-blue-500 font-bold hover:text-blue-400 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Chia sẻ"}
          </button>
        </div>

        {/* Body 2 Cột */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            
            {/* CỘT TRÁI: ẢNH VÀ CROP (60%) */}
            <div className="w-full md:w-[55%] h-[50vh] md:h-full bg-black relative group flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
                {previewUrl ? (
                    <Cropper
                        // Nếu là ảnh thì chuyền vào image, nếu là video thì chuyền vào video
                        image={!isVideo ? previewUrl : undefined} 
                        video={isVideo ? trimmedVideoUrl : undefined} 
                        crop={crop} 
                        zoom={zoom} 
                        aspect={1} /* Mặc định khóa cứng Tỷ lệ 1:1 (Vuông) */
                        onCropChange={setCrop} 
                        onCropComplete={onCropComplete} 
                        onZoomChange={setZoom}
                        classes={{ containerClassName: 'bg-black' }}
                    />
                ) : (
                    <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                )}

                {/* THANH TRƯỢT ZOOM (Cho phép zoom cả ảnh lẫn video) */}
                <div className="absolute top-4 left-4 w-[160px] z-30 bg-black/50 backdrop-blur-md rounded-full px-3 py-2.5 border border-white/10 flex items-center shadow-lg pointer-events-auto">
                    <span className="text-white/70 text-[10px] font-bold mr-2 uppercase tracking-wider">Zoom</span>
                    <input 
                        type="range" value={zoom} min={1} max={3} step={0.05}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                    />
                </div>

                {/* [THÊM MỚI] THANH CHỌN THỜI GIAN (DÀNH RIÊNG CHO VIDEO DÀI HƠN 3S) */}
                {isVideo && videoDuration > 3 && (
                    <div className="absolute top-16 left-4 w-[200px] z-30 bg-black/60 backdrop-blur-md rounded-full px-3 py-2.5 border border-white/10 flex items-center gap-2 shadow-lg pointer-events-auto">
                        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Đoạn (3s)</span>
                        <input 
                            type="range" min={0} max={Math.max(0, videoDuration - 3)} step={0.1}
                            value={startTime}
                            onChange={(e) => setStartTime(Number(e.target.value))}
                            className="flex-1 accent-amber-500 cursor-pointer"
                        />
                    </div>
                )}

                {/* OVERLAY TAGS & CAPTION (PREVIEW NHƯ LOCKET) */}
                <div className="absolute bottom-4 left-4 right-12 z-20 pointer-events-none flex flex-col gap-2 items-start">
                    <div className="flex flex-wrap gap-1.5 pointer-events-auto">
                        {locationSearch && (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                                <MapPin className="w-3 h-3 text-white" />
                                <span className="text-[11px] font-bold tracking-wide truncate max-w-[120px]">{locationSearch}</span>
                            </div>
                        )}
                        {(customContext || selectedActivity.type !== 'DEFAULT') && (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-sm">
                                <span className="text-[11px] font-bold tracking-wide truncate max-w-[150px]">
                                    {customContext ? customContext : `${selectedActivity.emoji} ${selectedActivity.label}`}
                                </span>
                            </div>
                        )}
                    </div>
                    {caption && (
                        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 shadow-inner inline-block pointer-events-auto">
                            <p className="text-[14px] text-white font-medium leading-relaxed whitespace-pre-line line-clamp-3">
                                {caption}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: NỘI DUNG VÀ SETTINGS (45%) */}
            <div className="w-full md:w-[45%] h-full bg-[#121212] overflow-y-auto custom-scrollbar flex flex-col pb-10 md:pb-0" ref={pickerRef}>
                
                {/* Hành trình */}
                <div className="p-4 border-b border-white/10 z-10" ref={journeyDropdownRef}>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Đăng vào Hành trình</span>
                    <div className="relative">
                        <button onClick={() => setIsJourneyDropdownOpen(!isJourneyDropdownOpen)} className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition-colors focus:ring-1 focus:ring-blue-500">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {selectedJourneyId ? (() => {
                                    const j = activeJourneys.find(x => x.id === selectedJourneyId);
                                    return j ? (<><span className="text-lg leading-none">{j.avatar || '🚀'}</span><span className="text-sm text-white font-bold truncate">{j.name}</span></>) : <span className="text-sm text-zinc-500">Đang tải...</span>;
                                })() : <span className="text-sm text-zinc-500">Vui lòng chọn hành trình...</span>}
                            </div>
                            <ChevronDown size={18} className="text-zinc-500" />
                        </button>
                        {isJourneyDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                                {activeJourneys.map(j => (
                                    <button key={j.id} onClick={() => { setSelectedJourneyId(j.id); setIsJourneyDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0">
                                        <span className="text-sm">{j.avatar || '🚀'}</span>
                                        <span className="text-sm font-bold text-white truncate">{j.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ghi chú */}
                <div className="p-4 border-b border-white/10 relative">
                    <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Viết chú thích..." className="w-full bg-transparent text-[15px] text-white placeholder:text-zinc-500 focus:outline-none resize-none min-h-[80px]" />
                    <div className="flex items-center justify-between mt-2">
                        <button 
                            onClick={() => { setEmojiTarget('caption'); setShowEmojiPicker(!showEmojiPicker); }} 
                            className="p-1.5 -ml-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Smile size={20} />
                        </button>
                        <span className="text-xs text-zinc-600">{caption.length}/2200</span>
                    </div>

                    {showEmojiPicker && emojiTarget === 'caption' && (
                        <div className="absolute top-full left-4 mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                            <EmojiPicker onEmojiClick={handleEmojiSelect} theme={Theme.DARK} width={280} height={320} previewConfig={{ showPreview: false }} />
                        </div>
                    )}
                </div>

                {/* Vị trí */}
                <div className="relative p-4 border-b border-white/10 bg-zinc-900/20 focus-within:bg-zinc-800/50 transition-colors z-20" ref={locationContainerRef}>
                    <div className="flex items-center gap-3">
                        <MapPin size={20} className={latitude ? "text-blue-500 shrink-0" : "text-zinc-400 shrink-0"} />
                        <div className="flex-1 relative">
                            <input value={locationSearch} onChange={handleLocationInputChange} placeholder="Tìm kiếm địa điểm..." className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none py-1" />
                        </div>
                        {isSearchingLocation ? <Loader2 size={16} className="text-zinc-400 animate-spin shrink-0" /> : (
                            <button onClick={handleAutoLocate} disabled={isLocating} className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors shrink-0">
                                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                            </button>
                        )}
                    </div>
                    {locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c1e] border border-zinc-700 rounded-xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar z-50">
                            {locationSuggestions.map((suggestion, idx) => (
                                <button key={idx} onClick={() => handleSelectSuggestion(suggestion)} className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-start gap-3 border-b border-white/5 last:border-0">
                                    <MapPin size={16} className="text-zinc-500 mt-1 shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-white truncate">{suggestion.name || suggestion.display_name.split(',')[0]}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Hoạt động */}
                <div className="p-4 space-y-4 relative">
                    <span className="text-sm font-bold text-zinc-300">Gắn thẻ hoạt động</span>

                    <div className="flex flex-wrap gap-2">
                        {ACTIVITY_PRESETS.map((item) => (
                            <button 
                                key={item.type} 
                                onClick={() => { setSelectedActivity(item); setCustomContext(''); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                                    (!customContext && selectedActivity.type === item.type)
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                                }`}
                            >
                                <span>{item.emoji}</span> {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <button 
                            onClick={() => { setEmojiTarget('activity'); setShowEmojiPicker(!showEmojiPicker); }}
                            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Smile size={18} />
                        </button>
                        <input 
                            value={customContext} 
                            onChange={e => setCustomContext(e.target.value)} 
                            placeholder="Hoặc nhập hoạt động khác (Ví dụ: 🎬 Xem phim)" 
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    {showEmojiPicker && emojiTarget === 'activity' && (
                        <div className="absolute top-full left-4 mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                            <EmojiPicker onEmojiClick={handleEmojiSelect} theme={Theme.DARK} width={280} height={320} previewConfig={{ showPreview: false }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};