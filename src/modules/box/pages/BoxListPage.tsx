import React, { useState, useEffect } from 'react';
import { Plus, Package, Check, X, Search } from 'lucide-react';
import { boxService } from '../services/box.service';
import { BoxResponse, BoxInvitationResponse, BoxTab } from '../types';
import MainLayout from '@/components/layout/MainLayout';
import { CreateBoxModal } from '../components/CreateBoxModal'; 
import { BoxCard } from '../components/BoxCard';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Component Icon Ngôi sao 4 cánh
const Star4 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 0C12 0 12 10.5 24 12C12 13.5 12 24 12 24C12 24 12 13.5 0 12C12 10.5 12 0 12 0Z" />
  </svg>
);

const BoxListPage: React.FC = () => {
    const [boxes, setBoxes] = useState<BoxResponse[]>([]);
    const [invitations, setInvitations] = useState<BoxInvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<BoxTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, [activeTab, debouncedSearch]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'invitations') {
                const invitesData = await boxService.getMyPendingInvitations(debouncedSearch);
                setInvitations(invitesData || []);
                setBoxes([]);
            } else {
                const boxData = await boxService.getMyBoxes(activeTab, debouncedSearch, 0, 50);
                setBoxes(boxData.content || []);
                setInvitations([]);
            }
        } catch (error) {
            console.error("Error loading Box data:", error);
            toast.error("Không thể tải danh sách Box");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvite = async (invitationId: number) => {
        try {
            await boxService.acceptInvite(invitationId); 
            toast.success("Đã tham gia Box thành công! ✨");
            fetchData(); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi tham gia Box");
        }
    };

    const handleRejectInvite = async (invitationId: number) => {
        try {
            await boxService.rejectInvite(invitationId);
            toast.success("Đã từ chối lời mời");
            fetchData(); 
        } catch (error: any) {
            toast.error("Lỗi khi từ chối lời mời");
        }
    };

    const tabs: { id: BoxTab; label: string }[] = [
        { id: 'all', label: 'Tất cả' },
        { id: 'personal', label: 'Cá nhân' },
        { id: 'friends', label: 'Bạn bè' },
        { id: 'invitations', label: 'Lời mời' }
    ];

    return (
        <MainLayout>
            <div className="w-full min-h-screen bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A] relative overflow-x-hidden transition-colors duration-500 pb-24 font-quicksand">
                
                <div className="max-w-[1440px] mx-auto px-5 md:px-10 relative z-10 pt-12 md:pt-14">
                    
                    {/* BANNER HEADER */}
                    <div className="relative w-full bg-gradient-to-br from-white/60 to-[#F4EBE1]/80 dark:from-[#1A1A1A]/80 dark:to-[#2B2A29]/50 backdrop-blur-md border border-white/50 dark:border-white/5 rounded-[32px] md:rounded-[40px] p-8 md:p-12 mb-10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500">
                        
                        {/* Ngôi sao lấp lánh */}
                        <Star4 className="absolute top-6 left-6 md:left-10 w-6 h-6 text-amber-400 animate-pulse opacity-80" />
                        <Star4 className="absolute bottom-10 left-1/3 w-4 h-4 text-blue-400 animate-pulse delay-150 opacity-60" />
                        <Star4 className="absolute top-10 right-1/3 w-5 h-5 text-orange-300 animate-pulse delay-75 opacity-70" />

                        {/* Hình Moscow */}
                        <img 
                            src="/moscow/moscow (16).png" 
                            alt="Moscow Mascot" 
                            className="absolute bottom-0 right-0 md:right-8 w-32 md:w-48 object-contain pointer-events-none opacity-90 translate-x-4 md:translate-x-0 translate-y-3 drop-shadow-xl" 
                        />

                        {/* Nội dung Banner */}
                        <div className="relative z-10 text-left w-full md:w-2/3">
                            <h1 className="text-[2.2rem] md:text-[2.8rem] font-black text-[#1A1A1A] dark:text-white mb-3 tracking-tight leading-tight drop-shadow-sm">
                                Không gian của bạn
                            </h1>
                            <p className="text-[1.05rem] font-bold text-[#8A8580] dark:text-[#A09D9A] leading-relaxed max-w-[400px] md:max-w-none">
                                Nơi lưu giữ những mảnh ghép ký ức và chia sẻ cùng người thương.
                            </p>
                        </div>
                    </div>

                    {/* Thanh công cụ: Search & Tabs Float */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        {/* TABS MƯỢT MÀ */}
                        <div className="flex overflow-x-auto custom-scrollbar gap-3 pt-3 pb-5 px-2 -mx-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap px-6 py-3 rounded-[20px] text-[0.95rem] font-extrabold transition-all duration-300 ${
                                        activeTab === tab.id 
                                            ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-[2px]' 
                                            : 'bg-white/50 dark:bg-[#1A1A1A]/50 text-[#8A8580] dark:text-[#A09D9A] hover:text-[#1A1A1A] hover:bg-white dark:hover:text-white dark:hover:bg-[#2B2A29] border border-transparent hover:border-[#D6CFC7]/50 dark:hover:border-white/5'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Search Soft */}
                        <div className="relative w-full md:w-[320px] shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-[#A09D9A]" strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-5 h-[56px] bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md border border-white/50 dark:border-[#3A3734] rounded-[20px] text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white focus:bg-white dark:focus:bg-[#1A1A1A] shadow-[0_8px_24px_rgba(0,0,0,0.03)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all font-bold text-[0.95rem]"
                                placeholder="Tìm kiếm Không gian..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Danh sách Box */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#1A1A1A] dark:border-white border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'invitations' && (
                                <div className="animate-in fade-in slide-in-from-top-4">
                                    {invitations.length === 0 ? (
                                        <div className="text-center py-20 text-[#8A8580] dark:text-[#A09D9A] font-bold text-[1.1rem]">Không có lời mời nào.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {invitations.map(invite => (
                                                <div key={invite.id} className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-white/50 dark:border-white/5 rounded-[32px] p-6 flex flex-col justify-between transition-all hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1">
                                                    <div className="flex items-center gap-4 overflow-hidden mb-6">
                                                        <div className="w-14 h-14 bg-[#F4EBE1] dark:bg-[#2B2A29] rounded-[20px] flex items-center justify-center shrink-0 shadow-inner">
                                                            {invite.boxAvatar ? (
                                                                <span className="text-2xl drop-shadow-sm">{invite.boxAvatar}</span>
                                                            ) : invite.inviterAvatar ? (
                                                                <img src={invite.inviterAvatar} alt="" className="w-full h-full rounded-[20px] object-cover" />
                                                            ) : (
                                                                <Package size={24} className="text-[#8A8580] dark:text-[#A09D9A]" strokeWidth={2.5} />
                                                            )}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-[0.9rem] text-[#8A8580] dark:text-[#A09D9A] truncate mb-0.5 font-semibold">
                                                                <span className="font-extrabold text-[#1A1A1A] dark:text-white">{invite.inviterName}</span> mời bạn vào
                                                            </p>
                                                            <p className="text-[1.1rem] font-black text-[#1A1A1A] dark:text-white truncate">{invite.boxName}</p>
                                                            <p className="text-[0.8rem] text-[#A09D9A] mt-0.5 font-bold tracking-wide uppercase">
                                                                {formatDistanceToNow(new Date(invite.sentAt), { addSuffix: true, locale: enUS })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <button 
                                                            onClick={() => handleAcceptInvite(invite.id)} 
                                                            className="flex-1 h-12 rounded-[16px] bg-[#1A1A1A] text-white hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95 shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
                                                        >
                                                            <Check size={20} strokeWidth={3} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectInvite(invite.id)} 
                                                            className="flex-1 h-12 rounded-[16px] bg-[#F4EBE1]/50 dark:bg-[#2B2A29] text-[#1A1A1A] dark:text-white hover:bg-[#E2D9CE] hover:text-red-500 border border-transparent hover:border-red-100 flex items-center justify-center transition-all active:scale-95"
                                                        >
                                                            <X size={20} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab !== 'invitations' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-16 animate-in fade-in slide-in-from-top-4">
                                    {boxes.length === 0 && searchQuery && (
                                        <div className="col-span-full text-center py-20 text-[#8A8580] dark:text-[#A09D9A] font-bold text-[1.1rem]">
                                            Không tìm thấy Không gian nào phù hợp với "{searchQuery}".
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="group w-full aspect-[7/4] rounded-[32px] border-2 border-dashed border-[#D6CFC7] dark:border-[#3A3734] hover:border-[#1A1A1A] dark:hover:border-white bg-white/40 dark:bg-[#1A1A1A]/40 hover:bg-white/80 dark:hover:bg-[#1A1A1A]/80 transition-all duration-300 flex flex-col items-center justify-center gap-4 relative z-10 backdrop-blur-sm active:scale-[0.98]"
                                    >
                                        <div className="w-14 h-14 bg-[#1A1A1A] dark:bg-white rounded-[20px] flex items-center justify-center text-white dark:text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:-translate-y-1 transition-transform duration-300">
                                            <Plus size={28} strokeWidth={3} />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[#1A1A1A] dark:text-white text-[1.2rem] font-black">
                                                Tạo Không gian
                                            </span>
                                            <span className="text-[#8A8580] dark:text-[#A09D9A] text-[0.9rem] font-bold mt-0.5">
                                                Mở khu vực riêng của bạn
                                            </span>
                                        </div>
                                    </button>

                                    {boxes.map((box) => (
                                        <BoxCard key={box.id} box={box} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <CreateBoxModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={fetchData} 
            />
        </MainLayout>
    );
};

export default BoxListPage;