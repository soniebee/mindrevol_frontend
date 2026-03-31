//src/store/useChatStore
import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { chatService } from '../services/chat.service';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null; 
  messages: Record<string, Message[]>; 
  isSidebarOpen: boolean;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  typingStatus: Record<string, boolean>;


  prependMessages: (convId: string, msgs: Message[]) => void;
  markConversationAsSeen: (convId: string) => void;
  fetchConversations: () => Promise<void>;
  setConversations: (list: Conversation[]) => void;
  openChat: (conversationId: string | null) => Promise<void>; 
  closeChat: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  setMessages: (convId: string, msgs: Message[]) => void;
  addMessage: (msg: Message) => void; 
  markAsRead: (convId: string) => void;
  
  
  updateMessageStatus: (clientSideId: string, status: 'SENDING' | 'SENT' | 'ERROR', realId?: string) => void;
  setTyping: (convId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isSidebarOpen: true,
  replyingTo: null,
  typingStatus: {},
  setReplyingTo: (msg) => set({ replyingTo: msg }),

  setTyping: (convId, isTyping) => set((state) => ({ // [TYPING]
    typingStatus: { ...state.typingStatus, [convId]: isTyping }
  })),
  fetchConversations: async () => {
      try {
          const res = await chatService.getConversations();
          set({ conversations: res });
      } catch (err) {
          console.error(err);
      }
  },

  setConversations: (list) => set({ conversations: list }),

  // [ĐÃ SỬA] Đảm bảo cập nhật chính xác activeConversationId và reset unread
  openChat: async (id) => {
    // Nếu click nút Back/Close (id = null)
    if (!id) {
        set({ activeConversationId: null });
        return;
    }

    set((state) => ({
      activeConversationId: id,
      conversations: state.conversations.map((c) => 
        String(c.id) === String(id) ? { ...c, unreadCount: 0 } : c
      ),
    }));

    try {
      await chatService.markAsRead(id);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  },

  closeChat: () => set({ activeConversationId: null }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  setMessages: (convId, msgs) => set((state) => ({
    messages: { ...state.messages, [convId]: msgs }
  })),

  addMessage: (msg) => {
    const state = get();
    const currentMsgs = state.messages[msg.conversationId] || [];
    if (currentMsgs.some(m => (m.id === msg.id && msg.id) || (m.clientSideId === msg.clientSideId && msg.clientSideId))) {
      return;
    }
    const convIndex = state.conversations.findIndex(c => String(c.id) === String(msg.conversationId));
    if (convIndex === -1) {
      state.fetchConversations();
    }
    set((state) => {
      const newMsgs = [...(state.messages[msg.conversationId] || []), msg];
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
        conversations: newConversations,
        // [TYPING] Khi có tin nhắn mới đến, tự động tắt hiệu ứng đang gõ
        typingStatus: { ...state.typingStatus, [msg.conversationId]: false } 
      };
    });
  },

  prependMessages: (convId, newMsgs) => set((state) => {
    const existingMsgs = state.messages[convId] || [];
    // Lọc bỏ các tin nhắn bị trùng lặp
    const existingIds = new Set(existingMsgs.map(m => m.id));
    const uniqueNewMsgs = newMsgs.filter(m => !existingIds.has(m.id));
    
    // Nhét tin nhắn cũ lên TRƯỚC danh sách hiện tại
    return { messages: { ...state.messages, [convId]: [...uniqueNewMsgs, ...existingMsgs] } };
  }),

  markConversationAsSeen: (convId) => set((state) => {
    const msgs = state.messages[convId] || [];
    const updatedMsgs = msgs.map(m => {
        // Nếu là tin nhắn đã gửi thì đổi thành đã xem
        if (m.status === 'SENT' || !m.status) return { ...m, status: 'SEEN' as const };
        return m;
    });
    return { messages: { ...state.messages, [convId]: updatedMsgs } };
  }),

  markAsRead: (convId) => set((state) => {
    const newConvs = state.conversations.map(c => 
      String(c.id) === String(convId) ? { ...c, unreadCount: 0 } : c
    );
    return { conversations: newConvs };
  }),

  updateMessageStatus: (clientSideId, status, realId) => set((state) => {
    const newMessages = { ...state.messages };
    
    Object.keys(newMessages).forEach(convId => {
        newMessages[convId] = newMessages[convId].map(m => {
            if (m.clientSideId === clientSideId || m.id === clientSideId) {
                return { 
                    ...m, 
                    id: realId || m.id, 
                    status: status 
                }; 
            }
            return m;
        });
    });
    
    return { messages: newMessages };
  }),
}));