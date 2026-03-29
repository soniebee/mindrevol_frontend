import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, ImagePlus, Users, BookOpen, Moon, Waves, Leaf, Search, X } from 'lucide-react';
import { boxService } from '../services/box.service';
import { friendService } from '@/modules/user/services/friend.service'; // Thêm import friendService
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface CreateBoxModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// 1. Cập nhật đúng tên Theme của bạn và gắn Icon tương ứng
export const BOX_THEMES = [
    { id: 'theme-1', name: 'Morning Reads', image: '/themes/box/1.png', icon: BookOpen, textPos: { x: 50, y: 30 }, avatarPos: { x: 15, y: 70 } },
    { id: 'theme-2', name: 'Night Garden', image: '/themes/box/2.png', icon: Moon, textPos: { x: 30, y: 20 }, avatarPos: { x: 80, y: 60 } },
    { id: 'theme-3', name: 'Seaside Shells', image: '/themes/box/3.png', icon: Waves, textPos: { x: 70, y: 40 }, avatarPos: { x: 20, y: 80 } },
    { id: 'theme-4', name: 'Forest Forage', image: '/themes/box/4.png', icon: Leaf, textPos: { x: 50, y: 50 }, avatarPos: { x: 50, y: 80 } },
];

export const CreateBoxModal: React.FC<CreateBoxModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(BOX_THEMES[0]);
    const [avatarImage, setAvatarImage] = useState<string | null>(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // STATES CHO PHẦN INVITE FRIENDS
    const [friends, setFriends] = useState<any[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const avatarFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedTheme(BOX_THEMES[0]);
            setAvatarImage(null);
            setSearchQuery('');
            setSelectedFriends([]);
            setError('');
            fetchFriends(); // Tải danh sách bạn bè khi mở modal
        }
    }, [isOpen]);

    const fetchFriends = async () => {
        try {
            const res = await friendService.getMyFriends();
            setFriends((res || []).map((item: any) => item.friend));
        } catch (e) {
            console.error("Lỗi tải danh sách bạn bè", e);
        }
    };

    // Lọc danh sách bạn bè để hiển thị (loại bỏ những người đã được chọn)
    const filteredFriends = useMemo(() => {
        const unselected = friends.filter(f => !selectedFriends.some(s => s.id === f.id));
        if (!searchQuery.trim()) return unselected; // Hiện tất cả (hoặc có thể để trống nếu không muốn hiện hết)
        return unselected.filter(f => 
            f.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (f.handle && f.handle.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [friends, selectedFriends, searchQuery]);

    const handleAddFriend = (friend: any) => {
        setSelectedFriends(prev => [...prev, friend]);
        setSearchQuery(''); // Xóa thanh search sau khi chọn
    };

    const handleRemoveFriend = (friendId: string) => {
        setSelectedFriends(prev => prev.filter(f => f.id !== friendId));
    };

    if (!isOpen) return null;

    const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setAvatarImage(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setError('Please enter a box name.');
        try {
            setIsLoading(true);
            
            // Gửi dữ liệu tạo Box kèm mảng inviteUserIds
            await boxService.createBox({ 
                name: name.trim(), 
                description: "", 
                themeSlug: selectedTheme.id, 
                avatar: avatarImage || "📦",
                textPosition: `${selectedTheme.textPos.x.toFixed(2)},${selectedTheme.textPos.y.toFixed(2)}`,
                inviteUserIds: selectedFriends.map(f => f.id) // 🔥 Đẩy mảng ID bạn bè lên BE
            });
            
            toast.success("Box created successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Error creating Box.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[10000] overflow-y-auto custom-scrollbar flex flex-col font-sans"
            style={{ fontFamily: '"Jua", sans-serif' }}
        >
            <div className="fixed inset-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
                <div className="w-full max-w-[1000px] h-full relative">
                    <div className="absolute -top-10 -left-20 w-[400px] h-[300px] bg-blue-300/40 dark:bg-blue-600/10 blur-[100px] rounded-full transition-colors duration-500" />
                </div>
            </div>

            <div className="relative min-h-full w-full flex flex-col items-center py-8 px-4">
                <div className="my-auto relative z-10 w-full max-w-[460px] mx-auto flex flex-col px-4 sm:px-6 py-6 sm:py-8 bg-transparent rounded-[32px] transition-colors duration-300 animate-in fade-in slide-in-from-bottom-8">
                    
                    <div className="flex items-center justify-between mb-6 shrink-0 px-2">
                        <button onClick={onClose} className="text-3xl text-black dark:text-white hover:scale-110 transition-transform -mt-1">&lt;</button>
                        <h2 className="text-black dark:text-white text-2xl font-normal transition-colors">
                            New Box
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
                            <h3 className="text-red-950 dark:text-lime-100 text-xl font-normal mb-2">Preview</h3>

                            <div 
                                className="w-full aspect-[7/4] rounded-[24px] overflow-hidden relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] bg-transparent"
                                style={{ containerType: 'inline-size' }}
                            >
                                <img 
                                    src={selectedTheme.image} 
                                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                                    draggable={false}
                                    alt="Theme"
                                />
                                
                                <div 
                                    className="absolute flex items-center transform -translate-x-1/2 -translate-y-1/2 select-none z-20 pointer-events-none"
                                    style={{ 
                                        left: `${selectedTheme.textPos.x}%`, 
                                        top: `${selectedTheme.textPos.y}%`,
                                        textShadow: '0px 2px 8px rgba(0,0,0,0.8), 0px 1px 3px rgba(0,0,0,0.6)'
                                    }}
                                >
                                    <span 
                                        className="text-white font-normal tracking-wide whitespace-nowrap" 
                                        style={{ fontFamily: '"Jua", sans-serif', fontSize: '6.5cqw' }}
                                    >
                                        {name.trim() || 'Box Name...'}
                                    </span>
                                </div>

                                <div 
                                    onClick={() => avatarFileInputRef.current?.click()}
                                    className="absolute bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.3)] rotate-[-8deg] z-10 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 select-none cursor-pointer hover:scale-105 transition-transform"
                                    style={{ 
                                        left: `${selectedTheme.avatarPos.x}%`, 
                                        top: `${selectedTheme.avatarPos.y}%`,
                                        width: '16cqw', 
                                        height: '16cqw', 
                                        padding: '1.2cqw', 
                                        borderRadius: '2.5cqw' 
                                    }}
                                    title="Click to upload avatar"
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
                                            <ImagePlus className="text-zinc-400" style={{ width: '5cqw', height: '5cqw' }} />
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" className="hidden" ref={avatarFileInputRef} onChange={handleCustomAvatarUpload} />
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

                        {/* PHẦN CHỌN THEME */}
                        <div className="w-full bg-[#fdf2f4] dark:bg-[#2d1b1e] rounded-[31px] p-5 shadow-sm relative">
                            <h3 className="text-red-950 dark:text-rose-200 text-xl font-normal">Theme</h3>
                            <p className="text-[10px] text-red-950/60 dark:text-rose-200/60 mb-3 font-sans font-medium">Choose a cute vibe</p>
                            
                            <div className="flex flex-nowrap gap-3 overflow-x-auto custom-scrollbar pb-2 items-center w-full">
                                {BOX_THEMES.map((theme) => {
                                    const Icon = theme.icon;
                                    return (
                                        <button 
                                            key={theme.id}
                                            onClick={() => setSelectedTheme(theme)}
                                            className={cn(
                                                "w-[84px] h-[84px] shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl transition-all border-2",
                                                selectedTheme.id === theme.id 
                                                    ? "bg-white dark:bg-zinc-800 border-rose-400 shadow-[0_4px_12px_rgba(251,113,133,0.2)] text-rose-500" 
                                                    : "bg-white/60 dark:bg-zinc-900/60 border-transparent text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm"
                                            )}
                                        >
                                            <Icon size={26} strokeWidth={1.5} />
                                            <span className="text-[11px] font-semibold font-sans text-center leading-tight px-1">{theme.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* PHẦN INVITE FRIENDS MỚI */}
                        <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[31px] p-5 shadow-sm relative">
                            <h3 className="text-blue-950 dark:text-blue-200 text-xl font-normal flex items-center gap-2">
                                <Users size={20} /> Invite Friends
                            </h3>
                            <p className="text-[10px] text-blue-900/60 dark:text-blue-200/60 mb-3 font-sans font-medium">Select friends to join this box</p>
                            
                            {/* Hiển thị những bạn bè đã chọn (Chips) */}
                            {selectedFriends.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedFriends.map(f => (
                                        <div key={f.id} className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-bold font-sans animate-in zoom-in-95">
                                            {f.fullname}
                                            <button onClick={() => handleRemoveFriend(f.id)} className="hover:text-red-500 transition-colors">
                                                <X size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Ô Search */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-3 text-zinc-400" size={18} />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 bg-white dark:bg-zinc-800 rounded-xl pl-10 pr-4 text-zinc-800 dark:text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-blue-400 font-sans shadow-sm text-sm transition-all" 
                                    placeholder="Search by name or @handle..." 
                                />
                            </div>

                            {/* Kết quả tìm kiếm / Gợi ý */}
                            {searchQuery.trim() && filteredFriends.length > 0 && (
                                <div className="mt-2 max-h-32 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-md p-1 animate-in slide-in-from-top-2">
                                    {filteredFriends.map(f => (
                                        <div 
                                            key={f.id} 
                                            onClick={() => handleAddFriend(f)} 
                                            className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                                                {f.avatarUrl ? <img src={f.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">{f.fullname?.charAt(0).toUpperCase()}</div>}
                                            </div>
                                            <div className="flex flex-col font-sans">
                                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{f.fullname}</span>
                                                <span className="text-[10px] text-zinc-500">@{f.handle}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchQuery.trim() && filteredFriends.length === 0 && (
                                <div className="mt-2 text-center text-xs text-zinc-500 font-sans py-2">
                                    No friends found.
                                </div>
                            )}
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
                            Create Box
                        </button>
                        <p className="text-stone-500 dark:text-stone-400 text-xs font-sans mt-3">
                            Invitations will be sent automatically ✨
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};