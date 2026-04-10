import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { MoodRequest } from '../types';
import { cn } from '@/lib/utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MoodRequest) => Promise<void>;
    currentIcon?: string;
    currentMessage?: string;
}

const CATEGORIES = [
    { label: "Gợi ý nhanh", emojis: [{ icon: "🔥", text: "Cháy" }, { icon: "☕", text: "Cà phê" }, { icon: "💻", text: "Code" }, { icon: "😴", text: "Buồn ngủ" }] },
    { label: "Cảm xúc", emojis: [
        { icon: "😆", text: "Vui vẻ" }, { icon: "🥰", text: "Yêu đời" }, 
        { icon: "🥺", text: "Nhớ ai đó" }, { icon: "😤", text: "Tức giận" }, 
        { icon: "😰", text: "Lo lắng" }, { icon: "🤤", text: "Đói bụng" }, 
        { icon: "😩", text: "Chán nản" }, { icon: "😢", text: "Buồn bã" },
        { icon: "🤩", text: "Hào hứng" }, { icon: "😲", text: "Bất ngờ" },
        { icon: "🤪", text: "Khùng điên" }, { icon: "🧘‍♂️", text: "Bình yên" }
    ]}
];

export const SetMoodModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, currentIcon, currentMessage }) => {
    const [icon, setIcon] = useState(currentIcon || "😆");
    const [message, setMessage] = useState(currentMessage || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIcon(currentIcon || "😆");
            setMessage(currentMessage || "");
        }
    }, [isOpen, currentIcon, currentMessage]);

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

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6">
            
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            <div className="relative w-full md:w-[480px] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[36px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in slide-in-from-bottom-1/2 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
                
                <div className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0">
                    <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 md:py-6 shrink-0">
                    <h2 className="text-[1.4rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">
                        Tâm trạng của bạn
                    </h2>
                    <button onClick={onClose} className="p-2 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
                    <div className="w-full bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] rounded-[28px] p-6 flex flex-col items-center gap-4 mb-8 border border-[#D6CFC7]/50 dark:border-[#2B2A29]">
                        <span className="text-[4rem] leading-none animate-in zoom-in-95">{icon}</span>
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="+ Thêm một chú thích nhỏ..."
                            maxLength={50}
                            className="bg-transparent text-center text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] text-[1.05rem] font-bold w-full focus:ring-0 border-none px-2"
                        />
                    </div>

                    {CATEGORIES.map((cat, idx) => (
                        <div key={idx} className="mb-8 last:mb-2">
                            <h3 className="text-[#8A8580] dark:text-[#A09D9A] text-[0.8rem] mb-4 tracking-widest font-extrabold uppercase ml-1">{cat.label}</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {cat.emojis.map((item, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => setIcon(item.icon)}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-4 px-2 rounded-[20px] cursor-pointer transition-all active:scale-95",
                                            icon === item.icon 
                                                ? "bg-[#1A1A1A] dark:bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] -translate-y-1" 
                                                : "bg-[#F4EBE1]/50 dark:bg-[#2B2A29] hover:bg-[#E2D9CE]/50 dark:hover:bg-[#3A3734]"
                                        )}
                                    >
                                        <span className="text-[2rem] leading-none mb-2">{item.icon}</span>
                                        <span className={cn(
                                            "text-[0.7rem] text-center leading-tight font-extrabold truncate w-full px-1",
                                            icon === item.icon ? "text-white dark:text-[#1A1A1A]" : "text-[#8A8580] dark:text-[#A09D9A]"
                                        )}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-white dark:bg-[#121212] flex gap-3 pt-4 border-t border-[#D6CFC7]/30 dark:border-[#2B2A29]/50 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={cn(
                            "w-full h-[56px] rounded-[24px] font-extrabold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] text-[1.05rem]",
                            loading ? "bg-[#A09D9A] dark:bg-[#3A3734] cursor-not-allowed" : "bg-[#1A1A1A] dark:bg-white dark:text-[#1A1A1A] hover:bg-black shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
                        )}
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Đăng trạng thái
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};