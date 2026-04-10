import React, { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { ActiveJourneyCard } from '@/modules/journey/components/ActiveJourneyCard';
import { JourneySettingsModal } from '@/modules/journey/components/JourneySettingsModal';
import { InviteMembersModal } from '@/modules/journey/components/InviteMembersModal';
import { PendingRequestsList } from '@/modules/journey/components/PendingRequestsList';

interface BoxJourneyListMobileProps {
    journeys: any[];
    setIsCreateJourneyModalOpen: (val: boolean) => void;
    navigate: (path: string) => void;
}

export const BoxJourneyListMobile: React.FC<BoxJourneyListMobileProps> = ({
    journeys, setIsCreateJourneyModalOpen, navigate
}) => {
    const { user } = useAuth();
    const activeJourneys = journeys.filter(j => j.status !== 'COMPLETED');
    const endedJourneys = journeys.filter(j => j.status === 'COMPLETED');

    const [settingsJourney, setSettingsJourney] = useState<any>(null);
    const [inviteJourney, setInviteJourney] = useState<any>(null);
    const [requestsJourney, setRequestsJourney] = useState<any>(null);

    return (
        <div className="flex md:hidden flex-col gap-6 mt-4 font-quicksand">
            
            <div className="flex justify-between items-center w-full px-1 mb-2">
                <h2 className="text-[#1A1A1A] dark:text-white text-[1.5rem] font-black tracking-tight">Hành trình</h2>
                <button 
                    onClick={() => setIsCreateJourneyModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[20px] font-black text-[0.9rem] shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Tạo mới
                </button>
            </div>

            <div className="w-full bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[36px] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734]">
                <h2 className="text-[#1A1A1A] dark:text-white text-[1.2rem] font-black mb-5 pl-1 tracking-tight">Đang diễn ra</h2>
                
                {activeJourneys.length === 0 ? (
                    <button 
                        onClick={() => setIsCreateJourneyModalOpen(true)}
                        className="w-full h-28 bg-[#F4EBE1]/30 dark:bg-[#2B2A29]/30 hover:bg-[#F4EBE1]/60 rounded-[28px] flex flex-col items-center justify-center border-2 border-dashed border-[#D6CFC7] dark:border-[#4A4D55] hover:border-[#1A1A1A] transition-all group active:scale-[0.98]"
                    >
                         <Plus size={24} strokeWidth={3} className="text-[#8A8580] dark:text-[#A09D9A] group-hover:text-[#1A1A1A] dark:group-hover:text-white mb-1 transition-colors" />
                         <span className="text-[#8A8580] dark:text-[#A09D9A] group-hover:text-[#1A1A1A] dark:group-hover:text-white font-extrabold text-[0.9rem] transition-colors">Thêm Hành trình</span>
                    </button>
                ) : (
                    <div className="flex flex-col gap-5">
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
                <div className="w-full bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-md rounded-[36px] p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] mb-10 grayscale-[20%]">
                    <h2 className="text-[#8A8580] dark:text-[#A09D9A] text-[1.1rem] font-black mb-5 pl-1 tracking-tight">Kỷ niệm đã khép lại</h2>
                    <div className="flex flex-col gap-5">
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

            {/* ĐÃ FIX THIẾU PROPS */}
            {settingsJourney && (
                <JourneySettingsModal 
                    isOpen={!!settingsJourney}
                    onClose={() => setSettingsJourney(null)}
                    journey={settingsJourney}
                    onUpdateSuccess={() => window.location.reload()} 
                />
            )}
            {inviteJourney && (
                <InviteMembersModal
                    isOpen={!!inviteJourney}
                    onClose={() => setInviteJourney(null)}
                    journeyId={inviteJourney.id}
                    inviteCode={inviteJourney.inviteCode}
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