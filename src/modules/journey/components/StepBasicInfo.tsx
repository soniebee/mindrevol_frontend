import React, { useState, useEffect, useRef } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Globe, Lock, Calendar, CheckCircle2, Package, ChevronDown, Palette } from 'lucide-react';
import EmojiPicker, { Theme, EmojiStyle, EmojiClickData } from 'emoji-picker-react';
import { CreateJourneyRequest, JourneyVisibility } from '../types';
import { cn } from '@/lib/utils';
import { boxService } from '@/modules/box/services/box.service'; 
import { BoxResponse } from '@/modules/box/types';

interface Props {
  register: UseFormRegister<CreateJourneyRequest>;
  errors: FieldErrors<CreateJourneyRequest>;
  watch: UseFormWatch<CreateJourneyRequest>;
  setValue: UseFormSetValue<CreateJourneyRequest>;
}

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const StepBasicInfo: React.FC<Props> = ({ register, errors, watch, setValue }) => {
  const currentVisibility = watch('visibility');
  const currentBoxId = watch('boxId'); 
  const [duration, setDuration] = useState<number>(30);

  // States cho Dropdown Box
  const [boxes, setBoxes] = useState<BoxResponse[]>([]);
  const [isBoxDropdownOpen, setIsBoxDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // States cho Emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const avatar = watch('avatar') || '🚀';
  const themeColor = watch('themeColor') || PRESET_COLORS[0];

  // Xử lý click outside cho cả Dropdown và Emoji
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsBoxDropdownOpen(false);
          }
          if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
              setShowEmojiPicker(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      const fetchBoxes = async () => {
          try {
              const data = await boxService.getMyBoxes(0, 50);
              setBoxes(data.content || []);
          } catch (error) {
              console.error("Lỗi tải danh sách Box", error);
          }
      };
      fetchBoxes();
  }, []);

  const selectedBox = boxes.find(b => b.id === currentBoxId);

  const calculateEndDate = (days: number) => {
      const today = new Date();
      const endDate = new Date(today);
      const daysToAdd = days > 0 ? days - 1 : 0; 
      endDate.setDate(today.getDate() + daysToAdd);
      return endDate;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let days = parseInt(e.target.value);
    if (isNaN(days) || days < 1) days = 1;
    if (days > 30) days = 30;
    
    setDuration(days);
    const endDate = calculateEndDate(days);
    setValue('endDate', endDate.toISOString().split('T')[0], { shouldValidate: true });
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setValue('avatar', emojiData.emoji, { shouldValidate: true });
    setShowEmojiPicker(false);
  };

  const today = new Date();
  const endDatePreview = calculateEndDate(duration);

  useEffect(() => {
      setValue('endDate', endDatePreview.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* 1. TÊN VÀ ICON HÀNH TRÌNH */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Tên & Biểu tượng <span className="text-red-500">*</span></label>
        <div className="flex gap-3">
          
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-[58px] w-[58px] flex items-center justify-center bg-zinc-900/50 border border-zinc-700/50 rounded-2xl text-2xl hover:bg-zinc-800 transition-colors shadow-inner shrink-0"
            >
              {avatar}
            </button>
            {showEmojiPicker && (
              <div className="absolute top-[64px] left-0 z-50 shadow-2xl">
                <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} emojiStyle={EmojiStyle.NATIVE} width={300} height={350} />
              </div>
            )}
          </div>

          <div className="relative group flex-1">
              <input 
                {...register('name', { required: "Vui lòng nhập tên hành trình" })}
                className="w-full h-full bg-zinc-900/50 border border-zinc-700/50 text-white text-lg rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600 shadow-inner"
                placeholder="Đặt tên cho hành trình..."
                autoFocus
              />
          </div>
        </div>
        {errors.name && <p className="text-red-400 text-xs ml-2 font-medium flex items-center gap-1">⚠️ {errors.name.message}</p>}
      </div>

      {/* 2. MÀU SẮC CHỦ ĐẠO */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Màu sắc chủ đạo</label>
        <div className="flex flex-wrap gap-3 p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-2xl shadow-inner">
            {PRESET_COLORS.map(color => (
                <button
                    key={color} 
                    type="button" 
                    onClick={() => setValue('themeColor', color, { shouldValidate: true })}
                    className={`w-8 h-8 rounded-full transition-all duration-200 ${
                        themeColor === color 
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#18181b] border border-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                />
            ))}
            
            {/* Custom Color Picker */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:scale-105 transition-transform group">
                <input 
                    type="color" 
                    value={themeColor} 
                    onChange={(e) => setValue('themeColor', e.target.value, { shouldValidate: true })} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                    <Palette size={14} className="text-zinc-400" />
                </div>
            </div>
        </div>
      </div>

      {/* 3. NÚT CHỌN KHÔNG GIAN (BOX) */}
      <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Gắn vào Không gian</label>
          <input type="hidden" {...register('boxId')} />
          <button
              type="button"
              onClick={() => setIsBoxDropdownOpen(!isBoxDropdownOpen)}
              className="w-full bg-zinc-900/50 border border-zinc-700/50 text-white rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-800/80 transition-colors shadow-inner group"
          >
              <div className="flex items-center gap-3">
                  <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-xl",
                      selectedBox ? "bg-black/20" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-400"
                  )}
                  style={selectedBox ? { borderBottom: `2px solid ${selectedBox.themeColor || '#3b82f6'}` } : {}}
                  >
                      {selectedBox ? selectedBox.avatar || '📦' : <Package size={16} />}
                  </div>
                  <div className="flex flex-col items-start">
                      <span className={cn("text-sm font-bold", selectedBox ? "text-white" : "text-zinc-400")}>
                          {selectedBox ? selectedBox.name : "Không gian chung (Tùy chọn)"}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                          {selectedBox ? "Mọi người trong Box sẽ tự động tham gia" : "Để trống nếu là Hành trình tự do"}
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
                          onClick={() => { setValue('boxId', undefined); setIsBoxDropdownOpen(false); }}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/80 transition-colors text-left group"
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-400">
                                  <Package size={16} />
                              </div>
                              <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">Không gắn vào Không gian nào</span>
                          </div>
                          {!currentBoxId && <CheckCircle2 size={18} className="text-zinc-500" />}
                      </button>

                      {boxes.length > 0 && <div className="h-px w-full bg-zinc-800/50 my-1" />}

                      {boxes.map(box => (
                          <button
                              key={box.id}
                              type="button"
                              onClick={() => { setValue('boxId', box.id); setIsBoxDropdownOpen(false); }}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/80 transition-colors text-left group"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl bg-black/20" style={{ borderBottom: `2px solid ${box.themeColor || '#3b82f6'}` }}>
                                      {box.avatar || '📦'}
                                  </div>
                                  <span className={cn("text-sm font-bold transition-colors", currentBoxId === box.id ? "text-blue-400" : "text-zinc-300 group-hover:text-white")}>
                                      {box.name}
                                  </span>
                              </div>
                              {currentBoxId === box.id && <CheckCircle2 size={18} className="text-blue-500" />}
                          </button>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* 4. THIẾT LẬP THỜI GIAN */}
      <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800 space-y-4 shadow-inner">
          <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Thời gian thực hiện</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-3 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Bắt đầu</span>
                <div className="text-zinc-200 font-medium text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Hôm nay ({today.toLocaleDateString('vi-VN')})
                </div>
                <input type="hidden" {...register('startDate')} />
            </div>

            <div className="relative group">
                <span className="absolute left-3 top-2 text-[10px] text-zinc-500 uppercase font-bold z-10">Kéo dài</span>
                <input 
                  type="number"
                  value={duration}
                  onChange={handleDurationChange}
                  min={1}
                  max={30}
                  className="w-full h-full bg-zinc-800 border border-zinc-700/50 rounded-xl pt-6 pb-2 pl-3 pr-12 text-white font-bold text-lg focus:border-blue-500 focus:bg-zinc-800/80 outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                    <span className="text-xs text-zinc-400 font-medium">Ngày</span>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-xs text-zinc-500">Kết thúc dự kiến:</span>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                  {endDatePreview.toLocaleDateString('vi-VN')}
              </span>
          </div>
          <input type="hidden" {...register('endDate')} />
      </div>

      {/* 5. QUYỀN RIÊNG TƯ */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Quyền riêng tư</label>
        <div className="grid grid-cols-1 gap-3">
          
          <div 
            onClick={() => setValue('visibility', JourneyVisibility.PUBLIC)}
            className={cn(
                "cursor-pointer p-4 rounded-2xl border transition-all relative group flex items-start gap-4",
                currentVisibility === JourneyVisibility.PUBLIC 
                  ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]" 
                  : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
            )}
          >
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                currentVisibility === JourneyVisibility.PUBLIC ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
            )}>
                <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className={cn("font-bold text-sm", currentVisibility === JourneyVisibility.PUBLIC ? "text-blue-400" : "text-zinc-300")}>Công khai</span>
                    {currentVisibility === JourneyVisibility.PUBLIC && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Bất kỳ ai cũng có thể tìm thấy và xem hành trình này. Thành viên có thể mời bạn bè tham gia.
                </p>
            </div>
          </div>

          <div 
            onClick={() => setValue('visibility', JourneyVisibility.PRIVATE)}
            className={cn(
                "cursor-pointer p-4 rounded-2xl border transition-all relative group flex items-start gap-4",
                currentVisibility === JourneyVisibility.PRIVATE 
                  ? "bg-yellow-600/10 border-yellow-500/50 shadow-[0_0_15px_-5px_rgba(234,179,8,0.3)]" 
                  : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
            )}
          >
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                currentVisibility === JourneyVisibility.PRIVATE ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
            )}>
                <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className={cn("font-bold text-sm", currentVisibility === JourneyVisibility.PRIVATE ? "text-yellow-500" : "text-zinc-300")}>Riêng tư</span>
                    {currentVisibility === JourneyVisibility.PRIVATE && <CheckCircle2 className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Chỉ thành viên được duyệt mới có thể xem. Chỉ Admin mới có quyền mời người khác.
                </p>
            </div>
          </div>
        </div>
        <input type="hidden" {...register('visibility')} />
      </div>

    </div>
  );
};