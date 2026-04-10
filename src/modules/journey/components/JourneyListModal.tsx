import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast'; 

import { useJoinJourney } from '../hooks/useJoinJourney'; 
import { journeyService } from '../services/journey.service';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { JourneyResponse, JourneyStatus, UserActiveJourneyResponse } from '../types';

import { JourneyListHeader } from './JourneyListHeader';
import { ActiveJourneyCard } from './ActiveJourneyCard';
import { JourneySettingsModal } from './JourneySettingsModal';
import { InviteMembersModal } from './InviteMembersModal';
import { CreateJourneyModal } from './CreateJourneyModal';
import { InvitationList } from './InvitationList';
import { PendingRequestsList } from './PendingRequestsList';

import { cn } from '@/lib/utils';

interface MergedJourney extends JourneyResponse {
  memberAvatars?: (string | null)[];
  daysRemaining?: number;
  totalMembers?: number;
  thumbnailUrl?: string; 
  previewImages?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const JourneyListModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'MY_JOURNEYS' | 'INVITATIONS'>('MY_JOURNEYS');
  const [selectedJourney, setSelectedJourney] = useState<MergedJourney | null>(null);
  const [modalType, setModalType] = useState<'SETTINGS' | 'INVITE' | 'REQUESTS' | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [journeys, setJourneys] = useState<MergedJourney[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const { inviteCode, setInviteCode, handleJoin, isLoading: joinLoading } = useJoinJourney(() => refreshAll());

  const [alerts, setAlerts] = useState({
    invitations: 0,
    requests: 0,
    journeyIdsWithRequests: new Set<string>()
  });

  const fetchJourneys = async () => {
      setListLoading(true);
      try {
          const [myList, activeList] = await Promise.all([
              journeyService.getMyJourneys(),
              journeyService.getUserActiveJourneys("me")
          ]);

          const merged: MergedJourney[] = myList.map((journey: JourneyResponse) => {
              const extraData = activeList.find((a: UserActiveJourneyResponse) => a.id === journey.id);
              
              const checkinImages = extraData?.checkins
                  ?.filter((c: any) => c.imageUrl)
                  .map((c: any) => c.imageUrl as string) || [];

              return {
                  ...journey,
                  memberAvatars: extraData?.memberAvatars || [],
                  daysRemaining: extraData?.daysRemaining,
                  totalMembers: extraData?.totalMembers || journey.participantCount || 1,
                  themeColor: extraData?.themeColor || journey.themeColor,
                  avatar: extraData?.avatar || journey.avatar,
                  thumbnailUrl: extraData?.thumbnailUrl,
                  previewImages: checkinImages.length > 0 
                      ? checkinImages 
                      : (extraData?.thumbnailUrl ? [extraData.thumbnailUrl] : [])
              };
          });
          
          setJourneys(merged);
      } catch (error) {
          console.error("Failed to load active journeys", error);
      } finally {
          setListLoading(false);
      }
  };

  const fetchAlerts = async () => {
    try {
      const data = await journeyService.getAlerts();
      setAlerts({
        invitations: data.journeyPendingInvitations,
        requests: data.waitingApprovalRequests,
        journeyIdsWithRequests: new Set(data.journeyIdsWithRequests)
      });
    } catch (e) {
      console.error("Failed to fetch alerts", e);
    }
  };

  const refreshAll = async () => {
    fetchJourneys();
    fetchAlerts();
  };

  useEffect(() => {
    if (isOpen) refreshAll();
  }, [isOpen]);

  const activeJourneys = useMemo(() => {
    if (!journeys) return [];
    return journeys.filter(j => 
      [JourneyStatus.ACTIVE, JourneyStatus.ONGOING, JourneyStatus.UPCOMING].includes(j.status as JourneyStatus)
    );
  }, [journeys]);

  const MAX_JOURNEYS = 5;
  const currentCount = activeJourneys.length;
  const isLimitReached = currentCount >= MAX_JOURNEYS;

  if (!isOpen) return null;

  const handleEnterJourney = (journeyId: string) => {
    onClose();
    navigate(`/?journeyId=${journeyId}`);
    window.dispatchEvent(new CustomEvent('JOURNEY_SELECTED', { detail: journeyId }));
  };

  const handleActionWhenLimitReached = () => {
    if (isLimitReached) {
        toast.error(`Bạn đã đạt giới hạn ${MAX_JOURNEYS} Hành trình đang hoạt động.`);
        return true;
    }
    return false;
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9900] overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#F4EBE1] to-white dark:from-[#121212] dark:to-[#0A0A0A] transition-colors duration-500 flex flex-col font-quicksand">
        
        {/* Nền Texture siêu mờ tạo chiều sâu */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center z-0 opacity-40">
           <div className="w-full max-w-[1200px] h-full relative">
              <div className="absolute top-[10%] -left-20 w-[400px] h-[400px] bg-[#E2D9CE]/60 dark:bg-white/5 blur-[100px] rounded-full" />
              <div className="absolute top-[40%] -right-20 w-[500px] h-[500px] bg-white/40 dark:bg-[#1A1A1A]/40 blur-[120px] rounded-full" />
           </div>
        </div>

        <div className="relative min-h-full w-full flex flex-col items-center pt-16 md:pt-20 pb-10">
           <div className="relative z-10 w-full max-w-[640px] mx-auto flex flex-col px-4 md:px-0 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-8">
               
               {/* Gọi Component Header (Nếu bạn cần sửa Header cũng hãy sửa nó theo tone màu Beige/Dark) */}
               <JourneyListHeader 
                  currentCount={currentCount}
                  maxJourneys={MAX_JOURNEYS}
                  isLimitReached={isLimitReached}
                  inviteCode={inviteCode}
                  setInviteCode={setInviteCode}
                  joinLoading={joinLoading}
                  onJoin={() => { if (!handleActionWhenLimitReached()) handleJoin(); }}
                  onCreateClick={() => { if (!handleActionWhenLimitReached()) setIsCreateOpen(true); }}
                  onClose={onClose}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  alerts={alerts}
               />

               <div className="w-full mt-6 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[40px] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734]">
                  {activeTab === 'INVITATIONS' ? (
                    <div className="animate-in fade-in">
                      <InvitationList onSuccess={refreshAll} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {listLoading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#8A8580] animate-spin" /></div>
                      ) : activeJourneys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                           <div className="w-20 h-20 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[24px] flex items-center justify-center mb-5 shadow-sm">
                               <BookOpen className="text-[#8A8580] dark:text-[#A09D9A] w-10 h-10" strokeWidth={2.5} />
                           </div>
                           <h3 className="text-[1.3rem] font-black text-[#1A1A1A] dark:text-white mb-2 tracking-tight text-center">Chưa có hành trình</h3>
                           <p className="text-[#8A8580] dark:text-[#A09D9A] text-center max-w-[280px] mb-6 text-[0.95rem] font-semibold leading-relaxed">
                               Tham gia qua mã mời hoặc tự tạo hành trình mới ngay.
                           </p>
                           <button 
                               onClick={() => { if (!handleActionWhenLimitReached()) setIsCreateOpen(true); }}
                               className="flex items-center gap-2 px-6 py-3.5 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[20px] font-extrabold text-[1rem] shadow-sm active:scale-95 transition-all"
                           >
                               <Plus size={20} strokeWidth={3} /> Bắt đầu hành trình
                           </button>
                        </div>
                      ) : (
                        activeJourneys.map((journey) => (
                          <ActiveJourneyCard 
                            key={journey.id}
                            journey={journey}
                            isOwner={String(user?.id) === String(journey.creatorId)}
                            isPending={journey.currentUserStatus?.role === 'PENDING'}
                            hasPendingRequests={String(user?.id) === String(journey.creatorId) && alerts.journeyIdsWithRequests.has(journey.id)}
                            canInvite={String(user?.id) === String(journey.creatorId) || journey.visibility === 'PUBLIC'}
                            onEnter={handleEnterJourney}
                            onInvite={(j) => { setSelectedJourney(j); setModalType('INVITE'); }}
                            onSettings={(j) => { setSelectedJourney(j); setModalType('SETTINGS'); }}
                            onRequest={(j) => { setSelectedJourney(j); setModalType('REQUESTS'); }}
                          />
                        ))
                      )}
                    </div>
                  )}
               </div>

           </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {selectedJourney && modalType === 'SETTINGS' && (
        <JourneySettingsModal 
          isOpen={true}
          journey={selectedJourney as any} 
          onClose={() => { setModalType(null); setSelectedJourney(null); }}
          onUpdateSuccess={refreshAll} 
        />
      )}

      {selectedJourney && modalType === 'INVITE' && (
        <InviteMembersModal 
          isOpen={true}
          journeyId={selectedJourney.id}
          inviteCode={selectedJourney.inviteCode} 
          onClose={() => { setModalType(null); setSelectedJourney(null); }}
        />
      )}

      {selectedJourney && modalType === 'REQUESTS' && (
        <PendingRequestsList 
          isOpen={true}
          journeyId={selectedJourney.id}
          onClose={() => { setModalType(null); setSelectedJourney(null); }}
          onSuccess={refreshAll}
        />
      )}

      <CreateJourneyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { 
            setIsCreateOpen(false); 
            refreshAll(); 
            window.dispatchEvent(new Event('JOURNEY_UPDATED'));
        }}
      />
    </>,
    document.body
  );
};