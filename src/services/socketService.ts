import {io, Socket} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '@/config';

// const SOCKET_URL = 'http://192.168.1.2:5000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect = async (): Promise<void> => {
    if (this.socket && this.socket.connected) {
      console.log('Socket is already connected');
      return;
    }

    this.socket = io(`${Config.API_URL}`);

    this.socket.on('connect', async () => {
      // console.log('Socket.IO connected, ID:', this.socket?.id);

      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        this.socket?.emit('join', userId);
        // console.log('Joined with user ID:', userId);
      }
    });

    this.socket.on('getNotify', (data) => {
      console.log('New notification received:', data);
      this.notifyListeners('notification', data);
    });

    this.socket.on('onlineUsers', (users) => {
      console.log('Online users updated:', users);
      this.notifyListeners('onlineUsers', users);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });
  };

  disconnect = (): void => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket.IO disconnected manually');
    }
  };

  joinUser = (userId: string): void => {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join', userId);
      console.log('User joined:', userId);
    } else {
      console.warn('Socket not connected, cannot join user');
    }
  };

  addListener = (event: string, callback: Function): void => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  };

  removeListener = (event: string, callback: Function): void => {
    if (this.listeners.has(event)) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index !== -1) {
          eventListeners.splice(index, 1);
        }
      }
    }
  };

  private notifyListeners = (event: string, data: any): void => {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        callback(data);
      });
    }
  };

  getSocket = (): Socket | null => {
    return this.socket;
  };
}

const socketService = new SocketService();
export default socketService;
