import React, {createContext, useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '@/config';

interface User {
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
}

interface LoginResponse {
  access_token: string;
  user: User;
}

interface AuthContextType {
  isLoading: boolean;
  status: boolean;
  lat: string | null;
  lng: string | null;
  road: string | null;
  country: string | null;
  city: string | null;
  newData: User | undefined;
  fullName: string | null;
  userToken: string;
  avatarUser: string | null;
  idUser: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: false,
  status: false,
  newData: undefined,
  fullName: null,
  lat: null,
  lng: null,
  road: null,
  country: null,
  city: null,
  userToken: '',
  avatarUser: null,
  idUser: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({children}: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(false);
  const [lat, setLat] = useState<string | null>(null);
  const [lng, setLng] = useState<string | null>(null);
  const [road, setRoad] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>('');
  const [avatarUser, setAvatarUser] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [idUser, setIdUser] = useState<string | null>(null);
  const [newData, setNewData] = useState<User>();

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setStatus(false);

      const response = await axios.post<LoginResponse>(
        `${Config.API_URL}/api/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (!response.data || !response.data.access_token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      // Store user data in AsyncStorage
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

      // Update context state
      setNewData(response.data.user);
      setIdUser(response.data.user._id);
      setUserToken(response.data.access_token);
      setAvatarUser(response.data.user.avatar);
      setFullName(response.data.user.full_name);
      setLat(response.data.user.address.lat);
      setLng(response.data.user.address.lng);
      setRoad(response.data.user.address.road);
      setCountry(response.data.user.address.country);
      setCity(response.data.user.address.city);
      
      setStatus(true);
    } catch (error) {
      setStatus(false);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Connection timeout. Please try again.');
        } else if (error.message === 'Network Error') {
          throw new Error('Network error. Please check your connection.');
        } else if (error.response?.status === 401) {
          throw new Error('Invalid email or password.');
        } else {
          throw new Error(error.response?.data?.message || 'An error occurred during login.');
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserToken(null);
    AsyncStorage.removeItem('access_token');
    AsyncStorage.removeItem('idUser');
    AsyncStorage.removeItem('avatarUser');
    AsyncStorage.removeItem('full_name');
    AsyncStorage.removeItem('lat');
    AsyncStorage.removeItem('lng');
    AsyncStorage.removeItem('road');
    AsyncStorage.removeItem('city');
    AsyncStorage.removeItem('country');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('access_token');
      const idUser = await AsyncStorage.getItem('idUser');
      const avatar = await AsyncStorage.getItem('avatarUser');
      const fullName = await AsyncStorage.getItem('full_name');
      const lat = await AsyncStorage.getItem('lat');
      const lng = await AsyncStorage.getItem('lng');
      const road = await AsyncStorage.getItem('road');
      const city = await AsyncStorage.getItem('city');
      const country = await AsyncStorage.getItem('country');

      setIdUser(idUser);
      if (userToken !== null) {
        setUserToken(userToken);
      }
      setLat(lat);
      setLng(lng);
      setRoad(road);
      setCountry(country);
      setCity(city);
      setAvatarUser(avatar);
      setFullName(fullName);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        status,
        lat,
        lng,
        road,
        country,
        city,
        newData,
        fullName,
        userToken: userToken as string,
        avatarUser,
        idUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
