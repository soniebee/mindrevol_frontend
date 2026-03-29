import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MoodRequest, MoodResponse } from '../types';


interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MoodRequest) => Promise<void>;
    currentMood?: MoodResponse;
}

// Đã việt hóa -> anh hóa các trạng thái
const CATEGORIES = [
    { label: "Recent", emojis: [{ icon: "😴", text: "Sleepy" }, { icon: "😔", text: "Lonely" }] },
    { label: "Moods", emojis: [
        { icon: "😢", text: "Sad" }, { icon: "🥰", text: "Loved" }, 
        { icon: "🥺", text: "Need you" }, { icon: "😤", text: "Angry" }, 
        { icon: "😰", text: "Anxious" }, { icon: "🤤", text: "Hungry" }, 
        { icon: "😩", text: "Bored" }, { icon: "😆", text: "Happy" },
        { icon: "🤩", text: "Excited" }, { icon: "😲", text: "Surprised" },
        { icon: "🤪", text: "Silly" }, { icon: "🥺", text: "Missing you" }
    ]}
];

export const MoodSelectionSheet: React.FC<Props> = ({ isOpen, onClose, onSubmit, currentMood }) => {
    const [icon, setIcon] = useState(currentMood?.icon || "😎");
    const [message, setMessage] = useState(currentMood?.message || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentMood) {
            setIcon(currentMood.icon);
            setMessage(currentMood.message || "");
        }
    }, [isOpen, currentMood]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true);
        await onSubmit({ icon, message });
        setLoading(false);
        onClose();
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 animate-in fade-in duration-200 font-['Jua']">
            {/* Vùng nhấn bên ngoài để đóng */}
            <div className="flex-1" onClick={onClose} />
            
            {/* Sheet Content (Màu nâu giống design) */}
            <div className="bg-[#70645c] w-full h-[85%] rounded-t-[40px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
                
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                        <X size={20} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-white text-lg tracking-wide">Select a mood</h2>
                        <p className="text-white/60 text-[11px] font-sans font-medium uppercase tracking-wider">Visible to friends for 24h</p>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="px-6 py-4 shrink-0">
                    <div className="w-full bg-white/10 rounded-3xl p-4 flex flex-col items-center gap-3">
                        <span className="text-4xl">{icon}</span>
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="+ Add a note..."
                            className="bg-transparent text-center text-white placeholder:text-white/50 text-sm w-full focus:ring-0 border-none px-2 font-sans font-medium"
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 mt-2 bg-white text-[#70645c] rounded-2xl tracking-wide hover:bg-zinc-100 transition text-[15px]"
                        >
                            {loading ? 'Saving...' : 'Create status'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-8">
                    {CATEGORIES.map((cat, idx) => (
                        <div key={idx} className="mb-6">
                            <h3 className="text-white/70 text-sm mb-3 tracking-wide">{cat.label}</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {cat.emojis.map((item, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => setIcon(item.icon)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all ${icon === item.icon ? 'bg-white/30 border border-white/50 scale-105' : 'bg-white/10 hover:bg-white/20'}`}
                                    >
                                        <span className="text-3xl mb-1">{item.icon}</span>
                                        <span className="text-[11px] text-white/90 text-center leading-tight font-sans font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};