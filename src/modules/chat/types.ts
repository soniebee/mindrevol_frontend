// File: src/modules/chat/types.ts
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
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM' | 'VOICE' | 'FILE';
  metadata?: any;
  createdAt: string;
  
  clientSideId?: string; 
  status?: 'SENDING' | 'SENT' | 'ERROR' | 'SEEN';
  replyToMsgId?: string;

  senderName?: string;   // [THÊM]
  senderAvatar?: string; // [THÊM]

  isDeleted?: boolean;
  reactions?: Record<string, string>; 
  isPinned?: boolean; // [THÊM MỚI] Cờ báo hiệu tin nhắn được ghim
}

export interface Conversation {
  id: string;
  partner?: UserSummary; 
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

  isPinned?: boolean;
  isMuted?: boolean;
}

export interface SendMessageRequest {
  receiverId?: string;       
  conversationId?: string;   
  boxId?: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE';
  metadata?: any;
  clientSideId?: string;
  replyToMsgId?: string;
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasNext: boolean;
}