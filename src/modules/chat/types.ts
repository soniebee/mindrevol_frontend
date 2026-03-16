export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  VOICE = 'VOICE' // <-- Thêm dòng này
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
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE'; // <-- Thêm 'VOICE' vào đây
  metadata?: any;
  createdAt: string;
  
  // Field quan trọng cho Optimistic UI
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
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE'; // <-- Thêm 'VOICE' vào đây
  metadata?: any;
  clientSideId?: string;
}