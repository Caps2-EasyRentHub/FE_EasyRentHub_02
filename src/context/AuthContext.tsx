import {StyleSheet, Text, View} from 'react-native';
import React, {createContext, useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '@/config';
import {replace} from '@/navigation/NavigationUtils';
import {Address} from '@/utils/interface';

export const AuthContext = createContext<{
  isLoading: boolean;
  status: boolean;
  lat: string | null;
  lng: string | null;
  road: string | null;
  country: string | null;
  city: string | null;

  newData: string | undefined;
  fullName: string | null;
  userToken: string;
  avatarUser: string | null;
  idUser: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
}>({
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
  login: () => {},
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
  const [newData, setNewData] = useState();

  const login = (email: string, password: string) => {
    setIsLoading(true);

    axios
      .post(`${Config.API_URL}/api/login`, {
        email,
        password,
      })
      .then((res) => {
        AsyncStorage.setItem('access_token', res.data.access_token);
        AsyncStorage.setItem('idUser', res.data.user._id);
        AsyncStorage.setItem('avatarUser', res.data.user.avatar);
        AsyncStorage.setItem('full_name', res.data.user.full_name);
        AsyncStorage.setItem('lat', res.data.user.address.lat);
        AsyncStorage.setItem('lng', res.data.user.address.lng);
        AsyncStorage.setItem('road', res.data.user.address.road);
        AsyncStorage.setItem('city', res.data.user.address.city);
        AsyncStorage.setItem('country', res.data.user.address.country);

        setNewData(res.data.user);
        setIdUser(res.data.user._id);
        setUserToken(res.data.access_token);
        setAvatarUser(res.data.user.avatar);
        setFullName(res.data.user.full_name);
        setLat(res.data.user.address.lat);
        setLng(res.data.user.address.lng);
        setRoad(res.data.user.address.road);
        setCountry(res.data.user.address.country);
        setCity(res.data.user.address.city);
        isLoggedIn();
        setStatus(false);
      })
      .catch((err) => {
        setStatus(false);
        console.log(err);
      })
      .finally(() => setStatus(true));
    setIsLoading(false);
  };
  const logout = () => {
    setUserToken(null);
    AsyncStorage.removeItem('access_token');
    AsyncStorage.removeItem('idUser');
    AsyncStorage.removeItem('avatarUser');
    AsyncStorage.removeItem('full_name');
    AsyncStorage.removeItem('lat');
    AsyncStorage.removeItem('lmg');
    AsyncStorage.removeItem('road');
    AsyncStorage.removeItem('city');
    AsyncStorage.removeItem('country');
    setIsLoading(false);
  };
  const isLoggedIn = async () => {
    setIsLoading(true);
    try {
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
      setIsLoading(false);
    } catch (error) {
      console.log(error);
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
