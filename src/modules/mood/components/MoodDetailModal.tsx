import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // [THÊM] Import createPortal
import { X, Trash2, ArrowLeft, SmilePlus } from 'lucide-react';
import { MoodRequest, MoodResponse } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    moods: MoodResponse[];
    myMood?: MoodResponse;
    onSubmit: (data: MoodRequest) => Promise<void>;
    onDelete: () => Promise<void>;
    currentUserId?: string;
}

const QUICK_EMOJIS = ["🥰", "😎", "🎧", "☕", "💻", "😴", "🚗", "💪", "😭", "😤"];

export const MoodDetailModal: React.FC<Props> = ({ 
    isOpen, onClose, moods, myMood, onSubmit, onDelete, currentUserId 
}) => {
    const [icon, setIcon] = useState("😎");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
    const emojiInputRef = useRef<HTMLInputElement>(null);

    // Khóa background scroll khi mở Modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (myMood) {
                setIcon(myMood.icon);
                setMessage(myMood.message || "");
            } else {
                setIcon("😎");
                setMessage("");
            }
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen, myMood]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit({ icon, message });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    // Hàm hứng Emoji từ bàn phím điện thoại
    const handleCustomEmoji = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const chars = Array.from(val);
        if (chars.length > 0) {
            setIcon(chars[chars.length - 1]); // Lấy Emoji cuối cùng vừa gõ
        }
        e.target.value = ''; // Reset input để hứng lần gõ tiếp theo
    };

    return createPortal(
        // Đặt z-[9999] để chắc chắn đè lên BottomNav
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#121212] md:bg-black/60 md:backdrop-blur-sm animate-in fade-in duration-200">
            
            <div className="w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-md bg-white dark:bg-zinc-900 flex flex-col md:rounded-[36px] overflow-hidden shadow-2xl relative md:border border-zinc-100 dark:border-zinc-800">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="md:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-[22px] md:text-2xl font-normal text-zinc-900 dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>
                            Tâm trạng
                        </h2>
                    </div>
                    <button onClick={onClose} className="hidden md:flex p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col">
                    
                    {/* --- DANH SÁCH MOOD CỦA NHÓM --- */}
                    {moods.length > 0 && (
                        <div className="mb-6">
                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 pl-1">
                                Đang diễn ra
                            </p>
                            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 px-1">
                                {moods.map(mood => {
                                    const isMe = mood.userId === currentUserId;
                                    const shortName = isMe ? 'You' : (mood.fullname?.split(' ')[0] || 'User');
                                    
                                    return (
                                        <div key={mood.id} className="flex flex-col items-center gap-2 shrink-0" title={mood.message || mood.fullname}>
                                            <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center relative shadow-sm border-2 ${isMe ? 'bg-gradient-to-tr from-amber-100 to-orange-200 border-amber-300 dark:border-amber-700/50' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
                                                <span className="text-[32px] leading-none drop-shadow-sm">{mood.icon}</span>
                                                <img 
                                                    src={mood.avatarUrl || `https://ui-avatars.com/api/?name=${mood.fullname}`} 
                                                    alt="avatar"
                                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full object-cover border-2 border-white dark:border-zinc-900 shadow-sm bg-zinc-200"
                                                />
                                            </div>
                                            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 font-['Jua'] truncate max-w-[60px] text-center">
                                                {shortName}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/50 mb-6 shrink-0"></div>

                    {/* --- VÙNG CẬP NHẬT MOOD CỦA BẢN THÂN --- */}
                    <div className="flex flex-col items-center justify-center py-6 md:py-8 bg-amber-50 dark:bg-amber-900/10 rounded-[28px] mb-6 border border-amber-100 dark:border-amber-900/30 relative">
                        
                        {/* KHỐI CHẠM ĐỂ GỌI BÀN PHÍM EMOJI */}
                        <div className="relative group flex flex-col items-center w-24 h-24 justify-center mb-4">
                            <span className="text-[64px] md:text-[72px] leading-none animate-in zoom-in drop-shadow-sm pointer-events-none">
                                {icon}
                            </span>
                            <div className="absolute bottom-0 -right-2 bg-white dark:bg-zinc-800 rounded-full p-2 shadow-md border border-zinc-100 dark:border-zinc-700 pointer-events-none">
                                <SmilePlus size={16} className="text-zinc-500" />
                            </div>
                            
                            {/* Input tàng hình bao phủ toàn khối mặt cười để dễ chạm */}
                            <input 
                                ref={emojiInputRef}
                                type="text"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[1px]"
                                onChange={handleCustomEmoji}
                                value=""
                                title="Chạm để mở bàn phím Emoji"
                            />
                        </div>

                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Thêm ghi chú (Không bắt buộc)..."
                            maxLength={50}
                            className="bg-transparent border-none text-center text-zinc-700 dark:text-zinc-300 text-[15px] font-medium focus:ring-0 placeholder:text-zinc-400/70 w-full px-6"
                        />
                    </div>

                    {/* --- GỢI Ý NHANH --- */}
                    <div className="mb-8">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 pl-1">Chọn nhanh</p>
                        <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                            {QUICK_EMOJIS.map(emoji => (
                                <button 
                                    key={emoji}
                                    onClick={() => setIcon(emoji)}
                                    className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl text-[22px] flex items-center justify-center transition-all ${icon === emoji ? 'bg-amber-200 dark:bg-amber-700/50 shadow-inner scale-95' : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-800'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- NÚT HÀNH ĐỘNG --- */}
                    <div className="flex gap-3 mt-auto pt-4 pb-4 md:pb-0 shrink-0">
                        {myMood && (
                            <button 
                                onClick={() => { onDelete(); onClose(); }}
                                className="w-[52px] h-[52px] flex items-center justify-center rounded-[18px] bg-red-50 text-red-500 dark:bg-red-500/10 hover:bg-red-100 transition-colors shrink-0"
                            >
                                <Trash2 size={22} />
                            </button>
                        )}
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[18px] h-[52px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-[15px]"
                        >
                            {loading ? 'Đang lưu...' : (myMood ? 'Cập nhật trạng thái' : 'Đăng trạng thái')}
                        </button>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
};