import axios from 'axios';
import {Config} from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from './socketService';
import {faceAuthService} from '@/services/faceAuthService';
import {Platform} from 'react-native';

export interface LoginResponse {
  access_token: string;
  user: {
    _id: string;
    avatar: string;
    full_name: string;
    address: {
      lat: string;
      lng: string;
      road: string;
      city: string;
      country: string;
    };
  };
}

export interface LoginError {
  message: string;
  code?: string;
}

export interface RegisterResponse {
  msg: string;
  access_token: string;
  user: {
    _id: string;
    full_name: string;
    email: string;
    avatar: string;
    role: string;
    status: number;
  };
}

export interface RegisterError {
  message: string;
  code?: string;
}

export const authService = {
  async register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: 'Tenant' | 'Landlord',
  ): Promise<RegisterResponse> {
    try {
      const response = await axios.post<RegisterResponse>(
        `${Config.API_URL}/api/register`,
        {full_name: fullName, email, password, confirmPassword, role},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      await Promise.all([
        AsyncStorage.setItem('access_token', response.data.access_token),
        AsyncStorage.setItem('idUser', response.data.user._id),
        AsyncStorage.setItem('avatarUser', response.data.user.avatar),
        AsyncStorage.setItem('full_name', response.data.user.full_name),
        AsyncStorage.setItem('role', response.data.user.role),
      ]);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Connection timeout. Please try again.');
        } else if (error.message === 'Network Error') {
          throw new Error('Network error. Please check your connection.');
        } else if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.msg || 'Invalid registration data.',
          );
        } else {
          throw new Error(
            error.response?.data?.msg ||
              'An error occurred during registration.',
          );
        }
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${Config.API_URL}/api/login`,
        {email, password},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      await Promise.all([
        AsyncStorage.setItem('access_token', response.data.access_token),
        AsyncStorage.setItem('idUser', response.data.user._id),
        AsyncStorage.setItem('avatarUser', response.data.user.avatar),
        AsyncStorage.setItem('full_name', response.data.user.full_name),
        AsyncStorage.setItem('lat', response.data.user.address.lat),
        AsyncStorage.setItem('lng', response.data.user.address.lng),
        AsyncStorage.setItem('road', response.data.user.address.road),
        AsyncStorage.setItem('city', response.data.user.address.city),
        AsyncStorage.setItem('country', response.data.user.address.country),
      ]);

      await socketService.connect();
      socketService.joinUser(response.data.user._id);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Connection timeout. Please try again.');
        } else if (error.message === 'Network Error') {
          throw new Error('Network error. Please check your connection.');
        } else if (error.response?.status === 401) {
          throw new Error('Invalid email or password.');
        } else {
          throw new Error(
            error.response?.data?.message || 'An error occurred during login.',
          );
        }
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      socketService.disconnect();

      await Promise.all([
        AsyncStorage.removeItem('access_token'),
        AsyncStorage.removeItem('idUser'),
        AsyncStorage.removeItem('userId'),
        AsyncStorage.removeItem('avatarUser'),
        AsyncStorage.removeItem('full_name'),
        AsyncStorage.removeItem('lat'),
        AsyncStorage.removeItem('lng'),
        AsyncStorage.removeItem('road'),
        AsyncStorage.removeItem('city'),
        AsyncStorage.removeItem('country'),
        AsyncStorage.removeItem('face_verified_timestamp'),
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  async getStoredUserData(): Promise<{
    userToken: string | null;
    idUser: string | null;
    avatarUser: string | null;
    fullName: string | null;
    lat: string | null;
    lng: string | null;
    road: string | null;
    city: string | null;
    country: string | null;
  }> {
    try {
      const [
        userToken,
        idUser,
        avatarUser,
        fullName,
        lat,
        lng,
        road,
        city,
        country,
      ] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('idUser'),
        AsyncStorage.getItem('avatarUser'),
        AsyncStorage.getItem('full_name'),
        AsyncStorage.getItem('lat'),
        AsyncStorage.getItem('lng'),
        AsyncStorage.getItem('road'),
        AsyncStorage.getItem('city'),
        AsyncStorage.getItem('country'),
      ]);

      return {
        userToken,
        idUser,
        avatarUser,
        fullName,
        lat,
        lng,
        road,
        city,
        country,
      };
    } catch (error) {
      console.error('Error getting stored user data:', error);
      throw error;
    }
  },

  async registerWithFaceAuth(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: 'Tenant' | 'Landlord',
    faceImagePath: string,
  ): Promise<RegisterResponse> {
    try {
      const response = await this.register(
        fullName,
        email,
        password,
        confirmPassword,
        role,
      );

      const formData = new FormData();
      formData.append('image', {
        uri: faceImagePath,
        type: 'image/jpeg',
        name: 'face_image.jpg',
      });

      await axios.post(
        `${Config.API_URL}/api/face-auth/register`,
        formData,
        {
          headers: {
            Authorization: response.access_token,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        console.error('Face registration failed, but user account created:', error);
        throw new Error('Face registration failed, but your account was created. Please try registering your face later.');
      }
      throw error;
    }
  },

  async registerWithFace(userData, faceImagePath) {
    try {
      const response = await this.register(
        userData.fullName,
        userData.email,
        userData.password,
        userData.confirmPassword,
        userData.role,
      );

      if (faceImagePath) {
        const formData = new FormData();
        formData.append('image', {
          uri: Platform.OS === 'android' ? `file://${faceImagePath}` : faceImagePath,
          type: 'image/jpeg',
          name: 'face_image.jpg',
        });

        await axios.post(
          `${Config.API_URL}/api/face-auth/register`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${response.access_token}`,
            },
          },
        );

        console.log('Face registered successfully');
      }

      return response;
    } catch (error) {
      console.error('Error in registerWithFace:', error);
      throw error;
    }
  },
};
