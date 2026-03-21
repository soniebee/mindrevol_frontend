import { http } from "@/lib/http";
import { Message, Conversation, SendMessageRequest } from "../types";

export const chatService = {
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await http.post<any>("/chat/send", data);
    return response.data.data || response.data;
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await http.get<any>("/chat/conversations");
    return response.data.data || response.data || [];
  },

  // [ĐÃ SỬA] Đổi tham số từ partnerId sang conversationId
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await http.get<any>(`/chat/conversations/${conversationId}/messages`, {
        params: { size: 50 } 
    });
    
    const data = response.data.data || response.data;

    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.content)) {
        return data.content;
    }
    return [];
  },

  markAsRead: async (conversationId: string) => {
    await http.post(`/chat/conversations/${conversationId}/read`);
  },

  getOrCreateConversation: async (receiverId: string): Promise<Conversation> => {
    const response = await http.post<any>(`/chat/conversations/init/${receiverId}`);
    return response.data.data || response.data;
  },
  
  initConversation: async (receiverId: string): Promise<Conversation> => {
    const response = await http.post<any>(`/chat/conversations/init/${receiverId}`);
    return response.data.data || response.data;
  },

  getBoxConversation: async (boxId: string): Promise<Conversation> => {
    const response = await http.get<any>(`/chat/conversations/box/${boxId}`);
    return response.data.data || response.data;
  },

  sharePostToChat: async (receiverId: string, postId: string, postImage: string, userMessage?: string): Promise<Message> => {
    const finalContent = userMessage?.trim() || "Đã chia sẻ một bài viết";
    const payload: SendMessageRequest = {
      receiverId: receiverId,
      content: finalContent,
      type: 'TEXT' as any, 
      clientSideId: Date.now().toString(),
      metadata: {
        replyToPostId: postId,
        replyToImage: postImage, 
        type: 'SHARE'
      }
    };
    return chatService.sendMessage(payload);
  }
};