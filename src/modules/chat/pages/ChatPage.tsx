import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { chatService } from '../services/chat.service';
import { useGlobalChatSocket } from '../hooks/useGlobalChatSocket';
import { useChatStore } from '../store/useChatStore';
import { useChatSocket } from '../hooks/useChatSocket'; 
import MainLayout from '@/components/layout/MainLayout';
import { Loader2, PanelLeft } from 'lucide-react'; // Đã thêm icon PanelLeft
import { cn } from '@/lib/utils';

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams(); 
  const { 
    conversations,
    activeConversationId, 
    setConversations,
    fetchConversations,
    openChat,
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useGlobalChatSocket();
  useChatSocket(activeConversationId); 

  useEffect(() => {
    const initData = async () => {
        setIsLoading(true);
        try {
            if (fetchConversations) {
                await fetchConversations();
            } else {
                const res: any = await chatService.getConversations();
                setConversations(res);
            }
        } catch (e) {
            console.error("Lỗi tải danh sách chat:", e);
        } finally {
            setIsLoading(false);
        }
    };
    initData();
  }, [setConversations, fetchConversations]);

  useEffect(() => {
      const initBoxChat = async () => {
          const boxIdFromUrl = searchParams.get('boxId');
          if (!isLoading && boxIdFromUrl) {
              let targetConv = conversations.find(c => c.boxId === boxIdFromUrl);
              if (!targetConv) {
                  try {
                      targetConv = await chatService.getBoxConversation(boxIdFromUrl);
                      if (targetConv) {
                          setConversations([targetConv, ...conversations]);
                      }
                  } catch (e) {
                      console.error("Không thể lấy dữ liệu Box Chat", e);
                  }
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
        <div className="flex w-full h-[100dvh] bg-zinc-50 dark:bg-[#121212] overflow-hidden text-zinc-900 dark:text-white transition-colors duration-300 relative">
          
          {/* CỘT TRÁI: DANH SÁCH CHAT */}
          <div className={cn(
              "h-full shrink-0 bg-white dark:bg-[#121212] transition-all duration-300 ease-in-out border-zinc-200 dark:border-white/5 relative z-10 overflow-hidden",
              isSidebarOpen ? "w-[380px] border-r opacity-100" : "w-0 border-r-0 opacity-0"
          )}>
              <div className="w-[380px] h-full">
                  <ConversationList /> 
              </div>
          </div>

          {/* CỘT PHẢI: KHUNG CHAT */}
          <div className="h-full flex-col flex flex-1 min-w-0 bg-[#FAFAFA] dark:bg-[#121212] transition-colors duration-300 relative">
            {isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
                  <p className="text-sm font-medium" style={{ fontFamily: '"Jua", sans-serif' }}>Đang đồng bộ tin nhắn...</p>
               </div>
            ) : (
               <>
                   {activeConversationId ? (
                       <ChatWindow 
                          isSidebarOpen={isSidebarOpen} 
                          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                       />
                   ) : (
                       // Màn hình chờ: Tích hợp nút mở Sidebar khi rảnh
                       <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 select-none p-4 text-center bg-[#FAFAFA] dark:bg-[#121212] transition-colors duration-300 relative">
                           
                           {!isSidebarOpen && (
                               <button 
                                   onClick={() => setIsSidebarOpen(true)} 
                                   className="absolute top-6 left-6 p-2 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl hover:text-black dark:hover:text-white transition-all"
                                   title="Mở danh sách"
                               >
                                   <PanelLeft className="w-7 h-7" />
                               </button>
                           )}

                           <div className="w-24 h-24 bg-white dark:bg-zinc-900/50 rounded-[32px] flex items-center justify-center mb-6 border-2 border-zinc-200 dark:border-white/5 shadow-md">
                               <span className="text-5xl drop-shadow-sm">💬</span>
                           </div>
                           <h3 className="font-bold text-2xl text-black dark:text-white mb-2" style={{ fontFamily: '"Jua", sans-serif' }}>Tin nhắn của bạn</h3>
                           <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto" style={{ fontFamily: '"Jua", sans-serif' }}>
                               Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc chia sẻ khoảnh khắc.
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