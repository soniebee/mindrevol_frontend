import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Maximize2 } from 'lucide-react'; 
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import MainLayout from '@/components/layout/MainLayout';
import { useBoxDetail } from '../hooks/useBoxDetail';
import { JourneyMap } from '@/modules/map/components/JourneyMap';
import { BoxMembersModal } from '../components/BoxMembersModal';
import { CreateJourneyModal } from '@/modules/journey/components/CreateJourneyModal'; 
import { UpdateBoxModal } from '../components/UpdateBoxModal'; 
import { useAuth } from '@/modules/auth/store/AuthContext';

import { BoxHeader } from '../components/BoxHeader';
import { BoxJourneyListDesktop } from '../components/BoxJourneyListDesktop';
import { BoxJourneyListMobile } from '../components/BoxJourneyListMobile';

import { BoxMoodPage } from '@/modules/mood/pages/BoxMoodPage'; 
import { useBoxMoods } from '@/modules/mood/hooks/useBoxMoods'; 

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

    const { moods, handleReact } = useBoxMoods(boxId, user?.id);
    const [isMoodPageOpen, setIsMoodPageOpen] = useState(false);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A]">
                    <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#1A1A1A] dark:border-white border-t-transparent"></div>
                </div>
            </MainLayout>
        );
    }
    
    if (!box) return null;

    if (isMoodPageOpen) {
        return <BoxMoodPage boxId={box.id} onBack={() => setIsMoodPageOpen(false)} />;
    }

    const latestMood = moods.length > 0 ? moods[0] : null;

    return (
        <MainLayout>
            <div className="w-full min-h-screen bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A] relative overflow-hidden pb-24 transition-colors duration-500 font-quicksand">
                
                <div className="relative z-10 max-w-[1024px] mx-auto px-5 md:px-8 pt-10 md:pt-14">
                    
                    <BoxHeader box={box} isOwner={isOwner} navigate={navigate} menuRef={menuRef} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} setIsUpdateBoxModalOpen={setIsUpdateBoxModalOpen} handleArchiveBox={handleArchiveBox} handleDisbandBox={handleDisbandBox} setIsMembersModalOpen={setIsMembersModalOpen} />

                    {/* --- KHU VỰC MAP & MOOD --- */}
                    <div className="mt-10 md:mt-12 mb-12 md:mb-16 grid grid-cols-2 gap-5 md:gap-8">
                        
                        {/* 1. BẢN ĐỒ KỶ NIỆM */}
                        <div className="flex flex-col w-full aspect-square md:aspect-[4/3]">
                            <h2 className="text-[#1A1A1A] dark:text-white text-[1.1rem] md:text-[1.25rem] font-extrabold mb-3 pl-1 shrink-0 tracking-tight">
                                Bản đồ Kỷ niệm
                            </h2>
                            <div className="flex-1 min-h-0 w-full bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[28px] md:rounded-[36px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-white/50 dark:border-white/5 p-3 md:p-4 relative flex flex-col hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
                                <div className="w-full h-full rounded-[20px] md:rounded-[28px] overflow-hidden relative shadow-inner border border-black/5 dark:border-white/5">
                                    <JourneyMap boxId={box.id} className="w-full h-full rounded-[inherit] overflow-hidden relative z-0" />
                                </div>
                                <button onClick={() => navigate(`/map?boxId=${box.id}`)} className="absolute top-6 right-6 bg-white/90 dark:bg-[#2B2A29]/90 backdrop-blur-md w-11 h-11 flex items-center justify-center rounded-[18px] text-[#8A8580] dark:text-[#A09D9A] hover:text-[#1A1A1A] dark:hover:text-white transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-10 active:scale-95">
                                    <Maximize2 className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* 2. MOOD WIDGET */}
                        <div className="flex flex-col w-full aspect-square md:aspect-[4/3]">
                            <h2 className="text-[#1A1A1A] dark:text-white text-[1.1rem] md:text-[1.25rem] font-extrabold mb-3 pl-1 truncate shrink-0 tracking-tight">
                                Không gian Cảm xúc
                            </h2>
                            <div onClick={() => setIsMoodPageOpen(true)} className="flex-1 min-h-0 w-full bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[28px] md:rounded-[36px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-white/50 dark:border-white/5 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-all duration-300 group relative">
                                
                                {/* GIAO DIỆN MOBILE */}
                                <div className="flex md:hidden w-full h-full items-center justify-center relative">
                                    {moods.length > 0 ? (
                                        <>
                                            {moods.slice(1, 5).map((m, idx) => {
                                                const positions = ["top-[12%] left-[12%]", "bottom-[15%] right-[15%]", "top-[20%] right-[12%]", "bottom-[12%] left-[20%]"];
                                                const sizes = ["text-[2.5rem]", "text-[2.2rem]", "text-[2rem]", "text-[1.8rem]"];
                                                return (
                                                    <div key={m.id} className={`absolute ${positions[idx]} ${sizes[idx]} opacity-70 animate-bounce group-hover:scale-110 transition-transform drop-shadow-sm`} style={{ animationDelay: `${idx * 0.3}s`, animationDuration: '3s' }}>
                                                        {m.icon}
                                                    </div>
                                                );
                                            })}
                                            <div className="z-10 bg-white/80 dark:bg-black/40 p-4 rounded-full backdrop-blur-md shadow-md group-hover:scale-110 transition-transform duration-300 relative">
                                                <span className="text-[3.5rem] leading-none drop-shadow-xl">{latestMood?.icon}</span>
                                                <img src={latestMood?.avatarUrl} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-[#121212] object-cover bg-[#E2D9CE]" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-20 h-20 mb-2 drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] opacity-90"><img src="/moscow/moscow (1).png" alt="No Moods" className="w-full h-full object-contain" /></div>
                                            <span className="text-[0.85rem] font-extrabold text-[#8A8580] dark:text-[#A09D9A]">Chưa có cảm xúc</span>
                                        </div>
                                    )}
                                </div>

                                {/* GIAO DIỆN DESKTOP */}
                                <div className="hidden md:flex flex-col w-full h-full p-6 relative">
                                    {latestMood ? (
                                        <div className="flex flex-col h-full justify-between">
                                            {/* Top: Info & Avatar stack */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img src={latestMood.avatarUrl} className="w-12 h-12 rounded-[16px] object-cover bg-[#E2D9CE] shadow-sm" />
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[1.1rem] text-[#1A1A1A] dark:text-white leading-none mb-1">{latestMood.fullname}</span>
                                                        <span className="text-[0.8rem] font-bold text-[#8A8580] dark:text-[#A09D9A]">{formatDistanceToNow(new Date(latestMood.createdAt || Date.now()), { addSuffix: true, locale: vi })}</span>
                                                    </div>
                                                </div>
                                                
                                                {moods.length > 1 && (
                                                    <div className="flex -space-x-3 drop-shadow-sm">
                                                        {moods.slice(1, 4).map(m => (
                                                            <div key={m.id} className="w-9 h-9 rounded-full border-[3px] border-white dark:border-[#1A1A1A] bg-[#F4EBE1] flex items-center justify-center relative overflow-hidden">
                                                                <img src={m.avatarUrl} className="w-full h-full object-cover opacity-60" />
                                                                <span className="absolute text-[1.1rem] drop-shadow-md">{m.icon}</span>
                                                                {m.reactions && m.reactions.length > 0 && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1A1A1A]"></div>}
                                                            </div>
                                                        ))}
                                                        {moods.length > 4 && (
                                                            <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[0.7rem] font-black border-[3px] border-white dark:border-[#1A1A1A] z-10">
                                                                +{moods.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Middle: Icon & Message */}
                                            <div className="flex items-center gap-6 my-auto ml-2">
                                                <div className="text-[5rem] drop-shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">{latestMood.icon}</div>
                                                {latestMood.message && (
                                                    <div className="flex-1 bg-[#F4EBE1]/80 dark:bg-[#2B2A29] p-4 rounded-[20px] rounded-tl-sm text-[1rem] font-extrabold text-[#1A1A1A] dark:text-white relative shadow-sm">
                                                        <div className="absolute -left-2 top-0 w-4 h-4 bg-[#F4EBE1]/80 dark:bg-[#2B2A29]" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                                                        <p className="line-clamp-3 leading-snug">{latestMood.message}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 🔥 ĐÃ SỬA: KHÔNG HIỆN THANH REACTION NẾU LÀ MOOD CỦA MÌNH */}
                                            {latestMood.userId !== user?.id ? (
                                                <div className="flex items-center gap-2.5 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-md p-1.5 rounded-[20px] w-max">
                                                    {['👍', '❤️', '😂', '🥺'].map(emoji => (
                                                        <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReact(latestMood.id, emoji); }} className="w-10 h-10 rounded-[14px] bg-white dark:bg-[#3A3734] hover:bg-[#F4EBE1] hover:-translate-y-1 transition-all flex items-center justify-center text-[1.2rem] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-transparent dark:border-white/5">
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                    <span className="text-[0.8rem] font-bold text-[#A09D9A] ml-2 pr-3">Phản hồi nhanh</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-md px-4 py-2.5 rounded-[20px] w-max">
                                                    <span className="text-[0.85rem] font-bold text-[#1A1A1A] dark:text-white">
                                                        Đã có <span className="text-blue-500 text-[1rem]">{latestMood.reactions?.length || 0}</span> lượt tương tác
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full h-full group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-32 h-32 mb-4 drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"><img src="/moscow/moscow (6).png" alt="No Moods" className="w-full h-full object-contain" /></div>
                                            <h3 className="text-[1.3rem] font-black text-[#1A1A1A] dark:text-white mb-1">Không gian đang tĩnh lặng</h3>
                                            <p className="text-[0.95rem] font-bold text-[#8A8580] dark:text-[#A09D9A]">Nhấp vào để khuấy động hoặc hỏi thăm mọi người nhé!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <BoxJourneyListDesktop journeys={journeys} viewMode={viewMode} setViewMode={setViewMode} setIsCreateJourneyModalOpen={setIsCreateJourneyModalOpen} navigate={navigate} boxName={box.name} />
                    <BoxJourneyListMobile journeys={journeys} setIsCreateJourneyModalOpen={setIsCreateJourneyModalOpen} navigate={navigate} />

                </div>
            </div>

            {box && <BoxMembersModal isOpen={isMembersModalOpen} onClose={() => setIsMembersModalOpen(false)} boxId={box.id} ownerId={isOwner ? (user?.id || '') : ''} onMemberChange={() => fetchBoxData(box.id)} />}
            {box && <CreateJourneyModal isOpen={isCreateJourneyModalOpen} onClose={() => setIsCreateJourneyModalOpen(false)} onSuccess={() => fetchBoxData(box.id)} defaultBoxId={box.id} />}
            {box && <UpdateBoxModal isOpen={isUpdateBoxModalOpen} onClose={() => setIsUpdateBoxModalOpen(false)} onSuccess={() => fetchBoxData(box.id)} boxData={box} />}
        </MainLayout>
    );
};

export default BoxDetailPage;