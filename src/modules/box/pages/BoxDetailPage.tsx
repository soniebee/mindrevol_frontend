import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Maximize2 } from 'lucide-react'; 
import MainLayout from '@/components/layout/MainLayout';
import { useBoxDetail } from '../hooks/useBoxDetail';
import { JourneyMap } from '@/modules/map/components/JourneyMap';
import { BoxMembersModal } from '../components/BoxMembersModal';
import { CreateJourneyModal } from '@/modules/journey/components/CreateJourneyModal'; 
import { UpdateBoxModal } from '../components/UpdateBoxModal'; 
import { useAuth } from '@/modules/auth/store/AuthContext';

import { BoxHeader } from '../components/BoxHeader';
import { BoxJourneyList } from '../components/BoxJourneyList';

// [MỚI] Import trang BoxMoodPage mình vừa tạo
import { BoxMoodPage } from '@/modules/mood/pages/BoxMoodPage'; 

const BoxDetailPage: React.FC = () => {
    const { boxId } = useParams<{ boxId: string }>();
    const { user } = useAuth();
    
    const {
        box, journeys, loading, isOwner, navigate,
        viewMode, setViewMode, isMenuOpen, setIsMenuOpen, menuRef,
        isMembersModalOpen, setIsMembersModalOpen,
        isCreateJourneyModalOpen, setIsCreateJourneyModalOpen,
        isUpdateBoxModalOpen, setIsUpdateBoxModalOpen,
        fetchBoxData, handleArchiveBox, handleDisbandBox
    } = useBoxDetail(boxId, user?.id);

    // [MỚI] State quản lý việc mở trang Mood
    const [isMoodPageOpen, setIsMoodPageOpen] = useState(false);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[#121212]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            </MainLayout>
        );
    }
    
    if (!box) return null;

    // [MỚI] Trả về trang BoxMoodPage full màn hình nếu state được bật
    if (isMoodPageOpen) {
        return <BoxMoodPage boxId={box.id} onBack={() => setIsMoodPageOpen(false)} />;
    }

    return (
        <MainLayout>
            <div className="w-full min-h-screen bg-white dark:bg-[#121212] relative overflow-hidden pb-24">
                
                {/* --- VỆT SÁNG --- */}
                <div className="absolute -left-[20%] md:-left-[50px] -top-[57px] w-[80%] md:w-[488px] h-32 bg-amber-300/75 dark:bg-amber-500/20 blur-[100px] md:blur-[125px] pointer-events-none z-0" />

                <div className="relative z-10 max-w-[1024px] mx-auto px-4 md:px-8 pt-8 md:pt-10">
                    
                    <BoxHeader 
                        box={box}
                        isOwner={isOwner}
                        navigate={navigate}
                        menuRef={menuRef}
                        isMenuOpen={isMenuOpen}
                        setIsMenuOpen={setIsMenuOpen}
                        setIsUpdateBoxModalOpen={setIsUpdateBoxModalOpen}
                        handleArchiveBox={handleArchiveBox}
                        handleDisbandBox={handleDisbandBox}
                        setIsMembersModalOpen={setIsMembersModalOpen}
                    />

                    {/* --- KHU VỰC MAP & MOOD --- */}
                    <div className="mt-8 md:mt-10 mb-10 md:mb-12 grid grid-cols-2 gap-4 md:gap-8">
                        
                        {/* 1. BẢN ĐỒ KỶ NIỆM (CỘT 1) */}
                        <div className="flex flex-col w-full aspect-square md:aspect-[4/3]">
                            <h2 className="text-black dark:text-white text-[18px] sm:text-[20px] md:text-2xl font-normal font-['Jua'] mb-2 md:mb-4 pl-1 shrink-0">
                                Map
                            </h2>
                            <div className="flex-1 min-h-0 w-full bg-slate-50 dark:bg-zinc-900 rounded-[20px] md:rounded-3xl shadow-[0px_4px_4px_1px_rgba(0,0,0,0.10)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 p-2 md:p-3 relative flex flex-col">
                                <div className="w-full h-full rounded-[12px] md:rounded-[20px] overflow-hidden relative">
                                    <JourneyMap 
                                        boxId={box.id} 
                                        className="w-full h-full rounded-[inherit] overflow-hidden relative z-0" 
                                        
                                    />
                                </div>

                                <button 
                                    onClick={() => navigate(`/map?boxId=${box.id}`)}
                                    className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-[10px] md:rounded-[12px] text-zinc-700 dark:text-zinc-300 hover:text-blue-600 hover:bg-white transition-all shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 z-10 group"
                                    title="Xem bản đồ chi tiết"
                                >
                                    <Maximize2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* 2. MOOD BUBBLE (CỘT 2) - Nút để mở trang Mood */}
                        <div className="flex flex-col w-full aspect-square md:aspect-[4/3]">
                            <h2 className="text-black dark:text-white text-[18px] sm:text-[20px] md:text-2xl font-normal font-['Jua'] mb-2 md:mb-4 pl-1 truncate shrink-0">
                                Mood Bubble
                            </h2>
                            {/* [SỬA ĐỔI] Thay bằng khối nhấn (Card) mở MoodPage, sử dụng ảnh tạm */}
                            <div 
                                onClick={() => setIsMoodPageOpen(true)}
                                className="flex-1 min-h-0 w-full bg-[#e6f7f4] dark:bg-zinc-900 rounded-[20px] md:rounded-3xl shadow-[0px_4px_4px_1px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden border border-[#bce8df] dark:border-zinc-800 cursor-pointer hover:-translate-y-1 transition-transform group relative p-0"
                            >
                                {/* [SỬA ĐỔI] Thêm ảnh tạm, ảnh sẽ full kích thước ô */}
                                <img 
                                    src="https://via.placeholder.com/400" 
                                    alt="Current mood preview or add status" 
                                    className="w-full h-full object-cover rounded-inherit"
                                />
                                {/* [TÙY CHỌN] Thêm một vệt overlay nhẹ khi hover để trông xịn hơn */}
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                            </div>
                        </div>

                    </div>

                    {/* --- DANH SÁCH CÁC GIAI ĐOẠN --- */}
                    <BoxJourneyList 
                        journeys={journeys}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        setIsCreateJourneyModalOpen={setIsCreateJourneyModalOpen}
                        navigate={navigate}
                        boxName={box.name}
                    />
                </div>
            </div>

            {box && <BoxMembersModal isOpen={isMembersModalOpen} onClose={() => setIsMembersModalOpen(false)} boxId={box.id} ownerId={isOwner ? (user?.id || '') : ''} onMemberChange={() => fetchBoxData(box.id)} />}
            {box && <CreateJourneyModal isOpen={isCreateJourneyModalOpen} onClose={() => setIsCreateJourneyModalOpen(false)} onSuccess={() => fetchBoxData(box.id)} defaultBoxId={box.id} />}
            {box && <UpdateBoxModal isOpen={isUpdateBoxModalOpen} onClose={() => setIsUpdateBoxModalOpen(false)} onSuccess={() => fetchBoxData(box.id)} boxData={box} />}
        </MainLayout>
    );
};

export default BoxDetailPage;