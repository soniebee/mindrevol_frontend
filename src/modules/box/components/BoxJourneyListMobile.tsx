import React from 'react';
import { BookOpen } from 'lucide-react';
import { MiniCalendarGrid } from './BoxJourneyShared';

interface BoxJourneyListMobileProps {
    journeys: any[];
    setIsCreateJourneyModalOpen: (val: boolean) => void;
    navigate: (path: string) => void;
}

export const BoxJourneyListMobile: React.FC<BoxJourneyListMobileProps> = ({
    journeys, setIsCreateJourneyModalOpen, navigate
}) => {
    const activeJourneys = journeys.filter(j => j.status !== 'COMPLETED');
    const endedJourneys = journeys.filter(j => j.status === 'COMPLETED');

    return (
        <div className="flex md:hidden flex-col gap-6 mt-4">
            
            <div className="flex justify-end w-full px-1">
                <button 
                    onClick={() => setIsCreateJourneyModalOpen(true)}
                    className="text-green-950 dark:text-green-400 text-xl font-normal font-['Jua'] hover:opacity-70 transition-opacity"
                >
                    + Create Journey
                </button>
            </div>

            <div className="w-full bg-orange-100 dark:bg-[#2A1F1A] rounded-[28px] p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.20)] dark:shadow-none">
                <h2 className="text-red-950 dark:text-orange-200 text-2xl font-normal font-['Jua'] mb-4 pl-1">Ongoing</h2>
                
                {activeJourneys.length === 0 ? (
                    <div className="w-full h-24 bg-white/50 dark:bg-zinc-900/50 rounded-2xl flex items-center justify-center border border-dashed border-orange-200 dark:border-orange-900/50 text-orange-900/50 dark:text-orange-200/50 font-['Jua'] text-lg">
                        Chưa có hành trình
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {activeJourneys.map(journey => (
                            <div 
                                key={journey.id}
                                onClick={() => navigate(`/journey/${journey.id}`)}
                                className="w-full bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform border border-transparent dark:border-zinc-800"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 w-[70%]">
                                        {journey.avatar ? (
                                            <span className="text-2xl">{journey.avatar}</span>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500"><BookOpen size={16}/></div>
                                        )}
                                        <h3 className="font-['Jua'] text-xl text-zinc-900 dark:text-zinc-100 truncate">{journey.name}</h3>
                                    </div>
                                    <div className="text-sky-900 dark:text-sky-400 text-base font-normal font-['Jua'] whitespace-nowrap">
                                        Open -&gt;
                                    </div>
                                </div>
                                <MiniCalendarGrid previewImages={journey.previewImages} isMobileStyle={true} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full bg-indigo-50 dark:bg-[#1A1A2A] rounded-[28px] p-5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.20)] dark:shadow-none mb-10">
                <h2 className="text-indigo-900 dark:text-indigo-300 text-2xl font-normal font-['Jua'] mb-4 pl-1">Memories</h2>
                
                {endedJourneys.length === 0 ? (
                    <div className="w-full h-24 bg-white/50 dark:bg-zinc-900/50 rounded-2xl flex items-center justify-center border border-dashed border-indigo-200 dark:border-indigo-900/50 text-indigo-900/50 dark:text-indigo-300/50 font-['Jua'] text-lg">
                        Trống
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {endedJourneys.map(journey => (
                            <div 
                                key={journey.id}
                                onClick={() => navigate(`/journey/${journey.id}`)}
                                className="w-full bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform border border-transparent dark:border-zinc-800 opacity-95"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 w-[70%]">
                                        {journey.avatar && <span className="text-2xl grayscale">{journey.avatar}</span>}
                                        <h3 className="font-['Jua'] text-xl text-zinc-700 dark:text-zinc-300 truncate">{journey.name}</h3>
                                    </div>
                                    <div className="text-sky-900 dark:text-sky-400 text-base font-normal font-['Jua'] whitespace-nowrap">
                                        Open -&gt;
                                    </div>
                                </div>
                                <MiniCalendarGrid previewImages={journey.previewImages} isMobileStyle={true} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};