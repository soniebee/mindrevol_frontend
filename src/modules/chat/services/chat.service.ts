// File: src/modules/chat/services/chat.service.ts
import { http } from "@/lib/http";
import { Message, Conversation, SendMessageRequest, CursorPage } from "../types";

export const chatService = {
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await http.post<any>("/chat/send", data);
    return response.data.data || response.data;
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await http.get<any>("/chat/conversations");
    return response.data.data || response.data || [];
  },

  getMessages: async (conversationId: string, cursor?: string | null, limit: number = 30): Promise<CursorPage<Message>> => {
      const res = await http.get(`/chat/conversations/${conversationId}/messages`, {
          params: { cursor, limit }
      });
      return res.data.data; 
  },

  markAsRead: async (conversationId: string) => {
    await http.post(`/chat/conversations/${conversationId}/read`);
  },

  getOrCreateConversation: async (receiverId: string): Promise<Conversation> => {
    const response = await http.post<any>(`/chat/conversations/init/${receiverId}`);
    return response.data.data || response.data;
  },

  getBoxConversation: async (boxId: string): Promise<Conversation> => {
    const response = await http.get<any>(`/chat/conversations/box/${boxId}`);
    return response.data.data || response.data;
  },

  deleteMessage: async (messageId: string) => {
    await http.delete(`/chat/messages/${messageId}`);
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const res = await http.put(`/chat/messages/${messageId}`, { content });
    return res.data.data;
  },

  reactToMessage: async (messageId: string, reactionType: string): Promise<Message> => {
    const res = await http.post(`/chat/messages/${messageId}/react`, null, { params: { reactionType } });
    return res.data.data;
  },

  getUnreadBadge: async (): Promise<number> => {
    const res = await http.get(`/chat/unread-badge`);
    return res.data.data || 0;
  },

  togglePin: async (conversationId: string) => {
    await http.put(`/chat/conversations/${conversationId}/pin`);
  },

  toggleMute: async (conversationId: string) => {
    await http.put(`/chat/conversations/${conversationId}/mute`);
  },

  hideConversation: async (conversationId: string) => {
    await http.delete(`/chat/conversations/${conversationId}/hide`);
  },

  sharePostToChat: async (targetId: string, postId: string, postImage: string, userMessage?: string, isBox: boolean = false): Promise<Message> => {
    const finalContent = userMessage?.trim() || "Đã chia sẻ một bài viết";
    
    const payload: any = {
      content: finalContent,
      type: 'TEXT',
      clientSideId: Date.now().toString(),
      metadata: {
        replyToPostId: postId,
        replyToImage: postImage,
        type: 'SHARE',
        contentType: 'SHARE_POST',
        sharedPostId: postId
      }
    };

    if (isBox) {
      payload.conversationId = targetId; 
    } else {
      payload.receiverId = targetId; 
    }

    return chatService.sendMessage(payload);
  },

  togglePinMessage: async (messageId: string): Promise<Message> => {
    const res = await http.put(`/chat/messages/${messageId}/pin`);
    return res.data.data;
  },

  getPinnedMessages: async (conversationId: string): Promise<Message[]> => {
    const res = await http.get(`/chat/conversations/${conversationId}/pinned`);
    return res.data.data || [];
  },

  searchMessages: async (conversationId: string, keyword: string): Promise<Message[]> => {
    const res = await http.get(`/chat/conversations/${conversationId}/search`, { params: { keyword } });
    return res.data.data || [];
  },

  // [THÊM MỚI] Gọi API nhảy đến tin nhắn cũ
  jumpToMessage: async (conversationId: string, messageId: string, limit: number = 50): Promise<CursorPage<Message>> => {
    const res = await http.get(`/chat/conversations/${conversationId}/messages/jump`, {
        params: { messageId, limit }
    });
    return res.data.data;
  }
};