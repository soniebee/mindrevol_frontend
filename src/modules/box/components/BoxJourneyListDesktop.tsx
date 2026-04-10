import React, { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { ActiveJourneyCard } from '@/modules/journey/components/ActiveJourneyCard';
import { JourneySettingsModal } from '@/modules/journey/components/JourneySettingsModal';
import { InviteMembersModal } from '@/modules/journey/components/InviteMembersModal';
import { PendingRequestsList } from '@/modules/journey/components/PendingRequestsList';

interface BoxJourneyListDesktopProps {
    journeys: any[];
    viewMode: 'grid' | 'timeline';
    setViewMode: (mode: 'grid' | 'timeline') => void;
    setIsCreateJourneyModalOpen: (val: boolean) => void;
    navigate: (path: string) => void;
    boxName: string;
}

export const BoxJourneyListDesktop: React.FC<BoxJourneyListDesktopProps> = ({
    journeys, setIsCreateJourneyModalOpen, navigate, boxName
}) => {
    const { user } = useAuth();
    const activeJourneys = journeys.filter(j => j.status !== 'COMPLETED');
    const endedJourneys = journeys.filter(j => j.status === 'COMPLETED');

    // States cho các Modals
    const [settingsJourney, setSettingsJourney] = useState<any>(null);
    const [inviteJourney, setInviteJourney] = useState<any>(null);
    const [requestsJourney, setRequestsJourney] = useState<any>(null);

    return (
        <div className="hidden md:block mt-6">
            
            <div className="flex justify-between items-end mb-8 gap-6 border-b border-[#F4EBE1] dark:border-[#2B2A29] pb-6">
                <div>
                    <h2 className="text-[2.2rem] font-black text-[#1A1A1A] dark:text-white flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 rounded-[20px] bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md flex items-center justify-center text-[#1A1A1A] dark:text-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5">
                            <BookOpen size={26} strokeWidth={2.5} />
                        </div>
                        Hành trình
                    </h2>
                    <p className="text-[#8A8580] dark:text-[#A09D9A] text-[1.05rem] mt-3 font-bold">
                        Dấu chân của "{boxName}"
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-5">
                    <button 
                        onClick={() => setIsCreateJourneyModalOpen(true)}
                        className="flex items-center gap-2 px-7 py-3.5 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[24px] font-black text-[1rem] shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={20} strokeWidth={3} /> Tạo Hành trình
                    </button>
                </div>
            </div>

            {journeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white/30 dark:bg-[#1A1A1A]/30 backdrop-blur-sm rounded-[40px] border-2 border-[#D6CFC7] dark:border-[#3A3734] border-dashed shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
                    <div className="w-20 h-20 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] flex items-center justify-center mb-6 shadow-sm border border-white dark:border-transparent">
                        <BookOpen className="text-[#8A8580] dark:text-[#A09D9A] w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[1.6rem] font-black text-[#1A1A1A] dark:text-white mb-2 tracking-tight">Một trang giấy trắng</h3>
                    <p className="text-[#8A8580] dark:text-[#A09D9A] text-center max-w-md mb-8 text-[1.05rem] font-semibold leading-relaxed">
                        Mỗi không gian là một câu chuyện. Hãy bắt đầu lưu giữ những khoảnh khắc đầu tiên.
                    </p>
                    <button 
                        onClick={() => setIsCreateJourneyModalOpen(true)} 
                        className="flex items-center gap-2 px-8 py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[24px] font-black text-[1rem] shadow-[0_8px_24px_rgba(0,0,0,0.15)] active:scale-95 transition-all hover:-translate-y-1"
                    >
                        <Plus size={20} strokeWidth={3} /> Bắt đầu ngay
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    
                    <div className="w-full bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[40px] p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] relative">
                        <h2 className="text-[#1A1A1A] dark:text-white text-[1.6rem] font-black mb-8 pl-2 tracking-tight">
                            Đang diễn ra
                        </h2>
                        
                        {activeJourneys.length === 0 ? (
                            <button 
                                onClick={() => setIsCreateJourneyModalOpen(true)}
                                className="w-full h-36 bg-[#F4EBE1]/30 dark:bg-[#2B2A29]/30 hover:bg-[#F4EBE1]/60 dark:hover:bg-[#2B2A29]/60 rounded-[32px] flex flex-col items-center justify-center border-2 border-dashed border-[#D6CFC7] dark:border-[#4A4D55] hover:border-[#1A1A1A] dark:hover:border-white transition-all group active:scale-[0.99]"
                            >
                                <Plus size={28} strokeWidth={3} className="text-[#8A8580] dark:text-[#A09D9A] group-hover:text-[#1A1A1A] dark:group-hover:text-white mb-2 transition-colors" />
                                <span className="text-[#8A8580] dark:text-[#A09D9A] group-hover:text-[#1A1A1A] dark:group-hover:text-white font-extrabold text-[1rem] transition-colors">Tạo hành trình mới</span>
                            </button>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {activeJourneys.map(journey => (
                                    <ActiveJourneyCard 
                                        key={journey.id}
                                        journey={journey}
                                        isOwner={journey.creatorId === user?.id || journey.role === 'OWNER'}
                                        isPending={false} 
                                        hasPendingRequests={journey.hasPendingRequests || false}
                                        canInvite={journey.creatorId === user?.id || journey.role === 'OWNER' || journey.role === 'ADMIN' || journey.visibility === 'PUBLIC'}
                                        onEnter={() => navigate(`/journey/${journey.id}`)}
                                        onInvite={(j) => setInviteJourney(j)}
                                        onSettings={(j) => setSettingsJourney(j)}
                                        onRequest={(j) => setRequestsJourney(j)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {(endedJourneys.length > 0) && (
                        <div className="w-full bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-md rounded-[40px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] mb-10 grayscale-[30%] hover:grayscale-0 transition-all duration-500">
                            <h2 className="text-[#8A8580] dark:text-[#A09D9A] text-[1.5rem] font-black mb-8 pl-2 tracking-tight">
                                Kỷ niệm đã khép lại
                            </h2>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {endedJourneys.map(journey => (
                                    <ActiveJourneyCard 
                                        key={journey.id}
                                        journey={journey}
                                        isOwner={journey.creatorId === user?.id || journey.role === 'OWNER'}
                                        isPending={false}
                                        hasPendingRequests={false}
                                        canInvite={false}
                                        onEnter={() => navigate(`/journey/${journey.id}`)}
                                        onInvite={() => {}}
                                        onSettings={(j) => setSettingsJourney(j)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ĐÃ FIX: THÊM PROPS CHO MODALS */}
            {settingsJourney && (
                <JourneySettingsModal 
                    isOpen={!!settingsJourney}
                    onClose={() => setSettingsJourney(null)}
                    journey={settingsJourney}
                    onUpdateSuccess={() => window.location.reload()} // Load lại trang khi save settings
                />
            )}
            {inviteJourney && (
                <InviteMembersModal
                    isOpen={!!inviteJourney}
                    onClose={() => setInviteJourney(null)}
                    journeyId={inviteJourney.id}
                    inviteCode={inviteJourney.inviteCode} // Đã thêm
                />
            )}
            {requestsJourney && (
                <PendingRequestsList
                    isOpen={!!requestsJourney}
                    onClose={() => setRequestsJourney(null)}
                    journeyId={requestsJourney.id}
                />
            )}
        </div>
    );
};