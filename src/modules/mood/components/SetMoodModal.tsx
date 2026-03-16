import React, { useState } from 'react';
import { X, Smile, Coffee, Music, Zap, CloudRain, Heart, Trash2 } from 'lucide-react';
import { MoodRequest } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MoodRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    currentIcon?: string;
    currentMessage?: string;
}

const QUICK_EMOJIS = ["🥰", "😎", "🎧", "☕", "💻", "😴", "🚗", "💪"];

export const SetMoodModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, onDelete, currentIcon, currentMessage }) => {
    const [icon, setIcon] = useState(currentIcon || "😎");
    const [message, setMessage] = useState(currentMessage || "");
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl relative">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-normal text-zinc-900 dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>
                            Tâm trạng của bạn?
                        </h2>
                        <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Vùng preview lớn */}
                    <div className="flex flex-col items-center justify-center py-6 bg-amber-50 dark:bg-amber-900/10 rounded-[24px] mb-6">
                        <span className="text-[64px] leading-none mb-3 animate-in zoom-in">{icon}</span>
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Đang làm gì đó..."
                            maxLength={50}
                            className="bg-transparent border-none text-center text-zinc-700 dark:text-zinc-300 font-medium focus:ring-0 placeholder:text-zinc-400 w-full px-4"
                        />
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Gợi ý nhanh</p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_EMOJIS.map(emoji => (
                                <button 
                                    key={emoji}
                                    onClick={() => setIcon(emoji)}
                                    className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${icon === emoji ? 'bg-amber-200 dark:bg-amber-700/50 shadow-inner scale-95' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {onDelete && currentIcon && (
                            <button 
                                onClick={() => { onDelete(); onClose(); }}
                                className="w-12 h-12 flex items-center justify-center rounded-[18px] bg-red-50 text-red-500 dark:bg-red-500/10 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[18px] h-12 font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : 'Đăng trạng thái'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};