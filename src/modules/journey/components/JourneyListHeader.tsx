import React from 'react';
import { X, Plus, Search, Loader2, LayoutGrid, Bell } from 'lucide-react';
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
    <div className="px-6 md:px-8 pb-3 space-y-6 shrink-0 bg-transparent font-quicksand">
      
      {/* 1. TITLE & BUTTONS */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[1.6rem] md:text-[1.8rem] font-black text-[#1A1A1A] dark:text-white tracking-tight">
              Hành trình
          </h2>
          <span className={cn("text-[0.95rem] font-extrabold", isLimitReached ? 'text-red-500' : 'text-[#8A8580] dark:text-[#A09D9A]')}>
              ({currentCount}/{maxJourneys})
          </span>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onCreateClick}
            disabled={isLimitReached} 
            className={cn(
                "p-2.5 rounded-[16px] transition-all flex items-center justify-center",
                isLimitReached 
                    ? "bg-[#E2D9CE] dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] cursor-not-allowed" 
                    : "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-95"
            )}
            title={isLimitReached ? "Đã đạt giới hạn" : "Tạo hành trình mới"}
          >
            <Plus size={20} strokeWidth={3} />
          </button>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-[16px] bg-[#F4EBE1]/50 dark:bg-[#2B2A29] text-[#8A8580] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#3A3734] transition-colors active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 2. NHẬP MÃ THAM GIA */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09D9A]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder={isLimitReached ? "Đã đạt giới hạn..." : "Nhập mã tham gia..."}
            disabled={isLimitReached} 
            className={cn(
                "w-full h-[52px] bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] rounded-[20px] pl-11 pr-4 text-[1rem] font-bold text-[#1A1A1A] dark:text-white outline-none uppercase transition-all placeholder:normal-case placeholder:font-semibold shadow-sm focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A]",
                isLimitReached ? "opacity-60 cursor-not-allowed" : ""
            )}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          />
        </div>
        <button 
          onClick={onJoin}
          disabled={!inviteCode || joinLoading || isLimitReached} 
          className="px-6 h-[52px] bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-[0.95rem] font-black rounded-[20px] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-95 flex items-center justify-center min-w-[80px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
        >
          {joinLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Vào'}
        </button>
      </div>

      {/* 3. TABS BỒNG BỀNH */}
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pt-1">
        <button 
          onClick={() => setActiveTab('MY_JOURNEYS')}
          className={cn(
              "px-5 py-2.5 rounded-[18px] text-[0.9rem] font-black transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95",
              activeTab === 'MY_JOURNEYS' 
                  ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-[0_6px_16px_rgba(0,0,0,0.12)] -translate-y-0.5" 
                  : "bg-[#F4EBE1]/50 text-[#8A8580] dark:bg-[#2B2A29] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#3A3734] border border-transparent hover:border-[#D6CFC7]/50 dark:hover:border-white/5"
          )}
        >
          <LayoutGrid size={18} strokeWidth={2.5} /> Đang diễn ra
        </button>
        
        <button 
          onClick={() => setActiveTab('INVITATIONS')}
          className={cn(
              "px-5 py-2.5 rounded-[18px] text-[0.9rem] font-black transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95",
              activeTab === 'INVITATIONS' 
                  ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-[0_6px_16px_rgba(0,0,0,0.12)] -translate-y-0.5" 
                  : "bg-[#F4EBE1]/50 text-[#8A8580] dark:bg-[#2B2A29] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#3A3734] border border-transparent hover:border-[#D6CFC7]/50 dark:hover:border-white/5"
          )}
        >
          <Bell size={18} strokeWidth={2.5} /> Lời mời
          {alerts.invitations > 0 && (
            <span className="bg-red-500 text-white text-[0.7rem] px-2 py-0.5 rounded-[8px] font-bold shadow-sm">
              {alerts.invitations}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};