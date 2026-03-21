import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; 

// Import giao diện PC
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';

// Import giao diện Mobile
import { MobileConversationList } from '../components/MobileConversationList';
import { MobileChatWindow } from '../components/MobileChatWindow';

import { chatService } from '../services/chat.service';
import { useChatStore } from '../store/useChatStore';
import { useChatSocket } from '../hooks/useChatSocket'; 
import MainLayout from '@/components/layout/MainLayout';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams(); 
  const { 
    conversations,
    activeConversationId, 
    setConversations,
    fetchConversations,
    openChat 
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="flex w-full h-[100dvh] bg-zinc-50 dark:bg-[#121212] overflow-hidden text-zinc-900 dark:text-white transition-colors duration-300">
          
          {/* =========================================================
              1. GIAO DIỆN DANH SÁCH BÊN TRÁI 
              ========================================================= */}
          <div className={cn(
            "h-full shrink-0 md:w-[380px] bg-white dark:bg-[#121212] transition-colors duration-300 border-r border-zinc-200 dark:border-white/5",
            // Mobile: Ẩn cột trái nếu đang mở khung chat. PC: Luôn hiện
            activeConversationId ? "hidden md:block" : "w-full block"
          )}>
              {/* Hiển thị List Mobile nếu ở màn nhỏ, List PC nếu màn lớn */}
              <div className="block md:hidden h-full"><MobileConversationList /></div>
              <div className="hidden md:block h-full"><ConversationList /></div>
          </div>

          {/* =========================================================
              2. GIAO DIỆN CỬA SỔ CHAT BÊN PHẢI 
              ========================================================= */}
          <div className={cn(
            "h-full flex-col flex-1 min-w-0 bg-[#FAFAFA] dark:bg-[#121212] transition-colors duration-300",
            // Mobile: Hiện nếu có chat, ẩn nếu không. PC: Luôn hiện
            !activeConversationId ? "hidden md:flex" : "flex w-full"
          )}>
            {isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
                  <p className="text-sm font-medium" style={{ fontFamily: '"Jua", sans-serif' }}>Đang đồng bộ tin nhắn...</p>
               </div>
            ) : (
               <>
                   {activeConversationId ? (
                       <>
                           {/* Mở khung chat Mobile (Scrapbook) ở màn nhỏ, khung Chat PC ở màn lớn */}
                           <div className="block md:hidden h-full w-full"><MobileChatWindow /></div>
                           <div className="hidden md:block h-full w-full"><ChatWindow /></div>
                       </>
                   ) : (
                       // Màn hình chờ (Empty state) hỗ trợ Sáng/Tối
                       <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 select-none p-4 text-center bg-[#FAFAFA] dark:bg-[#121212] transition-colors duration-300">
                           <div className="w-24 h-24 bg-white dark:bg-zinc-900/50 rounded-[32px] flex items-center justify-center mb-6 border-2 border-zinc-200 dark:border-white/5 shadow-md">
                               <span className="text-5xl drop-shadow-sm">💬</span>
                           </div>
                           <h3 className="font-bold text-2xl text-black dark:text-white mb-2" style={{ fontFamily: '"Jua", sans-serif' }}>
                               Tin nhắn của bạn
                           </h3>
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