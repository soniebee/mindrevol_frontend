//src/types
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  SYSTEM = 'SYSTEM',
  VOICE = 'VOICE',
  FILE = 'FILE'
}

export interface UserSummary {
  id: string; 
  fullname: string;
  avatarUrl: string;
  handle?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  // <-- ĐÃ THÊM 'VOICE' VÀO ĐÂY ĐỂ BÊN MessageBubble HẾT LỖI
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM' | 'VOICE' | 'FILE';
  metadata?: any;
  createdAt: string;
  
  clientSideId?: string; 
  status?: 'SENDING' | 'SENT' | 'ERROR' | 'SEEN';
  replyToMsgId?: string;
}

export interface Conversation {
  id: string;
  partner: UserSummary;
  lastMessageContent: string;
  lastMessageAt: string;
  lastSenderId: string;
  unreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  isGroup?: boolean;
  members?: any[];
  boxId?: string; 
  boxName?: string;  
  boxAvatar?: string; 
}

export interface SendMessageRequest {
  receiverId?: string;       // Đổi thành không bắt buộc
  conversationId?: string;   // [THÊM MỚI] Gửi ID cuộc trò chuyện
  boxId?: string;
  content: string;
  // <-- ĐÃ THÊM 'VOICE' VÀ 'VIDEO' VÀO ĐÂY
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE';
  metadata?: any;
  clientSideId?: string;
  replyToMsgId?: string;
}