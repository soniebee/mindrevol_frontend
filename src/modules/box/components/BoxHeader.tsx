import React from 'react';
import { MessageCircle, MoreVertical, Edit, Archive, Trash2, Users, Package } from 'lucide-react';
import { BoxDetailResponse } from '../types';

interface BoxHeaderProps {
    box: BoxDetailResponse;
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
    // Kiểm tra xem là ảnh hay emoji/màu mặc định
    const isThemeUrl = box.themeSlug && box.themeSlug !== 'default';
    const isAvatarUrl = box.avatar?.includes('/') || box.avatar?.startsWith('http') || box.avatar?.startsWith('blob:');

    return (
        <div className="w-full relative z-20 flex flex-col mb-4 md:mb-8">
            
            {/* 1. KHỐI BANNER (ẢNH BÌA) */}
            {/* - Mobile: Dùng -mx-5 và -mt-10 để ép ảnh bìa tràn sát mép trên cùng và mép trái phải của điện thoại. Bo tròn góc dưới (rounded-b).
                - Desktop: Hủy -mx, thu lại vừa vặn (md:w-full) và bo tròn đều (md:rounded-[36px]).
            */}
            <div className="w-[calc(100%+40px)] -mx-5 -mt-10 md:m-0 md:w-full h-[200px] md:h-[280px] rounded-b-[32px] md:rounded-[36px] overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.05)] shrink-0">
                
                {/* Nền Banner */}
                {isThemeUrl ? (
                    <img src={box.themeSlug} alt="Box Theme" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#E2D9CE] to-[#F4EBE1] dark:from-[#2B2A29] dark:to-[#1A1A1A]" />
                )}
                
                {/* Lớp phủ Gradient đen mờ từ trên xuống để đảm bảo icon (trắng) luôn nổi bật */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

                {/* Nút Quay Lại (Góc trái trên) */}
                {/* Mobile: Thụt top-10 để né tai thỏ (Notch) của iPhone */}
                <button 
                    onClick={() => navigate('/box')} 
                    className="absolute top-10 left-5 md:top-6 md:left-6 flex items-center gap-2 text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-[20px] transition-all font-bold tracking-tight active:scale-95 z-10 border border-white/10"
                >
                    <span className="opacity-70">&lt;</span> Quay lại
                </button>

                {/* 3 Nút Thao Tác (Góc phải trên) */}
                <div className="absolute top-10 right-5 md:top-6 md:right-6 flex items-center gap-2 md:gap-3 z-10">
                    <button 
                        onClick={() => navigate(`/chat?boxId=${box.id}`)}
                        className="w-10 h-10 md:w-11 md:h-11 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 rounded-[18px] flex items-center justify-center text-white transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    >
                        <MessageCircle size={20} strokeWidth={2.5} />
                    </button>

                    <button 
                        onClick={() => setIsMembersModalOpen(true)}
                        className="w-10 h-10 md:w-11 md:h-11 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 rounded-[18px] flex items-center justify-center text-white transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    >
                        <Users size={20} strokeWidth={2.5} />
                    </button>

                    {isOwner && (
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 md:w-11 md:h-11 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 rounded-[18px] flex items-center justify-center text-white transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                            >
                                <MoreVertical size={20} strokeWidth={2.5} />
                            </button>

                            {/* Dropdown Menu (Chỉnh màu tĩnh lặng) */}
                            {isMenuOpen && (
                                <div className="absolute top-[52px] right-0 w-56 bg-white dark:bg-[#1A1A1A] rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-transparent dark:border-[#2B2A29] overflow-hidden animate-in fade-in zoom-in-95 z-50 p-2">
                                    <button onClick={() => { setIsUpdateBoxModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[0.95rem] font-bold text-[#1A1A1A] dark:text-white hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] flex items-center gap-3 transition-colors">
                                        <Edit size={18} strokeWidth={2.5} className="text-[#8A8580]" /> Chỉnh sửa
                                    </button>
                                    <button onClick={handleArchiveBox} className="w-full text-left px-4 py-3 text-[0.95rem] font-bold text-[#1A1A1A] dark:text-white hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] flex items-center gap-3 transition-colors mt-1">
                                        <Archive size={18} strokeWidth={2.5} className="text-[#8A8580]" /> Lưu trữ
                                    </button>
                                    <div className="h-px bg-[#D6CFC7]/30 dark:bg-[#4A4D55]/30 my-2 mx-3" />
                                    <button onClick={handleDisbandBox} className="w-full text-left px-4 py-3 text-[0.95rem] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[16px] flex items-center gap-3 transition-colors">
                                        <Trash2 size={18} strokeWidth={2.5} /> Giải tán Box
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. KHỐI AVATAR (Nổi lên đè vào viền dưới của Banner) */}
            <div className="relative px-2 md:px-6 -mt-12 md:-mt-16 z-20 flex items-end">
                <div className="w-[90px] h-[90px] md:w-[130px] md:h-[130px] rounded-[28px] md:rounded-[36px] border-[6px] border-[#F4EBE1] dark:border-[#121212] bg-[#E2D9CE] dark:bg-[#2B2A29] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden shrink-0">
                    {isAvatarUrl ? (
                        <img src={box.avatar} className="w-full h-full object-cover" alt="Box Avatar" />
                    ) : box.avatar === '📦' ? (
                        <Package className="w-10 h-10 md:w-14 md:h-14 text-[#8A8580] dark:text-[#A09D9A]" />
                    ) : (
                        <span className="text-[3rem] md:text-[4.5rem] leading-none mb-1">{box.avatar}</span>
                    )}
                </div>
            </div>

            {/* 3. KHỐI TÊN BOX & MÔ TẢ (Nằm dưới Avatar) */}
            <div className="mt-3 md:mt-4 px-3 md:px-6">
                <h1 className="text-[1.8rem] md:text-[2.4rem] font-black text-[#1A1A1A] dark:text-white leading-tight tracking-tight">
                    {box.name}
                </h1>
                {box.description && (
                    <p className="text-[0.95rem] md:text-[1.05rem] font-semibold text-[#8A8580] dark:text-[#A09D9A] mt-1.5 md:mt-2 max-w-2xl">
                        {box.description}
                    </p>
                )}
            </div>

        </div>
    );
};