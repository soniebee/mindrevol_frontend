import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { chatService } from '../services/chat.service';
import { useGlobalChatSocket } from '../hooks/useGlobalChatSocket';
import { useChatStore } from '../store/useChatStore';
import { useChatSocket } from '../hooks/useChatSocket'; 
import MainLayout from '@/components/layout/MainLayout';
import { Loader2, PanelLeft } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams(); 
  // [CẬP NHẬT] Thêm closeChat từ Store
  const { conversations, activeConversationId, setConversations, fetchConversations, openChat, closeChat } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);

  useGlobalChatSocket();
  useChatSocket(activeConversationId); 

  // [CẬP NHẬT MỚI] Tự động reset trạng thái khi rời khỏi trang Chat (Unmount)
  useEffect(() => {
    return () => {
      closeChat(); 
    };
  }, [closeChat]);

  useEffect(() => {
    const initData = async () => {
        setIsLoading(true);
        try {
            if (fetchConversations) await fetchConversations();
            else setConversations(await chatService.getConversations() as any);
        } catch (e) { console.error("Lỗi tải danh sách chat:", e); } 
        finally { setIsLoading(false); }
    };
    initData();
  }, [setConversations, fetchConversations]);

  useEffect(() => { if (activeConversationId) setShowMobileList(false); }, [activeConversationId]);
  const handleBackToList = () => setShowMobileList(true);

  useEffect(() => {
      const initBoxChat = async () => {
          const boxIdFromUrl = searchParams.get('boxId');
          if (!isLoading && boxIdFromUrl) {
              let targetConv = conversations.find(c => c.boxId === boxIdFromUrl);
              if (!targetConv) {
                  try {
                      targetConv = await chatService.getBoxConversation(boxIdFromUrl);
                      if (targetConv) setConversations([targetConv, ...conversations]);
                  } catch (e) { console.error("Không thể lấy dữ liệu Box Chat", e); }
              }
              if (targetConv && targetConv.id !== activeConversationId) {
                  openChat(targetConv.id);
                  searchParams.delete('boxId');
                  setSearchParams(searchParams, { replace: true });
              }
          }
      };
      initBoxChat();
  }, [isLoading, searchParams, activeConversationId, openChat, conversations, setConversations]);

  return (
    <MainLayout>
        <div className="flex w-full h-[100dvh] bg-[#F0EFF5] dark:bg-[#121212] overflow-hidden text-zinc-900 dark:text-white transition-colors duration-300 relative">
          
          <div className={cn(
              "h-full shrink-0 bg-[#F7F6FA]/60 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-300 ease-in-out border-[#E1DDE8] dark:border-zinc-800 relative z-10 overflow-hidden",
              !showMobileList ? "hidden md:flex" : "flex w-full",
              isSidebarOpen ? "md:w-[400px] border-r opacity-100" : "md:w-0 border-r-0 opacity-0"
          )}>
              <div className="w-full h-full"><ConversationList /></div>
          </div>

          <div className={cn("h-full flex-col flex-1 min-w-0 bg-[#F0EFF5] dark:bg-[#121212] transition-colors duration-300 relative", showMobileList ? "hidden md:flex" : "flex")}>
            {isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-[#9288AD] dark:text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm font-bold" style={{ fontFamily: '"Nunito", sans-serif' }}>Đang đồng bộ cảm xúc...</p>
               </div>
            ) : (
               <>
                   {activeConversationId ? (
                       <ChatWindow isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onBackMobile={handleBackToList} />
                   ) : (
                       <div className="flex-1 flex flex-col items-center justify-center text-[#756A91] dark:text-zinc-500 select-none p-4 text-center bg-[#F0EFF5] dark:bg-[#121212] transition-colors duration-300 relative">
                           {!isSidebarOpen && (
                               <button onClick={() => setIsSidebarOpen(true)} className="absolute top-6 left-6 p-3 bg-white dark:bg-zinc-800 shadow-sm text-zinc-500 hover:text-[#9288AD] rounded-full transition-all active:scale-95">
                                   <PanelLeft className="w-5 h-5" />
                               </button>
                           )}
                           <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(146,136,173,0.12)]">
                               <span className="text-5xl drop-shadow-sm">☁️</span>
                           </div>
                           <h3 className="font-jua text-3xl text-zinc-800 dark:text-white mb-2">Góc đồng hành</h3>
                           <p className="text-[15px] font-semibold text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto" style={{ fontFamily: '"Nunito", sans-serif' }}>
                               Chọn một người bạn để bắt đầu chia sẻ những cảm xúc hôm nay nhé.
                           </p>
                       </div>
                   )}
               </>
            )}
          </div>
        </div>
    </MainLayout>
  );
};

export default ChatPage;