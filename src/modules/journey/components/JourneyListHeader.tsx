import React from 'react';
import { X, Plus, Search, Loader2, Layout, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  currentCount: number;
  maxJourneys: number;
  isLimitReached: boolean;
  inviteCode: string;
  setInviteCode: (code: string) => void;
  joinLoading: boolean;
  onJoin: () => void;
  onCreateClick: () => void;
  onClose: () => void;
  activeTab: 'MY_JOURNEYS' | 'INVITATIONS';
  setActiveTab: (tab: 'MY_JOURNEYS' | 'INVITATIONS') => void;
  alerts: { requests: number; invitations: number };
}

export const JourneyListHeader: React.FC<Props> = ({
  currentCount, maxJourneys, isLimitReached,
  inviteCode, setInviteCode, joinLoading, onJoin,
  onCreateClick, onClose,
  activeTab, setActiveTab, alerts
}) => {
  return (
    <div className="p-6 pb-0 space-y-4 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[28px] text-black dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>
              Journeys
          </h2>
          <span className={cn("text-sm font-bold", isLimitReached ? 'text-red-500' : 'text-zinc-400')}>
              ({currentCount}/{maxJourneys})
          </span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onCreateClick}
            disabled={isLimitReached} 
            className={cn(
                "p-2.5 rounded-full transition-all active:scale-95",
                isLimitReached 
                    ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
            )}
            title={isLimitReached ? "Limit reached" : "Create new journey"}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Join */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder={isLimitReached ? "Limit reached" : "Enter invite code..."}
            disabled={isLimitReached} 
            className={cn(
                "w-full bg-zinc-50 dark:bg-[#1A1A1A] border border-zinc-200 dark:border-zinc-800 rounded-[14px] py-2.5 pl-10 pr-4 text-sm text-black dark:text-white outline-none uppercase transition-all font-sans font-medium placeholder:normal-case",
                isLimitReached ? "opacity-50 cursor-not-allowed" : "focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            )}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          />
        </div>
        <button 
          onClick={onJoin}
          disabled={!inviteCode || joinLoading || isLimitReached} 
          className="px-5 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-sm font-bold rounded-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center min-w-[70px] shadow-sm"
        >
          {joinLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Join'}
        </button>
      </div>

      {/* TABS Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mt-2">
        <button 
          onClick={() => setActiveTab('MY_JOURNEYS')}
          className={cn(
              "flex-1 pb-3 text-sm font-bold flex justify-center items-center gap-2 relative transition-colors",
              activeTab === 'MY_JOURNEYS' ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          )}
        >
          <Layout className="w-4 h-4" /> Active
          {alerts.requests > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1" title="Pending requests" />
          )}
        </button>
        
        <button 
          onClick={() => setActiveTab('INVITATIONS')}
          className={cn(
              "flex-1 pb-3 text-sm font-bold flex justify-center items-center gap-2 relative transition-colors",
              activeTab === 'INVITATIONS' ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          )}
        >
          <Bell className="w-4 h-4" /> Invitations
          {alerts.invitations > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold ml-1">
              {alerts.invitations}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};