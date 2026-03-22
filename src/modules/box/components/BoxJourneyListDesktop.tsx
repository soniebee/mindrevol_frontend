import React from 'react';
import { Compass, LayoutGrid, ListTree, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniCalendarGrid, formatDate } from './BoxJourneyShared';

interface BoxJourneyListDesktopProps {
    journeys: any[];
    viewMode: 'grid' | 'timeline';
    setViewMode: (mode: 'grid' | 'timeline') => void;
    setIsCreateJourneyModalOpen: (val: boolean) => void;
    navigate: (path: string) => void;
    boxName: string;
}

export const BoxJourneyListDesktop: React.FC<BoxJourneyListDesktopProps> = ({
    journeys, viewMode, setViewMode, setIsCreateJourneyModalOpen, navigate, boxName
}) => {
    const activeJourneys = journeys.filter(j => j.status !== 'COMPLETED');
    const endedJourneys = journeys.filter(j => j.status === 'COMPLETED');

    return (
        <div className="hidden md:block mt-8">
            {/* --- HEADER KHU VỰC --- */}
            <div className="flex justify-between items-end mb-8 gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div>
                    <h2 className="text-[32px] font-normal text-zinc-900 dark:text-white flex items-center gap-3 tracking-wide" style={{ fontFamily: '"Jua", sans-serif' }}>
                        <div className="w-12 h-12 rounded-[18px] bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                            <BookOpen size={24} strokeWidth={2} />
                        </div>
                        Các giai đoạn
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-base mt-2 font-medium">Dấu chân thời gian của "{boxName}"</p>
                </div>
                
                <div className="flex flex-col items-end gap-5">
                    {/* Nút Create Journey chuẩn Design */}
                    <button 
                        onClick={() => setIsCreateJourneyModalOpen(true)}
                        className="text-green-900 dark:text-green-400 text-[22px] font-normal font-['Jua'] hover:opacity-70 transition-opacity"
                    >
                        + Create Journey
                    </button>

                    {/* Nút Toggle Style Mới */}
                    <div className="flex items-center bg-zinc-100/80 dark:bg-zinc-900/60 rounded-[18px] p-1 border border-zinc-200/60 dark:border-zinc-800/50">
                        <button 
                            onClick={() => setViewMode('timeline')}
                            className={cn("px-5 py-2 rounded-2xl transition-all flex items-center gap-2 text-lg font-normal font-['Jua']", viewMode === 'timeline' ? "bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400")}
                        >
                            <ListTree size={18} /> Dòng thời gian
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={cn("px-5 py-2 rounded-2xl transition-all flex items-center gap-2 text-lg font-normal font-['Jua']", viewMode === 'grid' ? "bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400")}
                        >
                            <LayoutGrid size={18} /> Danh sách
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TRẠNG THÁI TRỐNG --- */}
            {journeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-zinc-900/20 rounded-[32px] border border-zinc-200 dark:border-zinc-800/50 border-dashed shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="text-blue-500 dark:text-zinc-400 w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-normal text-zinc-900 dark:text-zinc-300 mb-2" style={{ fontFamily: '"Jua", sans-serif' }}>Trang giấy còn trống</h3>
                    <p className="text-zinc-500 text-center max-w-md mb-8 text-base font-medium leading-relaxed">Mỗi không gian là một cuốn sách. Hãy bắt đầu lưu giữ những chương đầu tiên của bạn.</p>
                    <button 
                        onClick={() => setIsCreateJourneyModalOpen(true)} 
                        className="text-green-900 dark:text-green-400 text-2xl font-normal font-['Jua'] hover:opacity-70 transition-opacity"
                    >
                        + Create Journey
                    </button>
                </div>
            ) : (
                <>
                    {/* =====================================================================
                        CHẾ ĐỘ DẠNG LƯỚI (Ngang như Mobile)
                    ===================================================================== */}
                    {viewMode === 'grid' && (
                        <div className="flex flex-col gap-10">
                            
                            {/* KHỐI ONGOING */}
                            <div className="w-full bg-orange-100 dark:bg-[#2A1F1A] rounded-[36px] p-8 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.10)] dark:shadow-none">
                                <h2 className="text-red-950 dark:text-orange-200 text-3xl font-normal font-['Jua'] mb-6 pl-2">
                                    Ongoing
                                </h2>
                                
                                {activeJourneys.length === 0 ? (
                                    <div className="w-full h-32 bg-white/50 dark:bg-zinc-900/50 rounded-[24px] flex items-center justify-center border border-dashed border-orange-200 dark:border-orange-900/50 text-orange-900/50 dark:text-orange-200/50 font-['Jua'] text-xl">
                                        Chưa có hành trình
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {activeJourneys.map(journey => (
                                            <div 
                                                key={journey.id}
                                                onClick={() => navigate(`/journey/${journey.id}`)}
                                                className="w-full bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform border border-transparent dark:border-zinc-800 flex flex-col justify-between"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4 w-[75%]">
                                                        {journey.avatar ? (
                                                            <span className="text-[32px]">{journey.avatar}</span>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500"><Compass size={24}/></div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-['Jua'] text-2xl text-zinc-900 dark:text-zinc-100 truncate">{journey.name}</h3>
                                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mt-0.5">
                                                                {formatDate(journey.createdAt || journey.startDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-sky-900 dark:text-sky-400 text-lg font-normal font-['Jua'] bg-sky-50 dark:bg-sky-900/20 px-3 py-1 rounded-xl whitespace-nowrap">
                                                        Open -&gt;
                                                    </div>
                                                </div>
                                                <MiniCalendarGrid previewImages={journey.previewImages} isMobileStyle={true} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* KHỐI MEMORIES */}
                            {(endedJourneys.length > 0 || true) && (
                                <div className="w-full bg-indigo-50 dark:bg-[#1A1A2A] rounded-[36px] p-8 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.10)] dark:shadow-none mb-10">
                                    <h2 className="text-indigo-900 dark:text-indigo-300 text-3xl font-normal font-['Jua'] mb-6 pl-2">
                                        Memories
                                    </h2>
                                    
                                    {endedJourneys.length === 0 ? (
                                        <div className="w-full h-32 bg-white/50 dark:bg-zinc-900/50 rounded-[24px] flex items-center justify-center border border-dashed border-indigo-200 dark:border-indigo-900/50 text-indigo-900/50 dark:text-indigo-300/50 font-['Jua'] text-xl">
                                            Trống
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {endedJourneys.map(journey => (
                                                <div 
                                                    key={journey.id}
                                                    onClick={() => navigate(`/journey/${journey.id}`)}
                                                    className="w-full bg-white/90 dark:bg-zinc-900 rounded-[24px] p-6 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform border border-transparent dark:border-zinc-800 flex flex-col justify-between"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-4 w-[75%]">
                                                            {journey.avatar && <span className="text-[32px] grayscale opacity-90">{journey.avatar}</span>}
                                                            <div>
                                                                <h3 className="font-['Jua'] text-2xl text-zinc-700 dark:text-zinc-300 truncate">{journey.name}</h3>
                                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mt-0.5">
                                                                    {formatDate(journey.createdAt || journey.startDate)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-sky-900 dark:text-sky-400 text-lg font-normal font-['Jua'] bg-sky-50 dark:bg-sky-900/20 px-3 py-1 rounded-xl whitespace-nowrap">
                                                            Open -&gt;
                                                        </div>
                                                    </div>
                                                    <MiniCalendarGrid previewImages={journey.previewImages} isMobileStyle={true} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =====================================================================
                        CHẾ ĐỘ DÒNG THỜI GIAN (TIMELINE)
                    ===================================================================== */}
                    {viewMode === 'timeline' && (
                        <div className="flex flex-col relative py-8 pl-4">
                            <div className="absolute top-[82px] left-0 right-0 h-[2px] border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 z-0"></div>

                            <div className="flex flex-row overflow-x-auto custom-scrollbar snap-x snap-mandatory gap-10 pb-10 pt-4">
                                {journeys.map((journey) => (
                                    <div 
                                        key={journey.id} 
                                        className="relative flex flex-col w-[320px] shrink-0 snap-start cursor-pointer group"
                                        onClick={() => navigate(`/journey/${journey.id}`)}
                                    >
                                        <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 pl-2">
                                            {formatDate(journey.createdAt || journey.startDate)}
                                        </div>

                                        <div className="w-4 h-4 rounded-full bg-amber-400 dark:bg-amber-600 ring-4 ring-white dark:ring-[#121212] shadow-sm group-hover:bg-amber-300 transition-colors z-10 relative mb-8"></div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.06)] dark:shadow-none hover:shadow-[0px_8px_20px_rgba(0,0,0,0.1)] transition-all h-full flex flex-col border border-zinc-100 dark:border-zinc-800 group-hover:-translate-y-2">
                                            <h3 className="font-normal text-2xl text-zinc-900 dark:text-white transition-colors mb-2 flex items-center justify-between" style={{ fontFamily: '"Jua", sans-serif' }}>
                                                <div className="flex items-center gap-3 w-[70%]">
                                                    {journey.avatar && <span className="text-[28px] opacity-90 group-hover:scale-110 transition-transform">{journey.avatar}</span>}
                                                    <span className="truncate">{journey.name}</span>
                                                </div>
                                            </h3>
                                            
                                            <MiniCalendarGrid previewImages={journey.previewImages} isMobileStyle={true} />

                                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                                <span className="text-lg font-normal font-['Jua'] text-sky-900 dark:text-sky-400 group-hover:opacity-80 transition-opacity">
                                                    Open -&gt;
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="relative flex flex-col w-[150px] shrink-0 snap-start">
                                    <div className="text-xs text-transparent mb-4">.</div>
                                    <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 ring-4 ring-white dark:ring-[#121212] z-10 relative mb-8 mt-0.5"></div>
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Khởi nguồn</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};