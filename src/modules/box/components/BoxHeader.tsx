import React from 'react';
import { MessageCircle, MoreVertical, Edit, Archive, Trash2, Users } from 'lucide-react';
import { BoxResponse } from '../types';

interface BoxHeaderProps {
    box: BoxResponse;
    isOwner: boolean;
    navigate: (path: string) => void;
    menuRef: React.RefObject<HTMLDivElement | null>;
    isMenuOpen: boolean;
    setIsMenuOpen: (val: boolean) => void;
    setIsUpdateBoxModalOpen: (val: boolean) => void;
    handleArchiveBox: () => void;
    handleDisbandBox: () => void;
    setIsMembersModalOpen: (val: boolean) => void;
}

export const BoxHeader: React.FC<BoxHeaderProps> = ({
    box, isOwner, navigate, menuRef, isMenuOpen, setIsMenuOpen,
    setIsUpdateBoxModalOpen, handleArchiveBox, handleDisbandBox, setIsMembersModalOpen
}) => {
    return (
        <div className="relative w-full z-20 pt-2 pb-6 flex justify-between items-center gap-4">
            
            {/* Hiệu ứng màu be (amber) blur nhẹ từ trên xuống */}
            <div className="absolute inset-x-0 -top-10 h-32 bg-gradient-to-b from-amber-100/60 dark:from-amber-900/20 to-transparent blur-2xl pointer-events-none -z-10" />

            {/* Nút Back & Tên Box: Dùng flex-1 và min-w-0 để truncate tự động hoạt động */}
            <button 
                onClick={() => navigate('/box')} 
                className="flex items-center gap-1 md:gap-2 text-amber-950 dark:text-amber-100 text-[26px] md:text-3xl font-normal font-['Jua'] hover:-translate-x-1 transition-transform z-10 flex-1 min-w-0"
            >
                <span className="shrink-0">&lt;</span>
                <span className="truncate pr-2">{box.name}</span>
            </button>

            {/* Các nút thao tác (Giữ shrink-0 để không bị bóp méo khi tên dài) */}
            <div className="flex items-center gap-2 sm:gap-3 z-10 shrink-0">
                
                {/* Chat: Khối Trắng Tròn */}
                <button 
                    onClick={() => navigate(`/chat?boxId=${box.id}`)}
                    className="w-9 h-9 md:w-10 md:h-10 bg-white dark:bg-zinc-800 rounded-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] dark:shadow-none flex items-center justify-center text-zinc-800 dark:text-zinc-200 transition-transform hover:scale-105 shrink-0"
                >
                    <MessageCircle size={18} strokeWidth={2.5} />
                </button>

                {/* Members: Khối Cam Tròn */}
                <button 
                    onClick={() => setIsMembersModalOpen(true)}
                    className="w-9 h-9 md:w-10 md:h-10 bg-orange-200 dark:bg-orange-900/60 rounded-full shadow-[0px_2px_5px_0px_rgba(0,0,0,0.15)] dark:shadow-none flex items-center justify-center text-orange-950 dark:text-orange-200 transition-transform hover:scale-105 shrink-0"
                >
                    <Users size={18} strokeWidth={2.5} />
                </button>

                {/* Settings: Khối Đỏ Nhạt Vuông Bo Góc */}
                {isOwner && (
                    <div className="relative shrink-0" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-8 h-9 md:w-9 md:h-10 bg-red-200/90 dark:bg-red-900/60 rounded-[8px] shadow-[0px_4px_4px_-1px_rgba(12,12,13,0.10)] dark:shadow-none flex items-center justify-center text-red-950 dark:text-red-200 transition-transform hover:scale-105"
                        >
                            <MoreVertical size={18} strokeWidth={2.5} />
                        </button>

                        {/* Menu Dropdown */}
                        {isMenuOpen && (
                            <div className="absolute top-12 right-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[20px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 z-50 p-1.5">
                                <button onClick={() => { setIsUpdateBoxModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-colors">
                                    <Edit size={16} /> Chỉnh sửa
                                </button>
                                <button onClick={handleArchiveBox} className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-colors">
                                    <Archive size={16} /> Lưu trữ
                                </button>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />
                                <button onClick={handleDisbandBox} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-colors">
                                    <Trash2 size={16} /> Giải tán
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};