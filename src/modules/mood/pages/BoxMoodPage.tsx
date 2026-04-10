import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Hand, Trash2 } from 'lucide-react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { useBoxMoods } from '@/modules/mood/hooks/useBoxMoods';
import { SetMoodModal } from '@/modules/mood/components/SetMoodModal';

interface Props {
    boxId: string;
    onBack: () => void; 
}

export const BoxMoodPage: React.FC<Props> = ({ boxId, onBack }) => {
    const { user } = useAuth();
    const { moods, boxMembers, myMood, handleSetMood, handleDeleteMood, handleAskMood, handleReact, handleReplyToMood } = useBoxMoods(boxId, user?.id);
    
    const [viewingUserId, setViewingUserId] = useState<string | undefined>(user?.id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");

    useEffect(() => {
        if (!viewingUserId) setViewingUserId(user?.id);
    }, [user?.id]);

    const viewingMood = viewingUserId === user?.id ? myMood : moods.find(m => m.userId === viewingUserId);
    const isViewingMe = viewingUserId === user?.id;

    const viewingUser = isViewingMe 
        ? { fullname: user?.fullname || "Bạn", avatarUrl: user?.avatarUrl } 
        : boxMembers.find(m => m.userId === viewingUserId) || { fullname: "Bạn bè", avatarUrl: "" };

    const handleReply = async () => {
        if (!viewingUserId || !viewingMood) return;
        await handleReplyToMood(viewingUserId, replyMessage, viewingMood.icon);
        setReplyMessage("");
    };

    const sortedMembers = [...boxMembers.filter(m => m.userId !== user?.id)].sort((a, b) => {
        const moodA = moods.find(m => m.userId === a.userId);
        const moodB = moods.find(m => m.userId === b.userId);
        if (moodA && !moodB) return -1;
        if (!moodA && moodB) return 1;
        if (moodA && moodB) {
            return new Date(moodB.createdAt || 0).getTime() - new Date(moodA.createdAt || 0).getTime();
        }
        return 0;
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] dark:from-[#121212] dark:to-[#0A0A0A] font-quicksand p-0 md:p-6 overflow-hidden">
            
            <div className="w-full md:w-[700px] h-[100dvh] md:h-[85vh] md:max-h-[850px] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl md:rounded-[40px] md:shadow-[0_24px_60px_rgba(0,0,0,0.08)] flex flex-col relative overflow-hidden md:border md:border-white/60 md:dark:border-white/5">
                
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 pt-12 md:pt-8 pb-4 shrink-0 z-20">
                    <button onClick={onBack} className="p-2 -ml-2 text-[#8A8580] hover:text-[#1A1A1A] dark:text-[#A09D9A] dark:hover:text-white hover:bg-[#F4EBE1] dark:hover:bg-[#2B2A29] rounded-[16px] transition-colors active:scale-95">
                        <ArrowLeft size={28} strokeWidth={2.5} />
                    </button>
                    
                    <div className="px-5 py-2 bg-[#F4EBE1]/50 dark:bg-[#2B2A29]/50 rounded-[20px] backdrop-blur-md">
                        <span className="font-black text-[#1A1A1A] dark:text-white tracking-widest uppercase text-[0.8rem]">Không gian Cảm xúc</span>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 px-6 pb-4 flex flex-col items-center justify-center relative">
                    
                    <div className="w-full max-w-[500px] bg-white dark:bg-[#2B2A29] rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 dark:border-[#3A3734] p-8 md:p-10 relative z-20 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
                        
                        <div className="flex items-center gap-3 mb-8 bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] py-1.5 px-4 rounded-full">
                            {viewingUser.avatarUrl ? (
                                <img src={viewingUser.avatarUrl} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-[#E2D9CE] dark:bg-[#3A3734] flex items-center justify-center text-[0.7rem] font-black text-[#1A1A1A] dark:text-white">
                                    {viewingUser.fullname?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-[0.95rem] font-bold text-[#8A8580] dark:text-[#A09D9A]">{viewingUser.fullname}</span>
                        </div>

                        {isViewingMe ? (
                            // ================= GIAO DIỆN CỦA MÌNH =================
                            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300 w-full relative">
                                
                                {viewingMood && (
                                    <button onClick={() => handleDeleteMood()} className="absolute -top-4 right-0 p-2.5 text-[#A09D9A] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[14px] transition-all" title="Gỡ trạng thái">
                                        <Trash2 size={20} strokeWidth={2.5} />
                                    </button>
                                )}
                                
                                {viewingMood ? (
                                    <div className="text-[6rem] md:text-[8rem] leading-none mb-6 animate-in zoom-in hover:scale-110 cursor-pointer transition-transform drop-shadow-xl" onClick={() => setIsModalOpen(true)}>
                                        {viewingMood.icon}
                                    </div>
                                ) : (
                                    <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] mb-6 animate-in zoom-in hover:scale-110 cursor-pointer transition-transform drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]" onClick={() => setIsModalOpen(true)}>
                                        <img src="/moscow/moscow (1).png" alt="Mascot" className="w-full h-full object-contain pointer-events-none" />
                                    </div>
                                )}

                                {viewingMood?.message ? (
                                    <p className="text-[1.1rem] text-[#1A1A1A] dark:text-white font-extrabold mb-6 leading-relaxed">{viewingMood.message}</p>
                                ) : (
                                    <p className="text-[1.05rem] text-[#8A8580] font-bold mb-6">Bạn đang cảm thấy thế nào?</p>
                                )}

                                <button onClick={() => setIsModalOpen(true)} className="w-full h-[56px] bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black rounded-[20px] text-[1.05rem] font-extrabold shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all mb-4">
                                    {viewingMood ? "Đổi cảm xúc" : "Thêm cảm xúc"}
                                </button>

                                {/* 🔥 HIỂN THỊ DANH SÁCH AI ĐÃ THẢ TIM CHO MÌNH */}
                                {viewingMood?.reactions && viewingMood.reactions.length > 0 && (
                                    <div className="w-full mt-2 pt-6 border-t border-[#D6CFC7]/50 dark:border-[#3A3734] animate-in fade-in slide-in-from-bottom-4">
                                        <p className="text-[0.75rem] text-[#8A8580] font-bold uppercase tracking-widest mb-3">Những người đã tương tác</p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {viewingMood.reactions.map(r => (
                                                <div key={r.userId} className="flex items-center gap-1.5 bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] px-3 py-1.5 rounded-[12px] border border-transparent dark:border-white/5">
                                                    {r.avatarUrl ? (
                                                        <img src={r.avatarUrl} className="w-5 h-5 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-[#E2D9CE] dark:bg-[#3A3734] flex items-center justify-center text-[9px] font-black text-[#1A1A1A] dark:text-white">
                                                            {r.fullname.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-[0.8rem] font-bold text-[#1A1A1A] dark:text-white">{r.fullname.split(' ')[0]}</span>
                                                    <span className="text-[1.1rem] leading-none ml-1">{r.emoji}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : viewingMood ? (
                            // ================= GIAO DIỆN BẠN BÈ =================
                            <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-[6rem] md:text-[8rem] leading-none mb-6 hover:scale-110 transition-transform cursor-pointer drop-shadow-xl">
                                    {viewingMood.icon}
                                </div>
                                
                                {viewingMood.message && (
                                    <p className="text-[1.1rem] text-[#1A1A1A] dark:text-white font-extrabold mb-8 leading-relaxed">{viewingMood.message}</p>
                                )}

                                {/* 🔥 THANH THẢ CẢM XÚC (REACTION BAR) */}
                                <div className="flex items-center justify-center gap-3 mb-6 bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] p-2 rounded-[24px]">
                                    {['👍', '❤️', '😂', '🥺'].map(emoji => {
                                        const hasReacted = viewingMood.reactions?.some(r => r.userId === user?.id && r.emoji === emoji);
                                        return (
                                            <button 
                                                key={emoji} 
                                                onClick={() => handleReact(viewingMood.id, emoji)}
                                                className={`w-12 h-12 rounded-[16px] text-[1.4rem] flex items-center justify-center transition-all active:scale-90 ${hasReacted ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.1)] -translate-y-1' : 'bg-white dark:bg-[#3A3734] hover:bg-white/80 shadow-sm border border-transparent dark:border-white/5'}`}
                                            >
                                                {emoji}
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="w-full flex items-center bg-[#F4EBE1]/50 dark:bg-[#1A1A1A] rounded-[20px] p-1.5 border border-[#D6CFC7]/50 dark:border-[#3A3734]">
                                    <input 
                                        type="text" 
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder={`Gửi lời nhắn...`}
                                        className="flex-1 bg-transparent border-none px-4 text-[0.95rem] font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#A09D9A] focus:ring-0"
                                    />
                                    <button disabled={!replyMessage.trim()} onClick={handleReply} className="w-10 h-10 rounded-[14px] bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all hover:shadow-md">
                                        <Send size={18} className="-ml-0.5" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // ================= HỎI THĂM BẠN BÈ =================
                            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                                <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] mb-6 drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-500">
                                    <img src="/moscow/moscow (7).png" alt="Mascot" className="w-full h-full object-contain pointer-events-none" />
                                </div>
                                <h3 className="text-[1.2rem] font-black text-[#1A1A1A] dark:text-white mb-2">Đang im ắng quá!</h3>
                                <p className="text-[0.95rem] text-[#8A8580] font-semibold mb-8 px-4">
                                    {viewingUser.fullname?.split(' ')[0]} chưa cập nhật cảm xúc. Hãy chọc xem sao!
                                </p>
                                <button 
                                    onClick={() => viewingUserId && handleAskMood(viewingUserId)}
                                    className="flex items-center gap-2 px-8 h-[56px] bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black rounded-[20px] text-[1.05rem] font-extrabold shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all group"
                                >
                                    <Hand size={20} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} /> Hỏi thăm
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM LIST */}
                <div className="h-[160px] md:h-[180px] px-6 pb-6 shrink-0 flex flex-col justify-end z-20">
                    <div className="flex gap-4 overflow-x-auto overflow-y-visible custom-scrollbar pt-6 pb-2 px-2 items-center">
                        {/* CỦA MÌNH */}
                        <div className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group" onClick={() => setViewingUserId(user?.id)}>
                            <div className={`w-[60px] h-[60px] rounded-[18px] flex items-center justify-center relative transition-all duration-300 ${viewingUserId === user?.id ? 'bg-[#1A1A1A] dark:bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-3' : 'bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE]'}`}>
                                {myMood ? (
                                    <span className="text-[1.8rem] leading-none">{myMood.icon}</span>
                                ) : user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="You" className="w-[calc(100%-6px)] h-[calc(100%-6px)] object-cover rounded-[14px]" />
                                ) : (
                                    <span className="text-[#8A8580] font-black text-[1.2rem]">{user?.fullname?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className={`text-[0.75rem] font-bold ${viewingUserId === user?.id ? 'text-[#1A1A1A] dark:text-white' : 'text-[#8A8580]'}`}>Bạn</span>
                        </div>

                        {sortedMembers.map(member => {
                            const friendMood = moods.find(m => m.userId === member.userId);
                            const isSelected = viewingUserId === member.userId;
                            
                            return (
                                <div key={member.userId} className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group" onClick={() => setViewingUserId(member.userId)}>
                                    <div className={`w-[60px] h-[60px] rounded-[18px] flex items-center justify-center relative transition-all duration-300 ${isSelected ? 'bg-[#1A1A1A] dark:bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-3' : 'bg-[#F4EBE1] dark:bg-[#2B2A29] hover:bg-[#E2D9CE]'}`}>
                                        {friendMood ? (
                                            <>
                                                <span className="text-[1.8rem] leading-none">{friendMood.icon}</span>
                                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-[#121212] shadow-sm z-10 animate-pulse"></div>
                                            </>
                                        ) : member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt="avt" className="w-[calc(100%-6px)] h-[calc(100%-6px)] object-cover rounded-[14px] grayscale opacity-40" />
                                        ) : (
                                            <span className="text-[#A09D9A] opacity-40 font-black text-[1.2rem]">{member.fullname?.charAt(0).toUpperCase()}</span>
                                        )}
                                        
                                        {friendMood && (
                                            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-[8px] border-[2px] border-white dark:border-[#121212] bg-[#E2D9CE] dark:bg-[#3A3734] flex items-center justify-center overflow-hidden shadow-sm">
                                                {member.avatarUrl ? (
                                                    <img src={member.avatarUrl} alt="avt" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] font-black text-[#1A1A1A] dark:text-white">{member.fullname?.charAt(0)}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[0.75rem] font-bold truncate max-w-[64px] ${isSelected ? 'text-[#1A1A1A] dark:text-white' : 'text-[#8A8580]'}`}>
                                        {member.fullname.split(' ')[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
            
            <SetMoodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSetMood} currentIcon={myMood?.icon} currentMessage={myMood?.message} />
        </div>
    );
};