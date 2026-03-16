import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Loader2, Leaf, Star } from 'lucide-react';
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
  const [modalType, setModalType] = useState<'SETTINGS' | 'INVITE' | null>(null);
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
              
              // Lấy toàn bộ ảnh bài đăng của các thành viên để nạp vào Calendar Grid
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
        toast.error(`You have reached the limit of ${MAX_JOURNEYS} active journeys.`);
        return true;
    }
    return false;
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[9990] overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] transition-colors duration-500 flex flex-col font-sans"
        style={{ fontFamily: '"Jua", sans-serif' }}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
           <div className="w-full max-w-[1000px] h-full relative">
              <div className="absolute -top-10 -left-20 w-[400px] h-[300px] bg-blue-200/80 dark:bg-blue-600/10 blur-[100px] rounded-full transition-colors duration-500" />
              <div className="absolute top-[50%] -right-20 w-[400px] h-[400px] bg-purple-200/60 dark:bg-purple-600/10 blur-[120px] rounded-full transition-colors duration-500" />
              <Leaf className="absolute right-[10%] top-[15%] w-16 h-16 text-blue-300 dark:text-blue-500/30 opacity-50 rotate-12 transition-colors duration-500" />
              <Star className="absolute left-[10%] top-[45%] w-12 h-12 text-purple-300 dark:text-purple-500/30 opacity-50 -rotate-12 transition-colors duration-500" />
           </div>
        </div>

        <div className="relative min-h-full w-full flex flex-col items-center sm:py-12 pt-20 pb-4">
           <div className="mt-auto sm:my-auto relative z-10 w-full max-w-[460px] mx-auto min-h-[85vh] sm:min-h-0 flex flex-col px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-8">
               
               <div className="flex flex-col h-full">
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

                  <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar px-1 pb-4">
                    {activeTab === 'INVITATIONS' ? (
                      <div className="space-y-2">
                        <InvitationList onSuccess={refreshAll} />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {listLoading ? (
                          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-zinc-400 animate-spin" /></div>
                        ) : activeJourneys.length === 0 ? (
                          <div className="text-center py-10 text-zinc-500 dark:text-zinc-400 text-[15px] font-sans">
                            No active journeys. <br/>Create a new one or join via code.
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
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
               </div>
           </div>
        </div>
      </div>

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