import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, ImagePlus, Users, Search, X, Camera } from 'lucide-react';
import { boxService } from '../services/box.service';
import { fileService } from '@/modules/storage/services/file.service';
import { friendService } from '@/modules/user/services/friend.service';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface CreateBoxModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateBoxModal: React.FC<CreateBoxModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    const [avatarImage, setAvatarImage] = useState<string | null>(null); 
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bgFile, setBgFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [friends, setFriends] = useState<any[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const bgFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setDescription('');
            setAvatarImage(null);
            setBackgroundImage(null);
            setAvatarFile(null); 
            setBgFile(null);    
            setSearchQuery('');
            setSelectedFriends([]);
            setError('');
            fetchFriends();
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

    const filteredFriends = useMemo(() => {
        const unselected = friends.filter(f => !selectedFriends.some(s => s.id === f.id));
        if (!searchQuery.trim()) return unselected;
        return unselected.filter(f => 
            f.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (f.handle && f.handle.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [friends, selectedFriends, searchQuery]);

    const handleAddFriend = (friend: any) => {
        setSelectedFriends(prev => [...prev, friend]);
        setSearchQuery('');
    };

    const handleRemoveFriend = (friendId: string) => {
        setSelectedFriends(prev => prev.filter(f => f.id !== friendId));
    };

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file); 
            if (type === 'avatar') {
                setAvatarImage(url);
                setAvatarFile(file); 
            } else {
                setBackgroundImage(url);
                setBgFile(file);    
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setError('Tên Box không được để trống.');
        
        try {
            setIsLoading(true);
            
            let finalAvatarUrl = avatarImage || "📦";
            let finalThemeUrl = backgroundImage || 'default';

            if (avatarFile) {
                finalAvatarUrl = await fileService.uploadFile(avatarFile);
            }
            
            if (bgFile) {
                finalThemeUrl = await fileService.uploadFile(bgFile);
            }
            
            await boxService.createBox({ 
                name: name.trim(), 
                description: description.trim(), 
                themeSlug: finalThemeUrl, 
                avatar: finalAvatarUrl,
                textPosition: '50,50', 
                inviteUserIds: selectedFriends.map(f => f.id)
            });
            
            toast.success("Tạo Box thành công!");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo Box.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
            
            {/* BACKDROP KÍNH MỜ */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            {/* MODAL CONTAINER */}
            <div className="relative w-full md:w-[520px] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col max-h-[92vh] md:max-h-[90vh] animate-in slide-in-from-bottom-1/2 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 overflow-hidden">
                
                {/* THUMB TRƯỢT TRÊN MOBILE */}
                <div className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0">
                    <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
                </div>

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 md:px-8 py-5 shrink-0 border-b border-[#F4EBE1] dark:border-[#2B2A29]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[1.4rem] md:text-[1.5rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">
                            Tạo Không gian mới
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* BODY KHÔNG GIAN CUỘN */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-6 space-y-8">
                    
                    {error && (
                        <div className="p-4 rounded-[16px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[0.95rem] font-bold text-center">
                            {error}
                        </div>
                    )}
                    
                    {/* KHU VỰC ẢNH BÌA VÀ AVATAR */}
                    <div className="relative mb-10">
                        {/* ẢNH BÌA */}
                        <div 
                            onClick={() => bgFileInputRef.current?.click()}
                            className="w-full h-36 md:h-40 rounded-[24px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-dashed border-[#D6CFC7] dark:border-[#3A3734] flex flex-col items-center justify-center cursor-pointer hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] transition-all overflow-hidden relative group"
                        >
                            {backgroundImage ? (
                                <img src={backgroundImage} className="w-full h-full object-cover group-hover:brightness-75 transition-all" alt="Background" />
                            ) : (
                                <div className="flex flex-col items-center text-[#8A8580] dark:text-[#A09D9A] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors">
                                    <Camera size={28} className="mb-2" strokeWidth={2.5} />
                                    <span className="text-[0.75rem] font-extrabold uppercase tracking-widest">Thêm ảnh bìa</span>
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <Camera className="text-white drop-shadow-md" size={32} />
                            </div>
                            <input type="file" accept="image/*" className="hidden" ref={bgFileInputRef} onChange={(e) => handleFileUpload(e, 'bg')} />
                        </div>

                        {/* AVATAR BOX */}
                        <div 
                            onClick={() => avatarFileInputRef.current?.click()}
                            className="absolute -bottom-8 left-6 md:left-8 w-24 h-24 rounded-[24px] border-[4px] border-white dark:border-[#121212] bg-[#E2D9CE] dark:bg-[#3A3734] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden group shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                        >
                            {avatarImage ? (
                                <img src={avatarImage} className="w-full h-full object-cover group-hover:brightness-75 transition-all" alt="Avatar" />
                            ) : (
                                <ImagePlus size={28} className="text-[#8A8580] dark:text-[#A09D9A] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" strokeWidth={2.5} />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <Camera className="text-white drop-shadow-md" size={24} />
                            </div>
                            <input type="file" accept="image/*" className="hidden" ref={avatarFileInputRef} onChange={(e) => handleFileUpload(e, 'avatar')} />
                        </div>
                    </div>

                    {/* FORM NHẬP LIỆU */}
                    <div className="space-y-5">
                        <div>
                            <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">
                                Tên Không gian
                            </label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-[56px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] rounded-[20px] px-5 text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] font-bold text-[1.05rem] outline-none transition-all focus:ring-0 shadow-sm" 
                                placeholder="VD: Gia đình nhỏ..." 
                            />
                        </div>

                        <div>
                            <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest block mb-2 pl-1">
                                Mô tả (Không bắt buộc)
                            </label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-24 py-4 bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] rounded-[20px] px-5 text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] font-bold text-[1rem] outline-none transition-all focus:ring-0 shadow-sm resize-none" 
                                placeholder="Giới thiệu ngắn về Không gian này..." 
                            />
                        </div>

                        {/* MỜI THÀNH VIÊN */}
                        <div className="pt-2">
                            <label className="text-[#8A8580] dark:text-[#A09D9A] text-[0.75rem] font-extrabold uppercase tracking-widest flex items-center gap-2 mb-3 pl-1">
                                <Users size={16} strokeWidth={2.5} /> Mời thành viên tham gia
                            </label>
                            
                            {selectedFriends.length > 0 && (
                                <div className="flex flex-wrap gap-2.5 mb-4">
                                    {selectedFriends.map(f => (
                                        <div key={f.id} className="flex items-center gap-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] px-3.5 py-2 rounded-[14px] text-[0.9rem] font-bold animate-in zoom-in-95 shadow-md">
                                            {f.fullname.split(' ')[0]}
                                            <button type="button" onClick={() => handleRemoveFriend(f.id)} className="hover:text-red-400 dark:hover:text-red-500 transition-colors ml-1">
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 text-[#A09D9A]" size={20} strokeWidth={2.5} />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-[52px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] rounded-[18px] pl-11 pr-5 text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] font-bold text-[1rem] outline-none transition-all focus:ring-0" 
                                    placeholder="Tìm kiếm bạn bè..." 
                                />
                            </div>

                            {searchQuery.trim() && filteredFriends.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#3A3734] rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] p-2 animate-in slide-in-from-top-2">
                                    {filteredFriends.map(f => (
                                        <div key={f.id} onClick={() => handleAddFriend(f)} className="flex items-center gap-3 p-2.5 hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[14px] cursor-pointer transition-colors active:scale-[0.98]">
                                            <div className="w-10 h-10 rounded-[12px] bg-[#E2D9CE] dark:bg-[#3A3734] border border-white/50 dark:border-transparent overflow-hidden shadow-sm">
                                                {f.avatarUrl ? (
                                                    <img src={f.avatarUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[0.8rem] text-[#1A1A1A] dark:text-white font-black">
                                                        {f.fullname?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[1rem] font-bold text-[#1A1A1A] dark:text-white">{f.fullname}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-6 md:p-8 bg-white dark:bg-[#121212] border-t border-[#F4EBE1] dark:border-[#2B2A29] shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !name.trim()}
                        className={cn(
                            "w-full h-[60px] rounded-[24px] text-[1.1rem] font-black flex items-center justify-center gap-2 transition-all",
                            (isLoading || !name.trim()) 
                            ? "bg-[#E2D9CE] dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] cursor-not-allowed" 
                            : "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:-translate-y-1 active:scale-[0.98] shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                        )}
                    >
                        {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}
                        Tạo Không gian
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};