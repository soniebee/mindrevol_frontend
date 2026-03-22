import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Loader2, Search, UserPlus, Users, BellRing } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      if (!isMe) setActiveTab('FRIENDS'); 
      fetchData();
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, activeTab, userId]);

  useEffect(() => {
    if (activeTab === 'FIND' && searchQuery.trim().length > 1) {
      const timer = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'FRIENDS') {
        let data = isMe ? await friendService.getMyFriends() : await friendService.getUserFriends(userId!);
        setFriends(data || []);
      } else if (activeTab === 'REQUESTS' && isMe) {
        const data = await friendService.getIncomingRequests();
        setRequests(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const data = await friendService.searchUsers(searchQuery);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (targetId: string) => {
    try {
      await friendService.sendFriendRequest(targetId);
      setSearchResults(prev => prev.map(u => u.id === targetId ? { ...u, friendshipStatus: 'PENDING' } : u));
    } catch (error) {
      alert("Lỗi khi gửi lời mời.");
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      await friendService.acceptRequest(friendshipId);
      setRequests(prev => prev.filter(r => r.id !== friendshipId));
      fetchData(); 
    } catch (error) {
      alert("Lỗi xử lý");
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
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="w-full max-w-lg bg-white dark:bg-[#121212] rounded-[36px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                  <Users size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-normal text-zinc-900 dark:text-white" style={{ fontFamily: '"Jua", sans-serif' }}>
                {isMe ? "Bạn Bè & Kết Nối" : "Danh sách bạn bè"}
              </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* --- TABS (PILL STYLE) --- */}
        {isMe && (
            <div className="px-6 py-4 flex gap-3 overflow-x-auto custom-scrollbar shrink-0 bg-slate-50 dark:bg-zinc-900/30">
                <TabButton 
                    active={activeTab === 'FIND'} 
                    onClick={() => setActiveTab('FIND')} 
                    label="Tìm bạn" 
                    icon={<Search size={16} />}
                />
                <TabButton 
                    active={activeTab === 'REQUESTS'} 
                    onClick={() => setActiveTab('REQUESTS')} 
                    label="Lời mời" 
                    icon={<BellRing size={16} />}
                    count={requests.length}
                />
                <TabButton 
                    active={activeTab === 'FRIENDS'} 
                    onClick={() => setActiveTab('FRIENDS')} 
                    label="Bạn bè" 
                    icon={<Users size={16} />}
                />
            </div>
        )}

        {/* --- BODY CONTENT --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 dark:bg-black">
          
          {/* TAB: FIND (TÌM BẠN) */}
          {activeTab === 'FIND' && isMe && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  placeholder="Nhập tên, email hoặc handle..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[20px] py-4 pl-12 pr-4 text-[15px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullname}&background=random`} 
                          className="w-12 h-12 rounded-[16px] bg-zinc-100 object-cover"
                          alt="avatar"
                        />
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white text-[15px]">{user.fullname}</p>
                          <p className="text-[13px] text-zinc-500 font-medium">@{user.handle}</p>
                        </div>
                      </div>
                      
                      {user.friendshipStatus === 'NONE' ? (
                        <button 
                          onClick={() => handleSendRequest(user.id)}
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-[14px] transition-colors"
                          title="Gửi kết bạn"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>
                      ) : user.friendshipStatus === 'PENDING' ? (
                        <span className="text-[11px] font-bold text-zinc-500 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                          Đã gửi
                        </span>
                      ) : user.friendshipStatus === 'ACCEPTED' ? (
                        <span className="text-[11px] font-bold text-green-600 dark:text-green-400 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-900/50">
                          Bạn bè
                        </span>
                      ) : null}
                    </div>
                  ))
                ) : searchQuery.length > 1 ? (
                  <div className="text-center text-zinc-500 py-10 font-['Jua'] text-lg">Không tìm thấy người dùng này.</div>
                ) : (
                  <div className="text-center text-zinc-400 py-10 text-sm font-medium">
                    Nhập tên hoặc ID để tìm kiếm bạn đồng hành.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: REQUESTS (LỜI MỜI) */}
          {activeTab === 'REQUESTS' && isMe && (
            isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div> :
            requests.length === 0 ? <div className="text-center text-zinc-400 py-12 font-['Jua'] text-xl opacity-60">Không có lời mời nào</div> :
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm gap-4">
                  <div className="flex items-center gap-3">
                    <img src={req.friend.avatarUrl || `https://ui-avatars.com/api/?name=${req.friend.fullname}&background=random`} className="w-12 h-12 rounded-[16px] object-cover" alt="avatar"/>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white text-[15px]">{req.friend.fullname}</p>
                      <p className="text-[13px] text-zinc-500 font-medium">@{req.friend.handle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleAccept(req.id)} className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-[14px] text-[13px] font-bold text-white transition-colors shadow-sm">
                      Chấp nhận
                    </button>
                    <button onClick={() => handleDecline(req.id)} className="flex-1 sm:flex-none px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-[13px] font-bold rounded-[14px] transition-colors">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: FRIENDS (DANH SÁCH BẠN BÈ) */}
          {activeTab === 'FRIENDS' && (
            isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div> :
            friends.length === 0 ? <div className="text-center text-zinc-400 py-12 font-['Jua'] text-xl opacity-60">{isMe ? "Chưa có bạn bè" : "Người dùng này chưa có bạn bè."}</div> :
            <div className="space-y-2">
              {friends.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-zinc-900 rounded-[20px] transition-colors group cursor-pointer border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 hover:shadow-sm">
                  
                  <div className="flex items-center gap-3 flex-1" onClick={() => handleNavigateToProfile(f.friend.id)}>
                    <div className="relative">
                      <img src={f.friend.avatarUrl || `https://ui-avatars.com/api/?name=${f.friend.fullname}&background=random`} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="avatar"/>
                      {f.friend.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#121212]"></div>}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white text-[15px]">{f.friend.fullname}</p>
                      <p className="text-[13px] text-zinc-500 font-medium">@{f.friend.handle}</p>
                    </div>
                  </div>
                  
                  {isMe && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/chat/${f.friend.id}`); }}
                          className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 transition-colors shrink-0"
                      >
                          <MessageCircle size={18} />
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

// --- COMPONENT TAB MỚI (DẠNG VIÊN THUỐC / PILL) ---
const TabButton = ({ active, onClick, label, count, icon }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-5 py-2.5 rounded-[16px] text-[13px] font-bold transition-all flex items-center gap-2 whitespace-nowrap",
      active 
        ? "bg-black text-white dark:bg-white dark:text-black shadow-md" 
        : "bg-white text-zinc-500 hover:text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-transparent"
    )}
  >
    {icon}
    {label}
    {count > 0 && <span className="text-white bg-red-500 px-1.5 py-0.5 rounded-md text-[10px] ml-1">{count}</span>}
  </button>
);