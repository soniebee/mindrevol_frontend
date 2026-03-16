import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Leaf, Star, Sparkles, Check, ChevronDown, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { CreateJourneyRequest, JourneyType, JourneyVisibility } from '../types';
import { useCreateJourney } from '../hooks/useCreateJourney';
import { boxService } from '@/modules/box/services/box.service';
import { BoxResponse } from '@/modules/box/types';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBoxId?: string; 
}

// Lấy ngày hôm nay chuẩn định dạng YYYY-MM-DD
const getLocalISODate = () => {
    const date = new Date();
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
};

const todayStr = getLocalISODate();

const DEFAULT_ICONS = [
  { id: 'cozy', label: '🌿 Cozy', icon: '🌿' },
  { id: 'trip', label: '✈️ Trip', icon: '✈️' },
  { id: 'picnic', label: '🍓 Picnic', icon: '🍓' },
  { id: 'food', label: '🍜 Food', icon: '🍜' },
];

// Form Interface có thêm duration
interface FormValues extends Omit<CreateJourneyRequest, 'endDate'> {
    endDate?: string;
    duration: number;
}

export const CreateJourneyModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, defaultBoxId }) => {
  const { theme: appTheme } = useTheme();
  
  const [showCustomIconForm, setShowCustomIconForm] = useState(false);
  const [showBoxDropdown, setShowBoxDropdown] = useState(false);
  
  // Custom Icon dùng duy nhất 1 Object để ghi đè
  const [customEmoji, setCustomEmoji] = useState('✨');
  const [customLabel, setCustomLabel] = useState('');
  const [customIcon, setCustomIcon] = useState<{id: string, label: string, icon: string} | null>(null);

  const [myBoxes, setMyBoxes] = useState<BoxResponse[]>([]);
  const [selectedBox, setSelectedBox] = useState<BoxResponse | null>(null);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const boxDropdownRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      type: JourneyType.HABIT,
      startDate: todayStr, // Khóa cứng hôm nay
      duration: 30,        // Mặc định 30 ngày
      visibility: JourneyVisibility.PUBLIC,
      requireApproval: true,
      boxId: defaultBoxId,
      themeColor: '/themes/bg (1).jpg', // Gắn mặc định 1 theme để Backend không báo lỗi
      avatar: '🌿'
    }
  });

  const { createJourney, isCreating } = useCreateJourney(() => {
    onSuccess();
    onClose();
  });

  useEffect(() => {
    if (isOpen) {
        boxService.getMyBoxes(0, 100).then(res => {
            const boxes = res.content || [];
            setMyBoxes(boxes);
            
            // Nếu có defaultBoxId
            if (defaultBoxId && boxes.length > 0) {
                const defaultBox = boxes.find(b => b.id === defaultBoxId);
                if (defaultBox) {
                    setSelectedBox(defaultBox);
                    setValue('boxId', defaultBox.id, { shouldValidate: true });
                    return;
                }
            }
            
            // [BẮT BUỘC CHỌN BOX] Tự động set Box đầu tiên nếu user có box
            if (boxes.length > 0) {
                setSelectedBox(boxes[0]);
                setValue('boxId', boxes[0].id, { shouldValidate: true });
            }
        }).catch(console.error);
    }
  }, [isOpen, defaultBoxId, setValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowCustomIconForm(false);
      }
      if (boxDropdownRef.current && !boxDropdownRef.current.contains(e.target as Node)) {
        setShowBoxDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Xử lý cộng ngày khi Submit
  const onSubmit = (data: FormValues) => {
    const start = new Date(data.startDate);
    start.setDate(start.getDate() + Number(data.duration));
    const endStr = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    
    const payload: CreateJourneyRequest = {
        ...data,
        endDate: endStr
    };
    createJourney(payload);
  };

  // Tạo Icon sẽ ghi đè thẻ cũ
  const handleCreateCustomIcon = () => {
    const labelText = customLabel.trim() || 'Custom';
    setCustomIcon({ id: `custom_icon`, label: `${customEmoji} ${labelText}`, icon: customEmoji });
    setValue('avatar', customEmoji);
    setShowCustomIconForm(false);
    setCustomLabel('');
  };

  const handleSelectBox = (box: BoxResponse) => {
      setSelectedBox(box);
      setValue('boxId', box.id, { shouldValidate: true });
      setShowBoxDropdown(false);
  };

  const renderIcons = customIcon ? [...DEFAULT_ICONS, customIcon] : DEFAULT_ICONS;
  
  const currentBoxId = watch('boxId');
  const currentDuration = watch('duration');
  // Chặn Submit nếu không có Box hoặc sai số ngày
  const isFormValid = isValid && currentBoxId && currentDuration >= 1 && currentDuration <= 30;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] transition-colors duration-500 flex flex-col"
      style={{ fontFamily: '"Jua", sans-serif' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
         <div className="w-full max-w-[1000px] h-full relative">
            <div className="absolute -top-10 -left-20 w-[400px] h-[300px] bg-amber-200/80 dark:bg-amber-600/10 blur-[100px] rounded-full transition-colors duration-500" />
            <div className="absolute top-[50%] -right-20 w-[400px] h-[400px] bg-rose-200/60 dark:bg-rose-600/10 blur-[120px] rounded-full transition-colors duration-500" />
            <Leaf className="absolute right-[10%] top-[15%] w-16 h-16 text-green-300 dark:text-green-500/30 opacity-50 rotate-12 transition-colors duration-500" />
            <Star className="absolute left-[10%] top-[45%] w-12 h-12 text-amber-300 dark:text-amber-500/30 opacity-50 -rotate-12 transition-colors duration-500" />
         </div>
      </div>

      <div className="relative min-h-full w-full flex flex-col items-center sm:py-12 pt-20 pb-4">
         <div className="mt-auto sm:my-auto relative z-10 w-full max-w-[460px] mx-auto min-h-[85vh] sm:min-h-0 flex flex-col px-6 py-8 bg-white/60 sm:bg-transparent dark:bg-[#121212]/80 dark:sm:bg-transparent rounded-t-[40px] sm:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-none backdrop-blur-xl sm:backdrop-blur-none transition-colors duration-300">
             
            <div className="flex-1 flex flex-col h-full relative z-10 animate-in slide-in-from-bottom-4 fade-in duration-300">
                
                {/* HEADER & CHỌN BOX */}
                <div className="flex items-start gap-4 mb-8 pt-2">
                    <button type="button" onClick={onClose} className="text-[32px] text-black dark:text-white hover:scale-110 transition-all active:scale-90 font-sans leading-none pb-1 mt-1">
                        &lt;
                    </button>
                    <div className="flex flex-col flex-1">
                        <h2 className="text-black dark:text-white text-[28px] leading-tight font-normal transition-colors">New Journey</h2>
                        
                        <div className="relative mt-1.5" ref={boxDropdownRef}>
                            <button 
                                type="button" 
                                onClick={() => setShowBoxDropdown(!showBoxDropdown)}
                                className="flex items-center gap-1.5 text-base px-2.5 py-1.5 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors group border border-transparent hover:border-black/10 dark:hover:border-white/10"
                            >
                                <span className="text-black dark:text-zinc-400 transition-colors">Add to:</span>
                                <span className={cn("font-bold transition-colors flex items-center gap-1", selectedBox ? "text-amber-700 dark:text-amber-500" : "text-red-500")}>
                                    {selectedBox ? selectedBox.name : "Select a Box..."}
                                    <ChevronDown className="w-3.5 h-3.5 mt-0.5 text-black dark:text-zinc-500 group-hover:text-amber-700 transition-colors" />
                                </span>
                            </button>

                            {showBoxDropdown && (
                                <div className="absolute top-full left-0 mt-1 w-[280px] max-h-[300px] overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95">
                                    <div className="p-2 flex flex-col gap-1">
                                        {myBoxes.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400 font-sans">
                                                Bạn chưa có Không gian (Box) nào. Vui lòng tạo Box trước!
                                            </div>
                                        ) : (
                                            myBoxes.map(box => (
                                                <button 
                                                    key={box.id}
                                                    type="button"
                                                    onClick={() => handleSelectBox(box)}
                                                    className={cn(
                                                        "flex items-center gap-3 w-full p-2.5 rounded-xl text-left transition-colors",
                                                        selectedBox?.id === box.id ? "bg-amber-50 dark:bg-amber-900/20" : "hover:bg-zinc-50 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                                        {box.avatar ? <span className="text-lg">{box.avatar}</span> : <Package className="w-4 h-4 text-zinc-500" />}
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[15px] font-bold text-black dark:text-white leading-tight truncate">{box.name}</span>
                                                        <span className="text-xs text-zinc-500 truncate">{box.memberCount} thành viên</span>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BLOCK 1: NAME & DURATION */}
                <div className="bg-rose-50 dark:bg-[#1A1012] rounded-[24px] p-5 mb-6 shadow-sm dark:shadow-none border border-rose-100 dark:border-rose-900/30 relative transition-colors duration-300">
                    <Sparkles className="absolute top-3 right-3 w-5 h-5 text-rose-300 dark:text-rose-800 opacity-60 pointer-events-none" />

                    <h3 className="text-black dark:text-rose-100 text-xl mb-2 relative z-10 transition-colors">Journey name</h3>
                    <input 
                        className="w-full h-12 bg-white dark:bg-[#120a0b] border border-transparent dark:border-rose-900/50 rounded-xl px-4 mb-5 text-zinc-800 dark:text-rose-50 placeholder:text-zinc-400 dark:placeholder:text-rose-900/60 outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-800 font-sans font-medium transition-all shadow-sm dark:shadow-none relative z-10" 
                        placeholder="e.g Da Nang trip..." 
                        {...register('name', { required: true })}
                    />

                    <h3 className="text-black dark:text-rose-100 text-xl mb-2 relative z-10 transition-colors">Dates</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10">
                        <div className="flex-1">
                            <label className="text-stone-500 dark:text-rose-200/50 text-xs block mb-1.5 ml-1 transition-colors">Start date (Today)</label>
                            <input 
                                type="date" 
                                readOnly
                                className="w-full h-11 bg-white/50 dark:bg-[#120a0b]/50 border border-transparent dark:border-rose-900/30 rounded-xl px-3 text-zinc-500 dark:text-rose-100/40 outline-none font-sans font-medium text-sm shadow-sm dark:shadow-none transition-colors cursor-not-allowed pointer-events-none" 
                                {...register('startDate')}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-stone-500 dark:text-rose-200/50 text-xs block mb-1.5 ml-1 transition-colors">Duration (Max 30)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    min="1"
                                    max="30"
                                    className="w-full h-11 bg-white dark:bg-[#120a0b] border border-transparent dark:border-rose-900/50 rounded-xl pl-4 pr-12 text-zinc-800 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-800 font-sans font-medium text-sm shadow-sm dark:shadow-none transition-colors" 
                                    {...register('duration', { required: true, min: 1, max: 30, valueAsNumber: true })}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400 dark:text-rose-900/60 pointer-events-none">
                                    days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOCK 2: ICON */}
                <div className="bg-green-50 dark:bg-[#0D1711] rounded-[24px] p-5 mb-8 shadow-sm dark:shadow-none border border-green-100 dark:border-emerald-900/30 relative transition-colors duration-300">
                    <Leaf className="absolute right-4 bottom-4 w-12 h-12 text-green-200 dark:text-emerald-900/50 opacity-50 -rotate-12 pointer-events-none transition-colors" />
                    <Star className="absolute right-12 top-4 w-6 h-6 text-green-200 dark:text-emerald-900/50 opacity-50 pointer-events-none transition-colors" />

                    <h3 className="text-black dark:text-emerald-100 text-xl relative z-10 transition-colors">Icon</h3>
                    <p className="text-lime-900/60 dark:text-emerald-200/50 text-xs mb-3 relative z-10 transition-colors">Pick an icon and mood</p>
                    
                    <div className="flex flex-wrap gap-2.5 relative z-20">
                        {renderIcons.map(i => (
                            <button
                            key={i.id}
                            type="button"
                            onClick={() => setValue('avatar', i.icon)}
                            className={cn(
                                "px-3 h-9 rounded-xl text-sm transition-all shadow-sm dark:shadow-none flex items-center justify-center border",
                                watch('avatar') === i.icon 
                                ? "bg-white dark:bg-emerald-900/40 text-slate-800 dark:text-white ring-2 ring-orange-400 dark:ring-emerald-500 border-transparent scale-105 font-bold" 
                                : "bg-white dark:bg-[#08100B] text-slate-800 dark:text-emerald-100/70 border-transparent dark:border-emerald-900/30 hover:bg-zinc-50 dark:hover:bg-emerald-900/20"
                            )}
                            >
                            {i.label}
                            </button>
                        ))}
                        
                        <div className="relative">
                            <button 
                                type="button" 
                                onClick={() => setShowCustomIconForm(!showCustomIconForm)}
                                className="px-3 h-9 bg-white dark:bg-[#08100B] border border-transparent dark:border-emerald-900/30 rounded-xl text-slate-800 dark:text-emerald-100/70 text-sm shadow-sm dark:shadow-none hover:bg-zinc-50 dark:hover:bg-emerald-900/20 transition-all"
                            >
                                Other...
                            </button>

                            {showCustomIconForm && (
                                <div ref={emojiPickerRef} className="absolute bottom-12 left-0 sm:left-auto sm:right-0 w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2">
                                    <h4 className="text-sm font-bold text-black dark:text-white mb-2">Create custom tag</h4>
                                    <div className="flex gap-2 mb-3">
                                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-lg shrink-0 cursor-help" title="Emoji">
                                            {customEmoji}
                                        </div>
                                        <input 
                                            autoFocus
                                            value={customLabel}
                                            onChange={e => setCustomLabel(e.target.value)}
                                            placeholder="Tag name (e.g. Study)"
                                            className="flex-1 h-10 min-w-0 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-3 outline-none text-sm text-black dark:text-white placeholder:text-zinc-400 font-sans"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleCreateCustomIcon}
                                            disabled={!customLabel.trim()}
                                            className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="w-full h-[220px] overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                                        <EmojiPicker 
                                            theme={appTheme === 'dark' ? Theme.DARK : Theme.LIGHT} 
                                            onEmojiClick={e => setCustomEmoji(e.emoji)} 
                                            width="100%" 
                                            height="100%" 
                                            searchDisabled 
                                            skinTonesDisabled 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* NÚT TẠO */}
                <div className="mt-auto relative z-10 pt-2 pb-4">
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isFormValid || isCreating}
                        className={cn(
                            "w-full h-14 rounded-2xl shadow-md text-white dark:text-black text-[22px] flex items-center justify-center gap-2 transition-all",
                            (!isFormValid || isCreating)
                            ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none" 
                            : "bg-orange-400 dark:bg-amber-400 hover:scale-[1.02] active:scale-95 hover:bg-orange-500 dark:hover:bg-amber-500"
                        )}
                    >
                        {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                        Create Journey
                    </button>
                    {!currentBoxId && (
                        <p className="text-red-500 font-sans font-medium text-xs mt-3 flex items-center justify-center gap-1 text-center">
                            Vui lòng chọn một Không gian để tiếp tục.
                        </p>
                    )}
                    {currentBoxId && (
                        <p className="text-stone-500 dark:text-zinc-500 text-xs mt-3 flex items-center justify-center gap-1 text-center transition-colors">
                            We’ll notify your box members ✨
                        </p>
                    )}
                </div>
            </div>
         </div>
      </div>
    </div>,
    document.body
  );
};