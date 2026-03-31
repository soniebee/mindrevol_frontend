//src/services/chat.service
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
  getMessages: async (conversationId: string, page: number = 0, size: number = 50) => {
      // Nhớ truyền params page và size xuống Backend
      const res = await http.get(`/chat/conversations/${conversationId}/messages`, {
          params: { page, size }
      });
      return res.data.data; // (Sửa .data.data theo đúng format Response Backend của bạn)
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

    // ĐÚNG CHUẨN BACKEND CỦA BRO Ở ĐÂY:
    if (isBox) {
      // Nhóm đã có sẵn hội thoại, truyền thẳng conversationId
      payload.conversationId = targetId; 
    } else {
      // Bạn bè thì truyền receiverId để Backend tìm/tạo hội thoại mới
      payload.receiverId = targetId; 
    }

    return chatService.sendMessage(payload);
  }
};