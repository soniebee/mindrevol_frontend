import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Package, Check, X, Sparkles } from 'lucide-react';
import { boxService } from '../services/box.service';
import { BoxResponse, BoxInvitationResponse } from '../types';
import MainLayout from '@/components/layout/MainLayout';
import { CreateBoxModal } from '../components/CreateBoxModal'; 
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Hàm hỗ trợ dịch chuỗi tọa độ lưu từ DB
const parsePosition = (posStr?: string, defaultX = 50, defaultY = 30) => {
    if (!posStr) return { x: defaultX, y: defaultY };
    const parts = posStr.split(',');
    if (parts.length !== 2) return { x: defaultX, y: defaultY };
    return { 
        x: parseFloat(parts[0]) || defaultX, 
        y: parseFloat(parts[1]) || defaultY 
    };
};

const BoxListPage: React.FC = () => {
    const [boxes, setBoxes] = useState<BoxResponse[]>([]);
    const [invitations, setInvitations] = useState<BoxInvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showInvites, setShowInvites] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [boxData, invitesData] = await Promise.all([
                boxService.getMyBoxes(0, 50),
                boxService.getMyPendingInvitations()
            ]);
            setBoxes(boxData.content || []);
            setInvitations(invitesData || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu Box:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvite = async (boxId: string) => {
        try {
            await boxService.acceptInvite(boxId);
            toast.success("Đã tham gia Không gian thành công!");
            fetchAllData(); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi tham gia");
        }
    };

    const handleRejectInvite = async (boxId: string) => {
        try {
            await boxService.rejectInvite(boxId);
            toast.success("Đã từ chối lời mời");
            fetchAllData(); 
        } catch (error: any) {
            toast.error("Lỗi khi từ chối");
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center w-full min-h-screen bg-white dark:bg-[#0a0a0a]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0a0a0a] relative overflow-x-hidden transition-colors duration-300 pb-24">
                
                {/* --- LƯỚI CARO BACKGROUND MỜ --- */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>

                {/* --- BANNER TEXT-ONLY VỚI SAO 4 CÁNH & GRADIENT SÁNG --- */}
                <div className="w-full relative z-10 overflow-hidden bg-gradient-to-br from-green-400 via-green-100 to-white dark:from-green-900 dark:via-green-900/30 dark:to-[#0a0a0a]">
                    
                    {/* Hiệu ứng mờ ảo (Blur) thêm chiều sâu */}
                    <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-white/40 dark:bg-green-500/10 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4 z-0 pointer-events-none" />
                    
                    {/* Trang trí: Các ngôi sao 4 cánh (Sparkles) */}
                    <Sparkles className="absolute top-6 left-8 text-white/80 dark:text-green-300/60" size={28} strokeWidth={1.5} />
                    <Sparkles className="absolute bottom-4 left-[20%] text-green-600/30 dark:text-green-400/40" size={40} strokeWidth={1} />
                    <Sparkles className="absolute top-10 right-[35%] text-white/90 dark:text-green-200/50" size={20} />
                    <Sparkles className="absolute bottom-8 right-[15%] text-green-500/40 dark:text-green-500/30" size={32} strokeWidth={1.5} />
                    <Sparkles className="absolute top-1/2 right-10 text-green-600/20 dark:text-green-400/20 -translate-y-1/2" size={48} strokeWidth={1} />
                    <Sparkles className="absolute top-4 right-[55%] text-white/60 dark:text-green-300/40" size={16} />

                    {/* Banner Content Ngắn Gọn */}
                    <div className="relative z-20 max-w-[1440px] mx-auto px-5 md:px-10 py-10 md:py-14">
                        <h1 className="text-[32px] md:text-[42px] lg:text-[48px] font-normal text-green-950 dark:text-green-50 mb-3 tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>
                            Lưu giữ câu chuyện của bạn
                        </h1>
                        <p className="text-base md:text-lg text-green-800/80 dark:text-green-200/70 max-w-2xl font-medium">
                            Tạo không gian chia sẻ những khoảnh khắc và kỷ niệm tuyệt vời.
                        </p>
                    </div>
                </div>

                {/* --- KHU VỰC NỘI DUNG CHÍNH --- */}
                <div className="max-w-[1440px] mx-auto px-5 md:px-10 relative z-10 pt-10 md:pt-14">
                    
                    {/* --- TIÊU ĐỀ BOX --- */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[36px] md:text-[44px] font-normal text-black dark:text-white tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>
                                Box của bạn
                            </h2>
                        </div>
                    </div>

                    {/* --- KHU VỰC LỜI MỜI --- */}
                    {invitations.length > 0 && showInvites && (
                        <div className="mb-14 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                Lời mời đang chờ ({invitations.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {invitations.map(invite => (
                                    <div key={invite.id} className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/80 dark:border-zinc-800 rounded-[24px] p-5 flex flex-col justify-between transition-colors hover:shadow-md">
                                        <div className="flex items-center gap-4 overflow-hidden mb-5">
                                            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shrink-0">
                                                {invite.boxAvatar ? (
                                                    <span className="text-2xl">{invite.boxAvatar}</span>
                                                ) : invite.inviterAvatar ? (
                                                    <img src={invite.inviterAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <Package size={24} className="text-zinc-400 dark:text-zinc-500" />
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mb-0.5">
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{invite.inviterName}</span> mời bạn vào
                                                </p>
                                                <p className="text-xl font-normal text-black dark:text-white truncate" style={{ fontFamily: '"Jua", sans-serif' }}>{invite.boxName}</p>
                                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                                    {formatDistanceToNow(new Date(invite.sentAt), { addSuffix: true, locale: vi })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <button 
                                                onClick={() => handleAcceptInvite(invite.boxId)}
                                                className="flex-1 h-11 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500 dark:hover:text-white flex items-center justify-center transition-all font-medium"
                                            >
                                                <Check size={20} strokeWidth={2.5} />
                                            </button>
                                            <button 
                                                onClick={() => handleRejectInvite(invite.boxId)}
                                                className="flex-1 h-11 rounded-xl bg-zinc-50 text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-500 flex items-center justify-center transition-all font-medium"
                                            >
                                                <X size={20} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- DANH SÁCH BOX & NÚT TẠO (4 card/hàng, gap-8) --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-16">
                        
                        {/* CÁC THẺ BOX */}
                        {boxes.map((box) => {
                            const textPos = parsePosition(box.textPosition, 50, 30);
                            const avatarPos = parsePosition(box.avatarPosition, 15, 70);
                            
                            const bgImage = box.coverImage;
                            const isBgImageValid = bgImage?.includes('/') || bgImage?.startsWith('http');
                            const isAvatarUrl = box.avatar?.includes('/') || box.avatar?.startsWith('http');

                            return (
                                <Link 
                                    to={`/box/${box.id}`} 
                                    key={box.id}
                                    className="group block relative"
                                >
                                    {/* THẺ BOX HOÀN TOÀN TRONG SUỐT VÀ KHÔNG ĐỔ BÓNG */}
                                    <div 
                                        className="w-full aspect-[7/4] rounded-[28px] overflow-hidden relative transition-transform duration-500 group-hover:-translate-y-2 bg-transparent"
                                        style={{ containerType: 'inline-size' }}
                                    >
                                        {/* Ảnh Cover/Màu nền */}
                                        {isBgImageValid ? (
                                            <img 
                                                src={bgImage} 
                                                alt={box.name} 
                                                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700" 
                                            />
                                        ) : (
                                            <div 
                                                className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700" 
                                                style={{ backgroundColor: box.themeColor || '#27272a' }} 
                                            />
                                        )}

                                        {/* Chữ Nổi */}
                                        <div 
                                            className="absolute flex items-center transform -translate-x-1/2 -translate-y-1/2 select-none z-20 pointer-events-none"
                                            style={{ 
                                                left: `${textPos.x}%`, 
                                                top: `${textPos.y}%`,
                                                textShadow: '0px 2px 12px rgba(0,0,0,0.8), 0px 1px 4px rgba(0,0,0,0.6)'
                                            }}
                                        >
                                            <span 
                                                className="text-white font-normal tracking-wide whitespace-nowrap" 
                                                style={{ fontFamily: '"Jua", sans-serif', fontSize: '7cqw' }}
                                            >
                                                {box.name}
                                            </span>
                                        </div>

                                        {/* Khung Polaroid Avatar */}
                                        <div 
                                            className="absolute bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.25)] rotate-[-6deg] z-10 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
                                            style={{ 
                                                left: `${avatarPos.x}%`, 
                                                top: `${avatarPos.y}%`,
                                                width: '18cqw', 
                                                height: '18cqw', 
                                                padding: '1.2cqw', 
                                                borderRadius: '2.5cqw' 
                                            }}
                                        >
                                            {isAvatarUrl ? (
                                                <img 
                                                    src={box.avatar} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Avatar" 
                                                    style={{ borderRadius: '1.5cqw' }} 
                                                />
                                            ) : (
                                                <div 
                                                    className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center border border-zinc-200 border-dashed"
                                                    style={{ borderRadius: '1.5cqw' }} 
                                                >
                                                    {box.avatar === '📦' ? <Package className="text-zinc-400" style={{ width: '6cqw', height: '6cqw' }} /> : <span style={{ fontSize: '7cqw' }}>{box.avatar}</span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Badge Số Lượng Thành Viên */}
                                        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white/95 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                            <Users size={14} />
                                            <span>{box.memberCount}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* NÚT TẠO BOX - Thiết kế đồng bộ Card */}
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group w-full aspect-[7/4] rounded-[28px] border-2 border-dashed border-green-400/60 dark:border-green-600/60 hover:border-green-500 dark:hover:border-green-500 bg-white/50 dark:bg-zinc-900/50 hover:bg-green-50/50 dark:hover:bg-green-900/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 relative z-10 backdrop-blur-sm"
                        >
                            <div className="w-14 h-14 bg-green-500 dark:bg-green-600 rounded-[22px] flex items-center justify-center text-white shadow-[0px_4px_12px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform duration-300">
                                <Plus size={28} strokeWidth={3} />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-green-600 dark:text-green-400 text-[26px] font-normal" style={{ fontFamily: '"Jua", sans-serif' }}>
                                    Create Box
                                </span>
                                <span className="text-green-600/60 dark:text-green-400/60 text-sm font-bold font-sans mt-1">
                                    Max boxes (5)
                                </span>
                            </div>
                        </button>

                    </div>
                </div>
            </div>

            <CreateBoxModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={fetchAllData} 
            />
        </MainLayout>
    );
};

export default BoxListPage;