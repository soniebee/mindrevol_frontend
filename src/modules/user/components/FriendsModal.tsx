<<<<<<< HEAD
import React, { useEffect, useState, useRef } from 'react';
=======
import React, { useCallback, useEffect, useState } from 'react';
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Loader2, Search, UserPlus, Users, BellRing, Sparkles } from 'lucide-react';
import { friendService, FriendshipResponse, UserSummary } from '../services/friend.service';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; 
}

export const FriendsModal: React.FC<Props> = ({ isOpen, onClose, userId }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isMe = !userId || userId === currentUser?.id;
  const [activeTab, setActiveTab] = useState<'FIND' | 'REQUESTS' | 'FRIENDS'>('FRIENDS');

  const [friends, setFriends] = useState<FriendshipResponse[]>([]);
  const [requests, setRequests] = useState<FriendshipResponse[]>([]);
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

<<<<<<< HEAD
  // ==========================================
  // GESTURE: KÉO ĐỂ ĐÓNG (DRAG TO DISMISS)
  // ==========================================
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const onDragStart = (clientY: number) => {
    dragStartY.current = clientY;
    setIsDragging(true);
  };

  const onDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    if (dragY > 150) { 
      onClose();
      setTimeout(() => setDragY(0), 300);
    } else {
      setDragY(0); 
    }
  };
=======
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'FRIENDS') {
        const data = isMe ? await friendService.getMyFriends() : await friendService.getUserFriends(userId!);
        setFriends(data || []);
      } else if (activeTab === 'REQUESTS' && isMe) {
        const data = await friendService.getIncomingRequests();
        setRequests(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isMe, userId]);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await friendService.searchUsers(searchQuery);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd

  useEffect(() => {
    if (isOpen) {
      if (!isMe) setActiveTab('FRIENDS'); 
      fetchData();
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, isMe, fetchData]);

  useEffect(() => {
    if (activeTab === 'FIND' && searchQuery.trim().length > 1) {
      const timer = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, searchQuery, handleSearch]);

  const handleSendRequest = async (targetId: string) => {
    try {
      await friendService.sendFriendRequest(targetId);
      setSearchResults(prev => prev.map(u => u.id === targetId ? { ...u, friendshipStatus: 'PENDING' } : u));
    } catch {
      alert("Failed to send the request.");
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      await friendService.acceptRequest(friendshipId);
      setRequests(prev => prev.filter(r => r.id !== friendshipId));
      fetchData(); 
    } catch {
      alert("Failed to process the request.");
    }
  };

  const handleDecline = async (friendshipId: string) => {
    try {
      await friendService.declineRequest(friendshipId);
      setRequests(prev => prev.filter(r => r.id !== friendshipId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigateToProfile = (friendId: string) => {
    onClose(); 
    navigate(`/profile/${friendId}`); 
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-end md:items-center justify-center p-0 md:p-6 font-quicksand">
      
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* MODAL CONTAINER - Transform kéo xuống */}
      <div 
        className={`relative w-full h-[95vh] md:h-auto max-w-[560px] bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl flex flex-col md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95 ${!isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : 'none' }}
      >
        
<<<<<<< HEAD
        {/* KHU VỰC ĐỂ KÉO */}
        <div 
            className="w-full shrink-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md cursor-grab active:cursor-grabbing touch-none z-30"
            onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
            onTouchEnd={onDragEnd}
            onMouseDown={(e) => onDragStart(e.clientY)}
            onMouseMove={(e) => onDragMove(e.clientY)}
            onMouseUp={onDragEnd}
            onMouseLeave={() => { if (isDragging) onDragEnd(); }}
        >
            <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                <div className="w-12 h-1.5 bg-[#D6CFC7] dark:bg-[#3A3734] rounded-full"></div>
            </div>

            <div className="flex items-center justify-between px-6 md:px-8 py-2 md:py-5 border-b border-[#F4EBE1] dark:border-[#2B2A29]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[14px] flex items-center justify-center shadow-sm">
                        <Users className="w-5 h-5 text-[#1A1A1A] dark:text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[#1A1A1A] dark:text-white text-[1.4rem] font-black tracking-tight pointer-events-none">
                        {isMe ? "Kết nối" : "Danh sách bạn bè"}
                    </h2>
                </div>
                <button 
                    onMouseDown={e => e.stopPropagation()}
                    onTouchStart={e => e.stopPropagation()}
                    onClick={onClose} 
                    className="p-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] transition-colors active:scale-95 cursor-pointer"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>
=======
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                  <Users size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-normal text-zinc-900 dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>
                {isMe ? "Friends & Connections" : "Friends list"}
              </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
            <X size={20} />
          </button>
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
        </div>

        {/* --- TABS --- */}
        {isMe && (
<<<<<<< HEAD
            <div className="px-6 md:px-8 py-4 flex gap-3 overflow-x-auto custom-scrollbar shrink-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[#F4EBE1] dark:border-[#2B2A29] z-10">
                <TabButton active={activeTab === 'FIND'} onClick={() => setActiveTab('FIND')} label="Tìm bạn" icon={<Search size={18} strokeWidth={2.5} />} />
                <TabButton active={activeTab === 'REQUESTS'} onClick={() => setActiveTab('REQUESTS')} label="Lời mời" icon={<BellRing size={18} strokeWidth={2.5} />} count={requests.length} />
                <TabButton active={activeTab === 'FRIENDS'} onClick={() => setActiveTab('FRIENDS')} label="Bạn bè" icon={<Users size={18} strokeWidth={2.5} />} />
=======
            <div className="px-6 py-4 flex gap-3 overflow-x-auto custom-scrollbar shrink-0 bg-slate-50 dark:bg-zinc-900/30">
                <TabButton 
                    active={activeTab === 'FIND'} 
                    onClick={() => setActiveTab('FIND')} 
                    label="Find friends" 
                    icon={<Search size={16} />}
                />
                <TabButton 
                    active={activeTab === 'REQUESTS'} 
                    onClick={() => setActiveTab('REQUESTS')} 
                    label="Requests" 
                    icon={<BellRing size={16} />}
                    count={requests.length}
                />
                <TabButton 
                    active={activeTab === 'FRIENDS'} 
                    onClick={() => setActiveTab('FRIENDS')} 
                    label="Friends" 
                    icon={<Users size={16} />}
                />
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
            </div>
        )}

        {/* --- BODY CONTENT NỀN ĐỔ MÀU --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pb-safe bg-gradient-to-b from-[#F4EBE1]/30 to-white dark:from-[#1A1A1A]/30 dark:to-[#0A0A0A]">
          
          {/* TAB: FIND (TÌM BẠN) */}
          {activeTab === 'FIND' && isMe && (
            <div className="space-y-6 animate-in fade-in duration-300 pb-10">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09D9A]" strokeWidth={2.5} />
                <input 
                  placeholder="Enter a name, email, or handle..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] border border-[#D6CFC7]/50 dark:border-[#2B2A29] rounded-[20px] h-[56px] pl-12 pr-5 text-[1rem] font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-all shadow-sm focus:bg-white dark:focus:bg-[#1A1A1A]"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#8A8580] w-8 h-8" /></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1A1A1A] rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullname}&background=random`} className="w-12 h-12 rounded-[16px] bg-[#E2D9CE] object-cover shadow-sm border border-[#F4EBE1] dark:border-[#2B2A29]" alt="avatar"/>
                        <div>
                          <p className="font-black text-[#1A1A1A] dark:text-white text-[1.1rem] leading-tight mb-0.5">{user.fullname}</p>
                          <p className="text-[0.85rem] text-[#8A8580] dark:text-[#A09D9A] font-bold">@{user.handle}</p>
                        </div>
                      </div>
                      {user.friendshipStatus === 'NONE' ? (
<<<<<<< HEAD
                        <button onClick={() => handleSendRequest(user.id)} className="w-[44px] h-[44px] bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:scale-105 active:scale-95 rounded-[16px] transition-all flex items-center justify-center shadow-md">
                          <UserPlus className="w-5 h-5 ml-1" strokeWidth={2.5} />
                        </button>
                      ) : user.friendshipStatus === 'PENDING' ? (
                        <span className="text-[0.75rem] font-extrabold uppercase tracking-widest text-[#A09D9A] px-4 py-2 bg-[#F4EBE1]/50 dark:bg-[#2B2A29]/50 rounded-[12px]">Đã gửi</span>
                      ) : user.friendshipStatus === 'ACCEPTED' ? (
                        <span className="text-[0.75rem] font-extrabold uppercase tracking-widest text-[#2E7D32] dark:text-[#81C784] px-4 py-2 bg-[#E6F4EA] dark:bg-[#1C3325] border border-[#A5D6A7] dark:border-[#2E7D32]/50 rounded-[12px]">Bạn bè</span>
=======
                        <button 
                          onClick={() => handleSendRequest(user.id)}
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-[14px] transition-colors"
                          title="Send friend request"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>
                      ) : user.friendshipStatus === 'PENDING' ? (
                        <span className="text-[11px] font-bold text-zinc-500 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                          Sent
                        </span>
                      ) : user.friendshipStatus === 'ACCEPTED' ? (
                        <span className="text-[11px] font-bold text-green-600 dark:text-green-400 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-900/50">
                          Friends
                        </span>
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
                      ) : null}
                    </div>
                  ))
                ) : searchQuery.length > 1 ? (
<<<<<<< HEAD
                  <div className="flex flex-col items-center justify-center py-10 opacity-70">
                      <Sparkles className="w-12 h-12 text-[#A09D9A] mb-4" />
                      <div className="text-center text-[#8A8580] font-bold text-[1rem]">Không tìm thấy người dùng này.</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-60">
                      <Search className="w-12 h-12 text-[#A09D9A] mb-4" />
                      <div className="text-center text-[#8A8580] font-bold text-[1.05rem]">Nhập tên hoặc ID để tìm kiếm.</div>
=======
                  <div className="text-center text-zinc-500 py-10 font-['Jua'] text-lg">No matching users found.</div>
                ) : (
                  <div className="text-center text-zinc-400 py-10 text-sm font-medium">
                    Enter a name or ID to find people.
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: REQUESTS */}
          {activeTab === 'REQUESTS' && isMe && (
<<<<<<< HEAD
            isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#8A8580] w-8 h-8" /></div> :
            requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-60">
                    <BellRing className="w-12 h-12 text-[#A09D9A] mb-4" />
                    <div className="text-center text-[#8A8580] font-bold text-[1.05rem]">Bạn chưa có lời mời kết bạn nào.</div>
                </div>
            ) :
            <div className="space-y-4 animate-in fade-in duration-300 pb-10">
=======
            isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div> :
            requests.length === 0 ? <div className="text-center text-zinc-400 py-12 font-['Jua'] text-xl opacity-60">No requests yet</div> :
            <div className="space-y-3">
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
              {requests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-[#1A1A1A] p-4 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5 gap-4">
                  <div className="flex items-center gap-4">
                    <img src={req.friend.avatarUrl || `https://ui-avatars.com/api/?name=${req.friend.fullname}&background=random`} className="w-12 h-12 rounded-[16px] object-cover bg-[#E2D9CE] shadow-sm" alt="avatar"/>
                    <div>
                      <p className="font-black text-[#1A1A1A] dark:text-white text-[1.1rem] leading-tight mb-0.5">{req.friend.fullname}</p>
                      <p className="text-[0.85rem] text-[#8A8580] dark:text-[#A09D9A] font-bold">@{req.friend.handle}</p>
                    </div>
                  </div>
<<<<<<< HEAD
                  <div className="flex gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
                    <button onClick={() => handleAccept(req.id)} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-[16px] text-[0.95rem] font-black transition-all active:scale-95 shadow-md">
                      Chấp nhận
                    </button>
                    <button onClick={() => handleDecline(req.id)} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#F4EBE1] dark:bg-[#2B2A29] text-[#1A1A1A] dark:text-white rounded-[16px] text-[0.95rem] font-black hover:bg-[#E2D9CE] dark:hover:bg-[#3A3734] transition-all active:scale-95">
                      Từ chối
=======
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleAccept(req.id)} className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-[14px] text-[13px] font-bold text-white transition-colors shadow-sm">
                      Accept
                    </button>
                    <button onClick={() => handleDecline(req.id)} className="flex-1 sm:flex-none px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-[13px] font-bold rounded-[14px] transition-colors">
                      Decline
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: FRIENDS */}
          {activeTab === 'FRIENDS' && (
<<<<<<< HEAD
            isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#8A8580] w-8 h-8" /></div> :
            friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-60">
                    <Users className="w-12 h-12 text-[#A09D9A] mb-4" />
                    <div className="text-center text-[#8A8580] font-bold text-[1.05rem]">{isMe ? "Danh sách bạn bè trống." : "Người dùng này chưa kết nối với ai."}</div>
                </div>
            ) :
            <div className="space-y-2 animate-in fade-in duration-300 pb-10">
=======
            isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div> :
            friends.length === 0 ? <div className="text-center text-zinc-400 py-12 font-['Jua'] text-xl opacity-60">{isMe ? "No friends yet" : "This user has no friends yet."}</div> :
            <div className="space-y-2">
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
              {friends.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3.5 bg-transparent hover:bg-white dark:hover:bg-[#1A1A1A] rounded-[24px] transition-all group cursor-pointer border border-transparent hover:border-[#D6CFC7]/30 dark:hover:border-[#3A3734]/50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] active:scale-[0.98]">
                  
                  <div className="flex items-center gap-4 flex-1" onClick={() => handleNavigateToProfile(f.friend.id)}>
                    <div className="relative">
                      <img src={f.friend.avatarUrl || `https://ui-avatars.com/api/?name=${f.friend.fullname}&background=random`} className="w-12 h-12 rounded-[16px] object-cover bg-[#E2D9CE] shadow-sm" alt="avatar"/>
                      {f.friend.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#4CAF50] rounded-full border-[3px] border-[#F4EBE1] dark:border-[#121212] shadow-sm"></div>}
                    </div>
                    <div>
                      <p className="font-black text-[#1A1A1A] dark:text-white text-[1.1rem] leading-tight mb-0.5">{f.friend.fullname}</p>
                      <p className="text-[0.85rem] text-[#8A8580] dark:text-[#A09D9A] font-bold">@{f.friend.handle}</p>
                    </div>
                  </div>
                  
                  {isMe && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/chat/${f.friend.id}`); }}
                          className="w-[44px] h-[44px] flex items-center justify-center bg-[#F4EBE1]/50 hover:bg-[#1A1A1A] dark:bg-[#2B2A29] dark:hover:bg-white rounded-[16px] text-[#8A8580] dark:text-[#A09D9A] hover:text-white dark:hover:text-[#1A1A1A] transition-all active:scale-95 shrink-0"
                      >
                          <MessageCircle size={20} strokeWidth={2.5} />
                      </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};

<<<<<<< HEAD
// --- COMPONENT TAB ---
const TabButton = ({ active, onClick, label, count, icon }: any) => (
=======
// --- Pill-style tab button ---
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon: React.ReactNode;
}

const TabButton = ({ active, onClick, label, count = 0, icon }: TabButtonProps) => (
>>>>>>> d65c8bfdb711e984404edea7c2aa246d35b23ccd
  <button
    onClick={onClick}
    className={cn(
      "px-5 py-2.5 rounded-[18px] text-[0.9rem] font-black transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95",
      active 
        ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-0.5" 
        : "bg-[#F4EBE1]/50 text-[#8A8580] dark:bg-[#2B2A29] dark:text-[#A09D9A] hover:bg-[#F4EBE1] dark:hover:bg-[#3A3734] border border-transparent hover:border-[#D6CFC7]/50 dark:hover:border-white/5"
    )}
  >
    {icon}
    {label}
    {count > 0 && <span className="text-white bg-red-500 px-2 py-0.5 rounded-[8px] text-[0.7rem] font-bold shadow-sm">{count}</span>}
  </button>
);