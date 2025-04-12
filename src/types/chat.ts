export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  role: 'landlord' | 'tenant';
}

export interface Chat {
  id: string;
  participant: ChatParticipant;
  lastMessage: Message;
  unreadCount: number;
  estateId?: string; // Optional: link to the estate being discussed
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
} 