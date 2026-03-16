import React, { useEffect, useState } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { chatService } from '../services/chat.service';
import { useChatStore } from '../store/useChatStore';
import { useChatSocket } from '../hooks/useChatSocket'; 
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// XÓA HẲN Import MainLayout, không dùng nó nữa!

const ChatPage = () => {
  const { 
    activeConversationId, 
    setConversations,
    fetchConversations 
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

  return (
    // Bỏ thẻ <MainLayout>, giờ trang Chat sẽ chạy độc lập, độc chiếm 100% màn hình
    <div className="flex w-full h-[100dvh] bg-white overflow-hidden text-black font-['Jua']">
      
      {/* CỘT TRÁI: DANH SÁCH BẠN BÈ */}
      <div className={cn(
        "h-full shrink-0 border-r border-zinc-200",
        activeConversationId ? "hidden md:block md:w-[350px]" : "w-full md:w-[350px]"
      )}>
          <ConversationList />
      </div>

      {/* CỘT PHẢI: CỬA SỔ CHAT 1-1 */}
      <div className={cn(
        "h-full flex-col flex-1 min-w-0 bg-white",
        !activeConversationId ? "hidden md:flex" : "flex w-full"
      )}>
        {isLoading ? (
           <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mb-2" />
              <p className="text-base">Đang đồng bộ tin nhắn...</p>
           </div>
        ) : (
           <>
               {activeConversationId ? (
                   <ChatWindow />
               ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 select-none p-4 text-center">
                       <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6 border border-neutral-200 shadow-sm">
                           <span className="text-5xl drop-shadow-sm">💬</span>
                       </div>
                       <h3 className="text-2xl text-black mb-2">Tin nhắn của bạn</h3>
                       <p className="text-base text-neutral-400 max-w-xs mx-auto">
                           Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc chia sẻ khoảnh khắc.
                       </p>
                   </div>
               )}
           </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;