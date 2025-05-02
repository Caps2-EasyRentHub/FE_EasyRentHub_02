import {useEffect, useState} from 'react';
import socketService from '../services/socketService';

type NotificationData = {
  id: string;
  message: string;
  timestamp: string;
  userId: string;
};

type OnlineUser = {
  userId: string;
  status: string;
};

export const useSocket = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const connect = async () => {
      await socketService.connect();
      setIsConnected(socketService.getSocket()?.connected || false);
    };
    connect();

    const notificationListener = (data: NotificationData) => {
      setNotifications((prev) => [data, ...prev]);
    };

    const onlineUsersListener = (users: OnlineUser[]) => {
      setOnlineUsers(users);
    };

    const connectListener = () => {
      setIsConnected(true);
    };

    const disconnectListener = () => {
      setIsConnected(false);
    };

    socketService.addListener('notification', notificationListener);
    socketService.addListener('onlineUsers', onlineUsersListener);

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('connect', connectListener);
      socket.on('disconnect', disconnectListener);
    }

    return () => {
      socketService.removeListener('notification', notificationListener);
      socketService.removeListener('onlineUsers', onlineUsersListener);

      if (socket) {
        socket.off('connect', connectListener);
        socket.off('disconnect', disconnectListener);
      }
    };
  }, []);

  const joinUser = (userId: string) => {
    socketService.joinUser(userId);
  };

  return {
    notifications,
    onlineUsers,
    isConnected,
    joinUser,
    socket: socketService.getSocket(),
  };
};
