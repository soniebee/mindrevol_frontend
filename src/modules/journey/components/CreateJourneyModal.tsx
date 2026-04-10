import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Check, ChevronDown, Package, X, Sparkles, Globe, Lock } from 'lucide-react';
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
  { id: 'cozy', label: '🌿 Chữa lành', icon: '🌿' },
  { id: 'trip', label: '✈️ Du lịch', icon: '✈️' },
  { id: 'picnic', label: '🍓 Đi chơi', icon: '🍓' },
  { id: 'food', label: '🍜 Ăn uống', icon: '🍜' },
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
        boxService.getMyBoxes('all', '', 0, 100).then(res => {
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
    const labelText = customLabel.trim() || 'Tùy chỉnh';
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

  const renderBoxAvatar = (avatarStr: string | null | undefined, sizeIcon: string, sizeText: string) => {
      if (!avatarStr) return <Package className={cn("text-[#8A8580] dark:text-[#A09D9A]", sizeIcon)} strokeWidth={2.5} />;
      if (avatarStr.startsWith('http') || avatarStr.startsWith('/') || avatarStr.startsWith('blob:')) {
          return <img src={avatarStr} alt="box-avatar" className="w-full h-full object-cover rounded-full" />;
      }
      return <span className={sizeText}>{avatarStr}</span>;
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
        
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
            onClick={onClose}
        />

        <div className="relative w-full md:w-[560px] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col max-h-[92vh] md:max-h-[90vh] animate-in slide-in-from-bottom-1/2 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 overflow-hidden">
            
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0">
                <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
            </div>

            <div className="flex items-center justify-between px-6 md:px-8 py-5 shrink-0 border-b border-[#F4EBE1] dark:border-[#2B2A29]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[1.4rem] md:text-[1.5rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">
                        Hành trình mới
                    </h2>
                </div>
                <button onClick={onClose} className="p-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95">
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-6 space-y-6">
                
                <div className="relative" ref={boxDropdownRef}>
                    <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">
                        Thêm vào Không gian
                    </label>
                    <button 
                        type="button" 
                        onClick={() => setShowBoxDropdown(!showBoxDropdown)}
                        className="w-full h-[56px] flex items-center justify-between bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] rounded-[20px] px-5 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] transition-all"
                    >
                        <span className={cn("font-bold text-[1.05rem] flex items-center gap-3", selectedBox ? "text-[#1A1A1A] dark:text-white" : "text-[#A09D9A]")}>
                            {selectedBox ? (
                                <>
                                    <div className="w-7 h-7 rounded-full bg-white dark:bg-[#3A3734] flex items-center justify-center shrink-0 shadow-sm border border-[#D6CFC7]/50 dark:border-transparent overflow-hidden">
                                        {renderBoxAvatar(selectedBox.avatar, "w-4 h-4", "text-sm")}
                                    </div>
                                    {selectedBox.name}
                                </>
                            ) : "Chọn Không gian..."}
                        </span>
                        <ChevronDown className="w-5 h-5 text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                    </button>

                    {showBoxDropdown && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full max-h-[240px] overflow-y-auto custom-scrollbar bg-white dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#3A3734] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-50 animate-in fade-in zoom-in-95 p-2 flex flex-col gap-1">
                            {myBoxes.length === 0 ? (
                                <div className="p-4 text-center text-[0.95rem] text-[#8A8580] font-semibold">
                                    Bạn chưa có Không gian nào.
                                </div>
                            ) : (
                                myBoxes.map(box => (
                                    <button 
                                        key={box.id}
                                        type="button"
                                        onClick={() => handleSelectBox(box)}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-4 py-3 rounded-[16px] text-left transition-colors active:scale-[0.98]",
                                            selectedBox?.id === box.id ? "bg-[#F4EBE1] dark:bg-[#2B2A29]" : "hover:bg-[#F4EBE1]/50 dark:hover:bg-[#2B2A29]/50"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-[#3A3734] flex items-center justify-center shrink-0 shadow-sm border border-[#D6CFC7]/50 dark:border-transparent overflow-hidden">
                                            {renderBoxAvatar(box.avatar, "w-4 h-4", "text-lg")}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-[1rem] font-bold text-[#1A1A1A] dark:text-white leading-tight truncate">{box.name}</span>
                                            <span className="text-[0.8rem] text-[#8A8580] dark:text-[#A09D9A] truncate font-semibold">{box.memberCount} thành viên</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">
                        Tên Hành trình
                    </label>
                    <input 
                        className="w-full h-[56px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] rounded-[20px] px-5 text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] font-bold text-[1.05rem] outline-none transition-all focus:ring-0 shadow-sm" 
                        placeholder="VD: Chuyến đi Đà Nẵng..." 
                        {...register('name', { required: true })}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-1">
                        <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">Ngày bắt đầu</label>
                        <input 
                            type="date" 
                            readOnly
                            className="w-full h-[56px] bg-[#E2D9CE]/30 dark:bg-[#2B2A29]/30 border border-transparent dark:border-[#2B2A29] rounded-[20px] px-5 text-[#8A8580] dark:text-[#A09D9A] outline-none font-bold text-[1.05rem] transition-colors cursor-not-allowed" 
                            {...register('startDate')}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">Thời lượng (Ngày)</label>
                        <input 
                            type="number" 
                            min="1"
                            max="30"
                            className="w-full h-[56px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] rounded-[20px] px-5 text-[#1A1A1A] dark:text-white outline-none font-bold text-[1.05rem] transition-all shadow-sm" 
                            {...register('duration', { required: true, min: 1, max: 30, valueAsNumber: true })}
                        />
                    </div>
                </div>

                {/* [THÊM MỚI] CỤM QUYỀN RIÊNG TƯ */}
                <div>
                    <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-3 pl-1">
                        Quyền truy cập
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setValue('visibility', JourneyVisibility.PUBLIC, { shouldValidate: true })}
                            className={cn(
                                "p-4 rounded-[24px] border-2 text-left transition-all active:scale-95",
                                watch('visibility') === JourneyVisibility.PUBLIC 
                                    ? "bg-[#1A1A1A] dark:bg-white border-transparent shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-1" 
                                    : "bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border-[#D6CFC7]/50 dark:border-[#3A3734] hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29]"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className={cn("w-5 h-5", watch('visibility') === JourneyVisibility.PUBLIC ? "text-white dark:text-[#1A1A1A]" : "text-blue-500")} strokeWidth={2.5} />
                                <span className={cn("text-[1rem] font-black", watch('visibility') === JourneyVisibility.PUBLIC ? "text-white dark:text-[#1A1A1A]" : "text-[#1A1A1A] dark:text-white")}>Mở cửa</span>
                            </div>
                            <p className={cn("text-[0.8rem] font-semibold leading-snug", watch('visibility') === JourneyVisibility.PUBLIC ? "text-white/80 dark:text-[#1A1A1A]/80" : "text-[#8A8580] dark:text-[#A09D9A]")}>
                                {currentBoxId ? "Tất cả thành viên Không gian đều thấy." : "Mọi người đều có thể thấy và tham gia."}
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('visibility', JourneyVisibility.PRIVATE, { shouldValidate: true })}
                            className={cn(
                                "p-4 rounded-[24px] border-2 text-left transition-all active:scale-95",
                                watch('visibility') === JourneyVisibility.PRIVATE
                                    ? "bg-[#1A1A1A] dark:bg-white border-transparent shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-1" 
                                    : "bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border-[#D6CFC7]/50 dark:border-[#3A3734] hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29]"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className={cn("w-5 h-5", watch('visibility') === JourneyVisibility.PRIVATE ? "text-white dark:text-[#1A1A1A]" : "text-orange-500")} strokeWidth={2.5} />
                                <span className={cn("text-[1rem] font-black", watch('visibility') === JourneyVisibility.PRIVATE ? "text-white dark:text-[#1A1A1A]" : "text-[#1A1A1A] dark:text-white")}>Khép kín</span>
                            </div>
                            <p className={cn("text-[0.8rem] font-semibold leading-snug", watch('visibility') === JourneyVisibility.PRIVATE ? "text-white/80 dark:text-[#1A1A1A]/80" : "text-[#8A8580] dark:text-[#A09D9A]")}>
                                Chỉ những người được mời mới thấy.
                            </p>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-3 pl-1">
                        Nhãn dán (Icon)
                    </label>
                    <div className="flex flex-wrap gap-3 relative">
                        {renderIcons.map(i => (
                            <button
                                key={i.id}
                                type="button"
                                onClick={() => setValue('avatar', i.icon)}
                                className={cn(
                                    "px-4 h-[44px] rounded-[16px] text-[0.95rem] transition-all flex items-center justify-center font-bold",
                                    watch('avatar') === i.icon 
                                    ? "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-[0_6px_16px_rgba(0,0,0,0.12)] -translate-y-1" 
                                    : "bg-[#F4EBE1]/50 dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#3A3734] border border-[#D6CFC7]/50 dark:border-transparent active:scale-95"
                                )}
                            >
                                {i.label}
                            </button>
                        ))}
                        
                        <div className="relative">
                            <button 
                                type="button" 
                                onClick={() => setShowCustomIconForm(!showCustomIconForm)}
                                className="px-5 h-[44px] bg-[#F4EBE1]/50 dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#3A3734] border border-[#D6CFC7]/50 dark:border-transparent rounded-[16px] font-bold text-[0.95rem] transition-all active:scale-95"
                            >
                                Khác...
                            </button>

                            {showCustomIconForm && (
                                <div ref={emojiPickerRef} className="absolute bottom-[calc(100%+12px)] left-0 sm:left-auto sm:right-0 w-[300px] bg-white dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#3A3734] rounded-[28px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 z-50 animate-in fade-in slide-in-from-bottom-2">
                                    <h4 className="text-[0.9rem] font-extrabold text-[#1A1A1A] dark:text-white mb-3">Tạo nhãn tùy chỉnh</h4>
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-12 h-12 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[16px] flex items-center justify-center text-[1.4rem] shrink-0 shadow-inner">
                                            {customEmoji}
                                        </div>
                                        <input 
                                            autoFocus
                                            value={customLabel}
                                            onChange={e => setCustomLabel(e.target.value)}
                                            placeholder="Tên nhãn..."
                                            className="flex-1 h-12 min-w-0 bg-[#F4EBE1]/50 dark:bg-[#2B2A29]/50 border border-transparent focus:border-[#D6CFC7] dark:focus:border-[#3A3734] rounded-[16px] px-3 outline-none text-[0.95rem] font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A]"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleCreateCustomIcon}
                                            disabled={!customLabel.trim()}
                                            className="w-12 h-12 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[16px] flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                                        >
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                        </button>
                                    </div>
                                    <div className="w-full h-[240px] overflow-hidden rounded-[20px] border border-[#D6CFC7]/50 dark:border-[#2B2A29]">
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

            <div className="p-6 md:p-8 bg-white dark:bg-[#121212] border-t border-[#F4EBE1] dark:border-[#2B2A29] shrink-0">
                <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isFormValid || isCreating}
                    className={cn(
                        "w-full h-[60px] rounded-[24px] text-[1.1rem] font-black flex items-center justify-center gap-2 transition-all",
                        (!isFormValid || isCreating)
                        ? "bg-[#E2D9CE] dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] cursor-not-allowed" 
                        : "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:-translate-y-1 active:scale-[0.98] shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                    )}
                >
                    {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                    Bắt đầu Hành trình
                </button>
                {!currentBoxId && (
                    <p className="text-red-500/80 font-bold text-[0.85rem] mt-3 text-center">
                        Vui lòng chọn Không gian để tiếp tục.
                    </p>
                )}
            </div>
        </div>
    </div>,
    document.body
  );
};