import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Leaf, Star, Check, ChevronDown, Package } from 'lucide-react';
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

interface FormValues extends Omit<CreateJourneyRequest, 'endDate'> {
    endDate?: string;
    duration: number;
}

export const CreateJourneyModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, defaultBoxId }) => {
  const { theme: appTheme } = useTheme();
  
  const [showCustomIconForm, setShowCustomIconForm] = useState(false);
  const [showBoxDropdown, setShowBoxDropdown] = useState(false);
  
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
      startDate: todayStr, 
      duration: 30,        
      visibility: JourneyVisibility.PUBLIC,
      requireApproval: true,
      boxId: defaultBoxId,
      themeColor: '/themes/bg (1).jpg', 
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
            
            if (defaultBoxId && boxes.length > 0) {
                const defaultBox = boxes.find(b => b.id === defaultBoxId);
                if (defaultBox) {
                    setSelectedBox(defaultBox);
                    setValue('boxId', defaultBox.id, { shouldValidate: true });
                    return;
                }
            }
            
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
  const isFormValid = isValid && currentBoxId && currentDuration >= 1 && currentDuration <= 30;

  // [ĐÃ THÊM] Hàm xử lý render Avatar thông minh (Phân biệt Link Ảnh và Emoji)
  const renderBoxAvatar = (avatarStr: string | null | undefined, sizeIcon: string, sizeText: string) => {
      if (!avatarStr) return <Package className={cn("text-zinc-500", sizeIcon)} />;
      
      // Nếu là một URL (bắt đầu bằng http, / hoặc blob:) -> Render thẻ <img>
      if (avatarStr.startsWith('http') || avatarStr.startsWith('/') || avatarStr.startsWith('blob:')) {
          return <img src={avatarStr} alt="box-avatar" className="w-full h-full object-cover rounded-full" />;
      }
      
      // Còn lại coi như là Text/Emoji -> Render thẻ <span>
      return <span className={sizeText}>{avatarStr}</span>;
  };

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
         <div className="mt-auto sm:my-auto relative z-10 w-full max-w-[460px] mx-auto min-h-[85vh] sm:min-h-0 flex flex-col px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-8">
             
            <div className="flex-1 flex flex-col h-full relative z-10 space-y-8">
                
                {/* HEADER */}
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onClose} className="text-[32px] text-black dark:text-white hover:scale-110 transition-all active:scale-90 font-sans leading-none pb-1 mt-1">
                        &lt;
                    </button>
                    <h2 className="text-black dark:text-white text-[32px] leading-tight font-normal transition-colors">New Journey</h2>
                </div>

                <div className="space-y-6">
                    {/* CHỌN BOX */}
                    <div className="relative" ref={boxDropdownRef}>
                        <label className="text-zinc-500 dark:text-zinc-400 text-sm font-bold block mb-2 transition-colors">Add to Box</label>
                        <button 
                            type="button" 
                            onClick={() => setShowBoxDropdown(!showBoxDropdown)}
                            className="w-full flex items-center justify-between bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                        >
                            <span className={cn("font-medium transition-colors flex items-center gap-2", selectedBox ? "text-black dark:text-white" : "text-zinc-400")}>
                                {selectedBox ? (
                                    <>
                                        <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                            {/* SỬ DỤNG HÀM RENDER MỚI */}
                                            {renderBoxAvatar(selectedBox.avatar, "w-3 h-3", "text-xs")}
                                        </div>
                                        {selectedBox.name}
                                    </>
                                ) : "Select a Box..."}
                            </span>
                            <ChevronDown className="w-5 h-5 text-zinc-500 transition-colors" />
                        </button>

                        {showBoxDropdown && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full max-h-[250px] overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95">
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
                                                    selectedBox?.id === box.id ? "bg-black/5 dark:bg-white/10" : "hover:bg-zinc-50 dark:hover:bg-white/5"
                                                )}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                                    {/* SỬ DỤNG HÀM RENDER MỚI */}
                                                    {renderBoxAvatar(box.avatar, "w-4 h-4", "text-lg")}
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

                    {/* NAME */}
                    <div>
                        <label className="text-zinc-500 dark:text-zinc-400 text-sm font-bold block mb-2 transition-colors">Journey Name</label>
                        <input 
                            className="w-full h-14 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600 font-sans font-medium transition-all" 
                            placeholder="e.g Da Nang trip..." 
                            {...register('name', { required: true })}
                        />
                    </div>

                    {/* DATES */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-zinc-500 dark:text-zinc-400 text-sm font-bold block mb-2 transition-colors">Start date (Today)</label>
                            <input 
                                type="date" 
                                readOnly
                                className="w-full h-14 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 text-zinc-500 outline-none font-sans font-medium text-sm transition-colors cursor-not-allowed" 
                                {...register('startDate')}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-zinc-500 dark:text-zinc-400 text-sm font-bold block mb-2 transition-colors">Duration (Max 30 days)</label>
                            <input 
                                type="number" 
                                min="1"
                                max="30"
                                className="w-full h-14 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600 font-sans font-medium text-sm transition-colors" 
                                {...register('duration', { required: true, min: 1, max: 30, valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    {/* ICON */}
                    <div>
                        <label className="text-zinc-500 dark:text-zinc-400 text-sm font-bold block mb-2 transition-colors">Icon</label>
                        <div className="flex flex-wrap gap-2.5 relative">
                            {renderIcons.map(i => (
                                <button
                                key={i.id}
                                type="button"
                                onClick={() => setValue('avatar', i.icon)}
                                className={cn(
                                    "px-4 h-11 rounded-2xl text-sm transition-all flex items-center justify-center border font-sans font-medium",
                                    watch('avatar') === i.icon 
                                    ? "bg-black dark:bg-white text-white dark:text-black border-transparent scale-105 shadow-md" 
                                    : "bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10"
                                )}
                                >
                                {i.label}
                                </button>
                            ))}
                            
                            <div className="relative">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCustomIconForm(!showCustomIconForm)}
                                    className="px-4 h-11 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-zinc-700 dark:text-zinc-300 font-sans font-medium text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                                >
                                    Other...
                                </button>

                                {showCustomIconForm && (
                                    <div ref={emojiPickerRef} className="absolute bottom-[calc(100%+8px)] left-0 sm:left-auto sm:right-0 w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2">
                                        <h4 className="text-sm font-bold text-black dark:text-white mb-2 font-sans">Create custom tag</h4>
                                        <div className="flex gap-2 mb-3">
                                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-lg shrink-0 cursor-help font-sans" title="Emoji">
                                                {customEmoji}
                                            </div>
                                            <input 
                                                autoFocus
                                                value={customLabel}
                                                onChange={e => setCustomLabel(e.target.value)}
                                                placeholder="Tag name"
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
                </div>

                {/* NÚT TẠO */}
                <div className="mt-auto relative z-10 pt-8 pb-4">
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isFormValid || isCreating}
                        className={cn(
                            "w-full h-14 rounded-2xl shadow-md text-white dark:text-black text-[20px] font-sans font-bold flex items-center justify-center gap-2 transition-all",
                            (!isFormValid || isCreating)
                            ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none" 
                            : "bg-black dark:bg-white hover:scale-[1.02] active:scale-95"
                        )}
                    >
                        {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                        Create Journey
                    </button>
                    {!currentBoxId && (
                        <p className="text-red-500 font-sans font-medium text-sm mt-4 flex items-center justify-center gap-1 text-center">
                            Vui lòng chọn Box (Không gian) để tiếp tục.
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