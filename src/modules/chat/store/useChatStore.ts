import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { chatService } from '../services/chat.service';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null; // Nên dùng string | null
  messages: Record<string, Message[]>; 
  isSidebarOpen: boolean;

  // Actions
  fetchConversations: () => Promise<void>; // Thêm action này
  setConversations: (list: Conversation[]) => void;
  openChat: (conversationId: string | null) => Promise<void>; 
  closeChat: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  setMessages: (convId: string, msgs: Message[]) => void;
  addMessage: (msg: Message) => void; 
  markAsRead: (convId: string) => void;
  
  // [FIX] status phải khớp với Message['status']
  updateMessageStatus: (clientSideId: string, status: 'SENDING' | 'SENT' | 'ERROR', realId?: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isSidebarOpen: true,

  // Action mới giúp ChatPage gọn hơn
  fetchConversations: async () => {
      try {
          const res = await chatService.getConversations();
          set({ conversations: res });
      } catch (err) {
          console.error(err);
      }
  },

  setConversations: (list) => set({ conversations: list }),

  openChat: async (id) => {
    set((state) => ({
      activeConversationId: id,
      conversations: state.conversations.map((c) => 
        String(c.id) === String(id) ? { ...c, unreadCount: 0 } : c
      ),
    }));

    try {
      if(id) await chatService.markAsRead(id);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  },

  closeChat: () => set({ activeConversationId: null }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  setMessages: (convId, msgs) => set((state) => ({
    messages: { ...state.messages, [convId]: msgs }
  })),

  addMessage: (msg) => set((state) => {
    const currentMsgs = state.messages[msg.conversationId] || [];
    
    // Check trùng tin nhắn
    if (currentMsgs.some(m => (m.id === msg.id && msg.id) || (m.clientSideId === msg.clientSideId && msg.clientSideId))) {
      return state;
    }
    const newMsgs = [...currentMsgs, msg];

    // Đẩy hội thoại lên đầu
    const convIndex = state.conversations.findIndex(c => String(c.id) === String(msg.conversationId));
    let newConversations = [...state.conversations];

    if (convIndex > -1) {
      const updatedConv = { ...newConversations[convIndex] };
      updatedConv.lastMessageContent = msg.type === 'IMAGE' ? '[Hình ảnh]' : msg.content;
      updatedConv.lastMessageAt = new Date().toISOString(); 
      updatedConv.lastSenderId = msg.senderId;
      
      if (String(state.activeConversationId) !== String(msg.conversationId)) {
         updatedConv.unreadCount = (updatedConv.unreadCount || 0) + 1;
      }

      newConversations.splice(convIndex, 1);
      newConversations.unshift(updatedConv);
    } 

    return { 
      messages: { ...state.messages, [msg.conversationId]: newMsgs },
      conversations: newConversations
    };
  }),

  markAsRead: (convId) => set((state) => {
    const newConvs = state.conversations.map(c => 
      String(c.id) === String(convId) ? { ...c, unreadCount: 0 } : c
    );
    return { conversations: newConvs };
  }),

  updateMessageStatus: (clientSideId, status, realId) => set((state) => {
    const newMessages = { ...state.messages };
    
    // Duyệt qua tất cả hội thoại (vì có thể không biết convId lúc này)
    Object.keys(newMessages).forEach(convId => {
        newMessages[convId] = newMessages[convId].map(m => {
            // So sánh clientSideId hoặc id tạm thời
            if (m.clientSideId === clientSideId || m.id === clientSideId) {
                return { 
                    ...m, 
                    id: realId || m.id, 
                    status: status // Typescript OK vì param status đã định nghĩa đúng type
                }; 
            }
            return m;
        });
    });
    
    return { messages: newMessages };
  }),
}));