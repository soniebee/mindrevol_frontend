export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  SYSTEM = 'SYSTEM'
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
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM';
  metadata?: any;
  createdAt: string;
  
  clientSideId?: string; 
  status?: 'SENDING' | 'SENT' | 'ERROR'; 
}

export interface Conversation {
  id: string;
  partner: UserSummary;
  lastMessageContent: string;
  lastMessageAt: string;
  lastSenderId: string;
  unreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  
  boxId?: string; 
  boxName?: string;  
  boxAvatar?: string; 
}

export interface SendMessageRequest {
  receiverId?: string;       // Đổi thành không bắt buộc
  conversationId?: string;   // [THÊM MỚI] Gửi ID cuộc trò chuyện
  content: string;
  type?: 'TEXT' | 'IMAGE';
  metadata?: any;
  clientSideId?: string;
}