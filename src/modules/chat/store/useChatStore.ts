// File: src/modules/chat/store/useChatStore.ts
import { create } from 'zustand';
import { Conversation, Message, CursorPage } from '../types';
import { chatService } from '../services/chat.service';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null; 
  messages: Record<string, Message[]>; 
  pinnedMessages: Record<string, Message[]>; 
  
  cursors: Record<string, string | null>;
  hasMoreMessages: Record<string, boolean>;

  isSidebarOpen: boolean;
  replyingTo: Message | null;
  editingMessage: Message | null; 
  forwardingMessage: Message | null; 
  typingStatus: Record<string, boolean>;
  isViewingHistory: Record<string, boolean>; // [THÊM MỚI] Cờ báo hiệu đang xem lịch sử

  setReplyingTo: (msg: Message | null) => void;
  setEditingMessage: (msg: Message | null) => void;
  setForwardingMessage: (msg: Message | null) => void; 
  setTyping: (convId: string, isTyping: boolean) => void;
  
  fetchConversations: () => Promise<void>;
  setConversations: (list: Conversation[]) => void;
  openChat: (conversationId: string | null) => Promise<void>; 
  closeChat: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  setCursorData: (convId: string, cursorPage: CursorPage<Message>) => void;
  addMessage: (msg: Message) => void; 
  updateMessage: (msg: Message) => void; 
  markConversationAsSeen: (convId: string) => void;
  markAsRead: (convId: string) => void;
  updateMessageStatus: (clientSideId: string, status: 'SENDING' | 'SENT' | 'ERROR', realId?: string) => void;

  togglePin: (convId: string) => Promise<void>;
  toggleMute: (convId: string) => Promise<void>;
  hideConversation: (convId: string) => Promise<void>;
  fetchPinnedMessages: (convId: string) => Promise<void>;

  // [THÊM MỚI] Hàm xử lý nhảy đến tin nhắn cũ và quay lại
  jumpToMessage: (convId: string, msgId: string) => Promise<void>;
  backToPresent: (convId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  pinnedMessages: {},
  cursors: {},
  hasMoreMessages: {},
  isSidebarOpen: true,
  replyingTo: null,
  editingMessage: null,
  forwardingMessage: null,
  typingStatus: {},
  isViewingHistory: {},

  setReplyingTo: (msg) => set({ replyingTo: msg }),
  setEditingMessage: (msg) => set({ editingMessage: msg }),
  setForwardingMessage: (msg) => set({ forwardingMessage: msg }),

  setTyping: (convId, isTyping) => set((state) => ({ 
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

  openChat: async (id) => {
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
      get().fetchPinnedMessages(id);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  },

  closeChat: () => set({ activeConversationId: null }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  setCursorData: (convId, cursorPage) => set((state) => {
    const existing = state.messages[convId] || [];
    const combinedMsgs = [...cursorPage.data.reverse(), ...existing];
    
    const uniqueMap = new Map();
    combinedMsgs.forEach(m => {
        const key = m.id || m.clientSideId;
        if (key && !uniqueMap.has(key)) uniqueMap.set(key, m);
    });

    return { 
      messages: { ...state.messages, [convId]: Array.from(uniqueMap.values()) },
      cursors: { ...state.cursors, [convId]: cursorPage.nextCursor },
      hasMoreMessages: { ...state.hasMoreMessages, [convId]: cursorPage.hasNext }
    };
  }),

  updateMessage: (updatedMsg) => set((state) => {
    const msgs = state.messages[updatedMsg.conversationId] || [];
    const newMsgs = msgs.map(m => (m.id === updatedMsg.id || m.clientSideId === updatedMsg.clientSideId) ? updatedMsg : m);
    
    let newPinned = state.pinnedMessages[updatedMsg.conversationId] || [];
    
    const backendPinnedValue = (updatedMsg as any).pinned;
    const isPinnedStatus = updatedMsg.isPinned !== undefined ? updatedMsg.isPinned : backendPinnedValue;

    if (isPinnedStatus !== undefined) {
        if (!isPinnedStatus) {
            newPinned = newPinned.filter(m => m.id !== updatedMsg.id);
        } else if (!newPinned.some(m => m.id === updatedMsg.id)) {
            newPinned = [{ ...updatedMsg, isPinned: true }, ...newPinned];
        }
    } else {
        newPinned = newPinned.map(m => m.id === updatedMsg.id ? updatedMsg : m);
    }

    return { 
        messages: { ...state.messages, [updatedMsg.conversationId]: newMsgs },
        pinnedMessages: { ...state.pinnedMessages, [updatedMsg.conversationId]: newPinned }
    };
  }),

  addMessage: (msg) => {
    const state = get();
    const currentMsgs = state.messages[msg.conversationId] || [];
    
    const isExist = currentMsgs.some(m => (m.id === msg.id && msg.id) || (m.clientSideId === msg.clientSideId && msg.clientSideId));
    if (isExist) {
        state.updateMessage(msg);
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
        
        updatedConv.lastMessageContent = msg.isDeleted ? 'Tin nhắn đã bị thu hồi' 
                                       : (msg.type === 'IMAGE' ? '[Hình ảnh]' 
                                       : msg.type === 'VOICE' ? '[Ghi âm]' 
                                       : msg.content);
                                       
        updatedConv.lastMessageAt = new Date().toISOString(); 
        updatedConv.lastSenderId = msg.senderId;
        
        if (String(state.activeConversationId) !== String(msg.conversationId)) {
           if (!updatedConv.isMuted) {
               updatedConv.unreadCount = (updatedConv.unreadCount || 0) + 1;
           }
        }
        newConversations.splice(convIndex, 1);
        newConversations.unshift(updatedConv);
      } 
      return { 
        messages: { ...state.messages, [msg.conversationId]: newMsgs },
        conversations: newConversations,
        typingStatus: { ...state.typingStatus, [msg.conversationId]: false } 
      };
    });
  },

  markConversationAsSeen: (convId) => set((state) => {
    const msgs = state.messages[convId] || [];
    const updatedMsgs = msgs.map(m => {
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
                return { ...m, id: realId || m.id, status: status }; 
            }
            return m;
        });
    });
    return { messages: newMessages };
  }),

  togglePin: async (convId) => {
    set(state => ({ conversations: state.conversations.map(c => c.id === convId ? { ...c, isPinned: !c.isPinned } : c) }));
    try { await chatService.togglePin(convId); } catch (e) { console.error(e); }
  },

  toggleMute: async (convId) => {
    set(state => ({ conversations: state.conversations.map(c => c.id === convId ? { ...c, isMuted: !c.isMuted } : c) }));
    try { await chatService.toggleMute(convId); } catch (e) { console.error(e); }
  },

  hideConversation: async (convId) => {
    set(state => ({ 
        conversations: state.conversations.filter(c => c.id !== convId),
        activeConversationId: state.activeConversationId === convId ? null : state.activeConversationId
    }));
    try { await chatService.hideConversation(convId); } catch (e) { console.error(e); }
  },

  fetchPinnedMessages: async (convId) => {
      try {
          const pinned = await chatService.getPinnedMessages(convId);
          const mappedPinned = pinned.map(p => ({...p, isPinned: true}));
          set(state => ({ pinnedMessages: { ...state.pinnedMessages, [convId]: mappedPinned }}));
      } catch (err) {
          console.error(err);
      }
  },

  // [MỚI] Gọi API Jump và thay thế List Tin nhắn
  jumpToMessage: async (convId, msgId) => {
    try {
        const cursorPage = await chatService.jumpToMessage(convId, msgId, 50);
        const uniqueMap = new Map();
        cursorPage.data.reverse().forEach(m => {
            const key = m.id || m.clientSideId;
            if (key && !uniqueMap.has(key)) uniqueMap.set(key, m);
        });

        set(state => ({
            messages: { ...state.messages, [convId]: Array.from(uniqueMap.values()) },
            cursors: { ...state.cursors, [convId]: cursorPage.nextCursor },
            hasMoreMessages: { ...state.hasMoreMessages, [convId]: cursorPage.hasNext },
            isViewingHistory: { ...state.isViewingHistory, [convId]: true } // Bật cờ lịch sử
        }));
    } catch (e) { console.error(e); }
  },

  // [MỚI] Trở về thực tại
  backToPresent: async (convId) => {
    try {
        const cursorPage = await chatService.getMessages(convId, null, 50);
        const uniqueMap = new Map();
        cursorPage.data.reverse().forEach(m => {
            const key = m.id || m.clientSideId;
            if (key && !uniqueMap.has(key)) uniqueMap.set(key, m);
        });

        set(state => ({
            messages: { ...state.messages, [convId]: Array.from(uniqueMap.values()) },
            cursors: { ...state.cursors, [convId]: cursorPage.nextCursor },
            hasMoreMessages: { ...state.hasMoreMessages, [convId]: cursorPage.hasNext },
            isViewingHistory: { ...state.isViewingHistory, [convId]: false } // Tắt cờ lịch sử
        }));
    } catch (e) { console.error(e); }
  }
}));