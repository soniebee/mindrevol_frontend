import { http } from "@/lib/http";
import { Message, Conversation, SendMessageRequest } from "../types";

export const chatService = {
  // 1. Gửi tin nhắn
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await http.post<any>("/chat/send", data);
    return response.data.data || response.data;
  },

  // 2. Lấy danh sách Inbox (Conversations)
  getConversations: async (): Promise<Conversation[]> => {
    const response = await http.get<any>("/chat/conversations");
    return response.data.data || response.data || [];
  },

  // 3. Lấy tin nhắn chi tiết với 1 user
  getMessages: async (partnerId: string): Promise<Message[]> => {
    const response = await http.get<any>(`/chat/messages/${partnerId}`, {
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

  // 4. Đánh dấu đã đọc
  markAsRead: async (conversationId: string) => {
    await http.post(`/chat/conversations/${conversationId}/read`);
  },

  // 5. Khởi tạo hội thoại (Tìm hoặc tạo mới)
  getOrCreateConversation: async (receiverId: string): Promise<Conversation> => {
    const response = await http.post<any>(`/chat/conversations/init/${receiverId}`);
    return response.data.data || response.data;
  },
  
  initConversation: async (receiverId: string): Promise<Conversation> => {
    const response = await http.post<any>(`/chat/conversations/init/${receiverId}`);
    return response.data.data || response.data;
  },

  // [THÊM MỚI]: 6. Chia sẻ bài viết (Gọi trực tiếp đến Chat Backend)
sharePostToChat: async (receiverId: string, postId: string, postImage: string, userMessage?: string): Promise<Message> => {
    
    // KHÔNG ghép link URL vào đây nữa. Chỉ lấy đúng chữ người dùng gõ.
    const finalContent = userMessage?.trim() || "Đã chia sẻ một bài viết";

    const payload: SendMessageRequest = {
      receiverId: receiverId,
      content: finalContent,
      type: 'TEXT' as any, 
      clientSideId: Date.now().toString(),
      metadata: {
        replyToPostId: postId,
        replyToImage: postImage, // <--- BÍ QUYẾT LÀ ĐÂY: Truyền ảnh bài viết vào
        type: 'SHARE'
      }
    };

    return chatService.sendMessage(payload);
  }
};