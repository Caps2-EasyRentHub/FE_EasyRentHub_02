import { Chat, Message } from '../types/chat';

// TODO: Replace with your actual API endpoints
const API_BASE_URL = 'YOUR_API_BASE_URL';

export const chatService = {
  // Get all chats for the current user
  async getChats(userId: string): Promise<Chat[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chats?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch chats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },

  // Get messages for a specific chat
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages?chatId=${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a new message
  async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, userId }),
      });
      if (!response.ok) throw new Error('Failed to mark messages as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Admin specific methods
  async getAdminChats(adminId: string): Promise<Chat[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/chats?adminId=${adminId}`);
      if (!response.ok) throw new Error('Failed to fetch admin chats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching admin chats:', error);
      throw error;
    }
  },

  async getLandlordChats(landlordId: string): Promise<Chat[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/landlord/chats?landlordId=${landlordId}`);
      if (!response.ok) throw new Error('Failed to fetch landlord chats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord chats:', error);
      throw error;
    }
  },

  async initiateAdminChat(landlordId: string, adminId: string, estateId?: string): Promise<Chat> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/chats/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ landlordId, adminId, estateId }),
      });
      if (!response.ok) throw new Error('Failed to initiate admin chat');
      return await response.json();
    } catch (error) {
      console.error('Error initiating admin chat:', error);
      throw error;
    }
  }
}; 