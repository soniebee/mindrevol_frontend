import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, ImagePlus, UserPlus, Move } from 'lucide-react';
import { boxService } from '../services/box.service';
import { BoxResponse, UpdateBoxRequest } from '../types';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface UpdateBoxModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    boxData: BoxResponse;
}

const BOX_THEMES = [
    { id: 'theme-1', image: '/themes/box/1.png' },
    { id: 'theme-2', image: '/themes/box/2.png' },
    { id: 'theme-3', image: '/themes/box/3.png' },
    { id: 'theme-4', image: '/themes/box/4.png' },
    { id: 'theme-5', image: '/themes/box/5.png' },
    { id: 'theme-6', image: '/themes/box/6.png' },
];

// Hàm dịch tọa độ
const parsePosition = (posStr?: string, defaultX = 50, defaultY = 30) => {
    if (!posStr) return { x: defaultX, y: defaultY };
    const parts = posStr.split(',');
    if (parts.length !== 2) return { x: defaultX, y: defaultY };
    return { 
        x: parseFloat(parts[0]) || defaultX, 
        y: parseFloat(parts[1]) || defaultY 
    };
};

export const UpdateBoxModal: React.FC<UpdateBoxModalProps> = ({ isOpen, onClose, onSuccess, boxData }) => {
    const [name, setName] = useState('');
    const [selectedTheme, setSelectedTheme] = useState({ 
    id: 'current', 
    image: boxData?.coverImage || BOX_THEMES[0].image 
});
    const [avatarImage, setAvatarImage] = useState<string | null>(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const themeFileInputRef = useRef<HTMLInputElement>(null);
    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // --- LOGIC KÉO THẢ (DRAG & DROP) ---
    const [textPos, setTextPos] = useState({ x: 50, y: 30 }); 
    const [avatarPos, setAvatarPos] = useState({ x: 15, y: 70 }); 
    const [dragTarget, setDragTarget] = useState<'text' | 'avatar' | null>(null);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, target: 'text' | 'avatar') => {
        e.preventDefault(); 
        e.stopPropagation();
        setDragTarget(target);
    };

    const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!dragTarget || !previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        
        let clientX = 0;
        let clientY = 0;
        
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        let newX = ((clientX - rect.left) / rect.width) * 100;
        let newY = ((clientY - rect.top) / rect.height) * 100;

        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        if (dragTarget === 'text') {
            setTextPos({ x: newX, y: newY });
        } else if (dragTarget === 'avatar') {
            setAvatarPos({ x: newX, y: newY });
        }
    }, [dragTarget]);

    const handlePointerUp = useCallback(() => {
        setDragTarget(null);
    }, []);

    useEffect(() => {
        if (dragTarget) {
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove, { passive: false });
            window.addEventListener('touchend', handlePointerUp);
        } else {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        }
        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [dragTarget, handlePointerMove, handlePointerUp]);

    // LOAD DỮ LIỆU CŨ LÊN FORM
    useEffect(() => {
        if (isOpen && boxData) {
            setName(boxData.name);
            setSelectedTheme({ id: 'current', image: boxData.coverImage || BOX_THEMES[0].image });
            
            const isAvatarUrl = boxData.avatar?.includes('/') || boxData.avatar?.startsWith('http');
            setAvatarImage(isAvatarUrl ? boxData.avatar! : null);

            setTextPos(parsePosition(boxData.textPosition, 50, 30));
            setAvatarPos(parsePosition(boxData.avatarPosition, 15, 70));
            setError('');
        }
    }, [isOpen, boxData]);

    if (!isOpen) return null;

    const handleCustomThemeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedTheme({ id: 'custom', image: URL.createObjectURL(file) });
    };

    const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setAvatarImage(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setError('Please enter a box name.');
        try {
            setIsLoading(true);
            const payload: UpdateBoxRequest = { 
                name: name.trim(), 
                description: boxData.description || "", // Giữ lại description cũ nếu có
                coverImage: selectedTheme.image, 
                themeColor: boxData.themeColor || "#f4f9e8", 
                avatar: avatarImage || boxData.avatar || "📦",
                textPosition: `${textPos.x.toFixed(2)},${textPos.y.toFixed(2)}`,
                avatarPosition: `${avatarPos.x.toFixed(2)},${avatarPos.y.toFixed(2)}`
            };
            
            await boxService.updateBox(boxData.id, payload);
            toast.success('Cập nhật Không gian thành công!');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Lỗi khi cập nhật Không gian.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[10000] overflow-y-auto custom-scrollbar flex flex-col font-sans"
            style={{ fontFamily: '"Jua", sans-serif' }}
        >
            {/* NỀN BLUR TỔNG THỂ */}
            <div className="fixed inset-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
                <div className="w-full max-w-[1000px] h-full relative">
                    <div className="absolute -top-10 -left-20 w-[400px] h-[300px] bg-blue-300/40 dark:bg-blue-600/10 blur-[100px] rounded-full transition-colors duration-500" />
                </div>
            </div>

            {/* WRAPPER CUỘN */}
            <div className="relative min-h-full w-full flex flex-col items-center sm:py-12 pt-16 pb-4">
                <div className="mt-auto sm:my-auto relative z-10 w-full max-w-[460px] mx-auto flex flex-col px-4 sm:px-6 py-6 sm:py-8 bg-transparent rounded-[32px] transition-colors duration-300 animate-in fade-in slide-in-from-bottom-8 overflow-hidden">
                    
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6 shrink-0 px-2">
                        <button onClick={onClose} className="text-3xl text-black dark:text-white hover:scale-110 transition-transform -mt-1">&lt;</button>
                        <h2 className="text-black dark:text-white text-2xl font-normal transition-colors">
                            Edit Box
                        </h2>
                        <div className="w-8" />
                    </div>

                    <div className="flex-1 flex flex-col gap-5 px-1">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-sans font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div className="w-full bg-[#f4f9e8] dark:bg-[#1a2e1a] rounded-[31px] p-5 shadow-sm relative">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-red-950 dark:text-lime-100 text-xl font-normal">Preview</h3>
                                <p className="text-[10px] text-zinc-500 flex items-center gap-1 font-sans bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">
                                    <Move className="w-3 h-3" /> Kéo thả
                                </p>
                            </div>

                            {/* CONTAINER PREVIEW CQW */}
                            <div 
                                ref={previewRef}
                                className="w-full aspect-[7/4] rounded-[24px] overflow-hidden relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] bg-transparent"
                                style={{ containerType: 'inline-size' }}
                            >
                                <img 
                                    src={selectedTheme.image} 
                                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                                    draggable={false}
                                    alt="Theme"
                                />
                                
                                {/* CHỮ NỔI */}
                                <div 
                                    onMouseDown={(e) => handlePointerDown(e, 'text')}
                                    onTouchStart={(e) => handlePointerDown(e, 'text')}
                                    className={cn(
                                        "absolute flex items-center transform -translate-x-1/2 -translate-y-1/2 select-none z-20 cursor-grab",
                                        dragTarget === 'text' && "cursor-grabbing scale-105 transition-transform duration-100"
                                    )}
                                    style={{ 
                                        left: `${textPos.x}%`, 
                                        top: `${textPos.y}%`,
                                        textShadow: '0px 2px 8px rgba(0,0,0,0.8), 0px 1px 3px rgba(0,0,0,0.6)'
                                    }}
                                >
                                    <span 
                                        className="text-white font-normal tracking-wide whitespace-nowrap pointer-events-none" 
                                        style={{ fontFamily: '"Jua", sans-serif', fontSize: '6.5cqw' }}
                                    >
                                        {name.trim() || 'Tên Box...'}
                                    </span>
                                </div>

                                {/* ẢNH POLAROID */}
                                <div 
                                    onMouseDown={(e) => handlePointerDown(e, 'avatar')}
                                    onTouchStart={(e) => handlePointerDown(e, 'avatar')}
                                    className={cn(
                                        "absolute bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.3)] rotate-[-8deg] z-10 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 select-none cursor-grab",
                                        dragTarget === 'avatar' && "cursor-grabbing scale-105 transition-transform duration-100"
                                    )}
                                    style={{ 
                                        left: `${avatarPos.x}%`, 
                                        top: `${avatarPos.y}%`,
                                        width: '16cqw', 
                                        height: '16cqw', 
                                        padding: '1.2cqw', 
                                        borderRadius: '2.5cqw' 
                                    }}
                                >
                                    {avatarImage ? (
                                        <img 
                                            src={avatarImage} 
                                            className="w-full h-full object-cover pointer-events-none" 
                                            style={{ borderRadius: '1.5cqw' }} 
                                            draggable={false} 
                                        />
                                    ) : (
                                        <div 
                                            className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 border-dashed pointer-events-none"
                                            style={{ borderRadius: '1.5cqw' }} 
                                        >
                                            {/* Hiển thị Emoji cũ nếu có, nếu không hiển thị icon ImagePlus */}
                                            {(boxData.avatar && !boxData.avatar.includes('/')) ? (
                                                <span style={{ fontSize: '6cqw' }}>{boxData.avatar}</span>
                                            ) : (
                                                <ImagePlus className="text-zinc-400" style={{ width: '5cqw', height: '5cqw' }} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-red-950 dark:text-lime-100 text-xl mt-4 mb-2 font-normal">Box name</h3>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-11 bg-white dark:bg-zinc-800 rounded-xl px-4 text-zinc-800 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-lime-500 font-sans shadow-sm text-base" 
                                placeholder="e.g. F5 Besties..." 
                            />
                        </div>

                        <div className="w-full bg-[#fdf2f4] dark:bg-[#2d1b1e] rounded-[31px] p-5 shadow-sm relative">
                            <h3 className="text-red-950 dark:text-rose-200 text-xl font-normal">Theme</h3>
                            <p className="text-[10px] text-red-950/60 dark:text-rose-200/60 mb-3 font-sans font-medium">Choose a cute world & avatar</p>
                            
                            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 items-center">
                                <div 
                                    onClick={() => themeFileInputRef.current?.click()}
                                    className="w-16 h-16 shrink-0 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-white/50 dark:bg-black/20 hover:bg-white flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm"
                                >
                                    <ImagePlus className="w-5 h-5 text-rose-400 mb-1" />
                                    <span className="text-[9px] font-bold text-rose-500 uppercase font-sans">Nền</span>
                                    <input type="file" accept="image/*" className="hidden" ref={themeFileInputRef} onChange={handleCustomThemeUpload} />
                                </div>

                                <div 
                                    onClick={() => avatarFileInputRef.current?.click()}
                                    className="w-16 h-16 shrink-0 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-white/50 dark:bg-black/20 hover:bg-white flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm"
                                >
                                    <UserPlus className="w-5 h-5 text-sky-500 mb-1" />
                                    <span className="text-[9px] font-bold text-sky-600 uppercase font-sans">Avatar</span>
                                    <input type="file" accept="image/*" className="hidden" ref={avatarFileInputRef} onChange={handleCustomAvatarUpload} />
                                </div>

                                <div className="w-px h-10 bg-rose-200 dark:bg-rose-900 mx-1 shrink-0" />

                                {BOX_THEMES.map((theme) => (
                                    <div 
                                        key={theme.id}
                                        onClick={() => setSelectedTheme(theme)}
                                        className={cn(
                                            "w-24 h-16 shrink-0 rounded-2xl overflow-hidden cursor-pointer border-[3px] transition-all",
                                            selectedTheme.image === theme.image 
                                                ? "border-rose-400 scale-105 shadow-md" 
                                                : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={theme.image} alt={theme.id} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex flex-col items-center">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || !name.trim()}
                            className={cn(
                                "w-full max-w-[280px] h-12 md:h-14 rounded-xl shadow-[0px_4px_10px_rgba(0,0,0,0.2)] text-white text-xl flex items-center justify-center gap-2 transition-all font-normal",
                                (isLoading || !name.trim())
                                ? "bg-zinc-400 cursor-not-allowed shadow-none" 
                                : "bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 active:scale-95" 
                            )}
                            style={{ fontFamily: '"Jua", sans-serif' }}
                        >
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};