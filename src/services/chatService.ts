import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Config} from '@/config';
import {Alert} from 'react-native';

const API_BASE_URL = `${Config.API_URL}/api`;

const getAuthToken = async () => {
  try {
    let token = await AsyncStorage.getItem('token');

    if (!token) {
      token = await AsyncStorage.getItem('userToken');
    }

    if (!token) {
      token = await AsyncStorage.getItem('accessToken');
    }

    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const chatService = {
  async getConversations(userId: string): Promise<any[]> {
    try {
      if (!userId) {
        console.error('No user ID provided for getConversations');
        return [];
      }

      let token = await AsyncStorage.getItem('token');

      if (!token) {
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDUzNTdiMTU2YTNhMDZhZmQ2MWQ4MyIsImlhdCI6MTc0ODMwNzg4MiwiZXhwIjoxNzQ4Mzk0MjgyfQ.usgFF64PYi8M2WMv-aNZn58YizOYn65ASBnQWTrutAE';

        await AsyncStorage.setItem('token', token);
      }

      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const conversations = await response.json();

      const enhancedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.members.find((id) => id !== userId);

          if (!otherUserId) {
            console.warn(`No other user found in conversation ${conv._id}`);
            return conv;
          }

          const userInfo = await this.getUserInfo(otherUserId, token);

          return {
            ...conv,
            otherUser: {
              id: otherUserId,
              name: userInfo.user.full_name,
              avatar: userInfo.user.avatar,
              role: userInfo.user.role,
            },
          };
        }),
      );

      return enhancedConversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getUserInfo(userId: string, token?: string): Promise<any> {
    try {
      console.log('\n==== getUserInfo START ====');
      console.log('userId:', userId);

      if (!token) {
        token = await AsyncStorage.getItem('token');
        console.log(
          'Token from AsyncStorage:',
          token ? `${token.substring(0, 20)}...` : 'null',
        );

        if (!token) {
          token = await AsyncStorage.getItem('userToken');
          console.log(
            'Token from userToken:',
            token ? `${token.substring(0, 20)}...` : 'null',
          );
        }

        if (!token) {
          token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDUzNTdiMTU2YTNhMDZhZmQ2MWQ4MyIsImlhdCI6MTc0ODMwNzg4MiwiZXhwIjoxNzQ4Mzk0MjgyfQ.usgFF64PYi8M2WMv-aNZn58YizOYn65ASBnQWTrutAE';
          console.log('Using default token for testing');
        }
      }

      if (token) {
        const url = `http://192.168.1.46:5000/api/user/${userId}`;
        console.log('Request URL:', url);

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);

        const requestOptions = {
          method: 'GET',
          headers: headers,
          redirect: 'follow',
        };

        console.log('Sending request...');
        const response = await fetch(url, requestOptions);

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('User data retrieved successfully');
          return data;
        }
      }

      console.log('Using mock data for user:', userId);
      return this.getMockUserData(userId);
    } catch (error) {
      console.error(`Error in getUserInfo for ${userId}:`, error);

      return this.getMockUserData(userId);
    }
  },

  getMockUserData(userId: string) {
    const mockNames = {
      '67d5341e156a3a06afd61d7e': 'TruongSoCute',
      '67d5357b156a3a06afd61d83': 'NguyenNgocTruong',
      '67f8c40f1c18b32d1dd2e064': 'Admin System',
    };

    const mockAvatars = {
      '67d5341e156a3a06afd61d7e':
        'https://res.cloudinary.com/dw1sniewf/image/upload/v1669720008/noko-social/audefto1as6m8gg17nu1.jpg',
      '67d5357b156a3a06afd61d83':
        'https://i.pinimg.com/736x/1e/f1/07/1ef107d09eab91d64a71922420140593.jpg',
      '67f8c40f1c18b32d1dd2e064':
        'https://cdn-icons-png.flaticon.com/512/1144/1144760.png',
    };

    const mockRoles = {
      '67d5341e156a3a06afd61d7e': 'Landlord',
      '67d5357b156a3a06afd61d83': 'Tenant',
      '67f8c40f1c18b32d1dd2e064': 'Admin',
    };

    return {
      user: {
        _id: userId,
        full_name: mockNames[userId] || `User ${userId.substring(0, 5)}...`,
        avatar: mockAvatars[userId] || 'https://via.placeholder.com/50',
        role: mockRoles[userId] || '',
      },
    };
  },

  async getMessages(conversationId: string): Promise<any[]> {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/messages/${conversationId}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': token || '',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async uploadMedia(file: any): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  async sendMessage(messageData: {
    senderId: string;
    receiverId: string;
    text: string;
  }): Promise<any> {
    console.log('==== SEND MESSAGE SERVICE ====');

    try {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDUzNTdiMTU2YTNhMDZhZmQ2MWQ4MyIsImlhdCI6MTc0ODM4MTY0MiwiZXhwIjoxNzQ4NDY4MDQyfQ.lrTXx0VEnxbwUPr1iOiTuwd4fXsozVJNvmAI7WCnPqg';

      const url = `${API_BASE_URL}/messages/send`;
      console.log('API URL:', url);

      const requestBody = JSON.stringify({
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        text: messageData.text,
      });
      console.log('Request body:', requestBody);

      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Authorization', `Bearer ${token}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: myHeaders,
        body: requestBody,
        redirect: 'follow',
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Send message error in service:', error);
      throw error;
    }
  },

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');

      await axios.post(
        `${API_BASE_URL}/messages/read/${messageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  async markConversationMessagesAsRead(conversationId: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');

      await axios.post(
        `${API_BASE_URL}/messages/read/conversation/${conversationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error('Error marking conversation messages as read:', error);
    }
  },

  async getAdminChats(adminId: string): Promise<Chat[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/chats?adminId=${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch admin chats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching admin chats:', error);
      throw error;
    }
  },

  async getLandlordChats(landlordId: string): Promise<Chat[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/landlord/chats?landlordId=${landlordId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch landlord chats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord chats:', error);
      throw error;
    }
  },

  async initiateAdminChat(
    landlordId: string,
    adminId: string,
    estateId?: string,
  ): Promise<Chat> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/chats/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({landlordId, adminId, estateId}),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate admin chat');
      }
      return await response.json();
    } catch (error) {
      console.error('Error initiating admin chat:', error);
      throw error;
    }
  },
};
