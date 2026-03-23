import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useBoxMoods } from '@/modules/mood/hooks/useBoxMoods';
import { MoodSelectionSheet } from '@/modules/mood/components/MoodSelectionSheet';

interface Props {
    boxId: string;
    onBack: () => void; 
}

export const BoxMoodPage: React.FC<Props> = ({ boxId, onBack }) => {
    const { user } = useAuth();
    const { moods, myMood, handleSetMood, handleDeleteMood } = useBoxMoods(boxId, user?.id);
    
    const [viewingUserId, setViewingUserId] = useState<string | undefined>(user?.id);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");

    useEffect(() => {
        if (viewingUserId !== user?.id && !moods.find(m => m.userId === viewingUserId)) {
            setViewingUserId(user?.id);
        }
    }, [moods, viewingUserId, user?.id]);

    const viewingMood = viewingUserId === user?.id ? myMood : moods.find(m => m.userId === viewingUserId);
    const isViewingMe = viewingUserId === user?.id;

    const viewingUser = isViewingMe 
        ? { fullname: user?.fullname || "You", avatarUrl: user?.avatarUrl } 
        : { fullname: viewingMood?.fullname, avatarUrl: viewingMood?.avatarUrl };

    const handleReply = () => {
        console.log(`Sending reply to ${viewingUserId}: ${replyMessage}`);
        setReplyMessage("");
    };

    const handleShareToBox = () => {
        console.log(`Sharing mood ${viewingMood?.id} to Box ${boxId}`);
    };

    return (
                 // 1. Xóa overflow-hidden
                <div className="min-h-screen bg-[#e6f7f4] dark:bg-zinc-950 flex justify-center font-['Jua']">
                
                {/* 2. Đổi h-[100dvh] thành min-h-[100dvh] để nó tự giãn chiều cao, và thêm pb-8 để lướt mượt */}
                <div className="w-full max-w-4xl min-h-[100dvh] flex flex-col relative pb-8 md:pb-0">
                            
                {/* --- HEADER --- */}
                <div className="flex items-center gap-3 md:gap-4 px-6 pt-8 md:pt-12 pb-4 shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={32} strokeWidth={2.5} />
                    </button>
                    
                    <div className="flex items-center gap-3 text-xl md:text-2xl text-zinc-900 dark:text-white font-bold tracking-wide">
                        {viewingUser.avatarUrl ? (
                            <img src={viewingUser.avatarUrl} alt="avatar" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-[2px] border-white dark:border-zinc-800 shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="text-base md:text-lg">👤</span>
                            </div>
                        )}
                        <span>{viewingUser.fullname}</span>
                    </div>
                </div>

                {/* --- MAIN CARD --- */}
                <div className="flex-1 px-6 md:px-10 pb-4 flex flex-col items-center justify-center">
                    {/* Thẻ Card trắng giờ sẽ xòe to mượt mà trên Desktop */}
                    <div className="w-full max-w-2xl min-h-[400px] md:min-h-[500px] bg-white dark:bg-zinc-900 rounded-[40px] md:rounded-[64px] shadow-sm md:shadow-xl flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden transition-all duration-300">
                        
                        {isViewingMe ? (
                            // ========================================================
                            // GIAO DIỆN CỦA MÌNH
                            // ========================================================
                            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 w-full relative">
                                
                                {viewingMood && (
                                    <button 
                                        onClick={() => handleDeleteMood()} 
                                        className="absolute -top-2 -right-2 md:top-2 md:right-2 p-3 text-zinc-400 hover:text-red-500 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
                                        title="Delete status"
                                    >
                                        <Trash2 size={24} strokeWidth={2.5} />
                                    </button>
                                )}

                                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">What's up?</h2>
                                <p className="text-zinc-500 mb-8 md:mb-10 font-sans font-medium md:text-lg">Share a tiny mood for today!</p>
                                
                                <div className={`text-[120px] md:text-[160px] leading-none mb-6 md:mb-10 drop-shadow-sm transition-all ${!viewingMood ? 'opacity-50' : 'animate-in zoom-in'}`}>
                                    {viewingMood ? viewingMood.icon : "🧘‍♂️"}
                                </div>

                                <div className="min-h-[48px] md:min-h-[56px] w-full flex items-center justify-center mb-6 md:mb-8">
                                    {viewingMood?.message && (
                                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-200 font-sans font-medium bg-zinc-50 dark:bg-zinc-800/50 px-6 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-700 max-w-[90%] truncate">
                                            {viewingMood.message}
                                        </p>
                                    )}
                                </div>

                                <button 
                                    onClick={() => setIsSheetOpen(true)}
                                    className="w-[200px] md:w-[240px] h-[56px] md:h-[64px] bg-[#5d9c70] hover:bg-[#4e855e] text-white rounded-[28px] text-lg md:text-xl shadow-md transition-transform active:scale-95 tracking-wide"
                                >
                                    {viewingMood ? "New status" : "Add status"}
                                </button>
                                <p className="text-[10px] md:text-xs text-zinc-400 mt-4 md:mt-6 tracking-wide uppercase font-sans font-bold">Visible for 24h</p>
                            </div>
                        ) : (
                            // ========================================================
                            // GIAO DIỆN BẠN BÈ 
                            // ========================================================
                            <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
                                <span className="text-[120px] md:text-[160px] drop-shadow-md leading-none mb-6 md:mb-10">
                                    {viewingMood?.icon}
                                </span>
                                
                                {viewingMood?.message && (
                                    <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-200 text-center px-6 bg-zinc-50 dark:bg-zinc-800/50 py-4 rounded-2xl w-full border border-zinc-100 dark:border-zinc-700 font-sans font-medium">
                                        {viewingMood.message}
                                    </p>
                                )}

                                <div className="mt-auto w-full pt-10 md:pt-12 flex flex-col gap-4">
                                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 rounded-full p-1.5 border border-zinc-200 dark:border-zinc-800">
                                        <input 
                                            type="text" 
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder={`Reply to ${viewingUser.fullname?.split(' ')[0]}...`}
                                            className="flex-1 bg-transparent border-none px-4 md:text-lg focus:ring-0 font-sans font-medium"
                                        />
                                        <button 
                                            onClick={handleReply}
                                            disabled={!replyMessage.trim()}
                                            className="w-12 h-12 rounded-full bg-[#5d9c70] text-white flex items-center justify-center disabled:opacity-50 transition"
                                        >
                                            <Send size={20} className="-ml-1" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleShareToBox}
                                        className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-amber-100 text-amber-700 md:text-lg hover:bg-amber-200 transition"
                                    >
                                        <Share2 size={20} /> Share to Box chat
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

               {/* --- FRIEND'S MOODS (BOTTOM LIST) --- */}
               <div className="h-[160px] md:h-[180px] px-6 md:px-10 pb-8 md:pb-12 shrink-0 flex flex-col justify-end">
                    <h3 className="text-zinc-800 dark:text-zinc-200 text-sm md:text-base mb-1 tracking-wide font-sans font-bold uppercase">Friend's moods</h3>
                    
                    {/* [ĐÃ FIX 1]: Thêm py-3 px-1 để có khoảng trống cho hiệu ứng phóng to (scale-110) không bị cắt */}
                    <div className="flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar py-3 px-1 items-center">
                        
                        {/* CỦA MÌNH (YOU) */}
                        <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setViewingUserId(user?.id)}>
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative border-[3px] transition-all ${viewingUserId === user?.id ? 'border-[#5d9c70] scale-110 shadow-md z-10' : 'border-white dark:border-zinc-700'} bg-white`}>
                                
                                {/* [ĐÃ FIX 2]: Hiện Mood -> Không Mood thì hiện Avatar -> Không Avatar thì hiện chữ cái */}
                                {myMood ? (
                                    <span className="text-3xl md:text-4xl">{myMood.icon}</span>
                                ) : user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="You" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xl font-sans">
                                        {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}

                            </div>
                            <span className={`text-[12px] md:text-[14px] mt-1 ${viewingUserId === user?.id ? 'text-[#5d9c70] font-bold' : 'text-zinc-500'}`}>You</span>
                        </div>

                        {/* BẠN BÈ */}
                        {moods.filter(m => m.userId !== user?.id).map(mood => (
                            <div key={mood.id} className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setViewingUserId(mood.userId)}>
                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative border-[3px] transition-all ${viewingUserId === mood.userId ? 'border-[#5d9c70] scale-110 shadow-md z-10' : 'border-white dark:border-zinc-700'} bg-white`}>
                                    
                                    <span className="text-3xl md:text-4xl">{mood.icon}</span>
                                    
                                    {/* Ảnh avatar nhỏ đính kèm góc dưới */}
                                    <img 
                                        src={mood.avatarUrl || `https://ui-avatars.com/api/?name=${mood.fullname}`} 
                                        alt="avt" 
                                        className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full border-[3px] border-[#e6f7f4] dark:border-zinc-950 object-cover" 
                                    />
                                </div>
                                <span className={`text-[12px] md:text-[14px] mt-1 truncate max-w-[64px] md:max-w-[80px] ${viewingUserId === mood.userId ? 'text-[#5d9c70] font-bold' : 'text-zinc-500'}`}>
                                    {mood.fullname?.split(' ')[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            

                <MoodSelectionSheet 
                    isOpen={isSheetOpen}
                    onClose={() => setIsSheetOpen(false)}
                    onSubmit={handleSetMood}
                    currentMood={myMood}
                />
                
            </div>
        </div>
    );
};