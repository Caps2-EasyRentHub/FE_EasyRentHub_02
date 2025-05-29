import {io} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '@/config';

// const SOCKET_URL = 'http://192.168.1.2:5000';

class SocketService {
  private socket: any = null;
  private listeners: Map<string, Function[]> = new Map();
  private connected: boolean = false;

  connect = async (): Promise<void> => {
    try {
      if (this.socket && this.socket.connected) {
        console.log('Socket is already connected');
        return;
      }

      this.socket = io(`${Config.API_URL}`, {
        transports: ['websocket'],
        reconnection: true,
        forceNew: true,
        timeout: 10000,
        autoConnect: false,
      });

      this.socket.connect();

      this.socket.on('connect', async () => {
        console.log('Socket connected successfully');
        this.connected = true;

        try {
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            this.joinUser(userId);
          }
        } catch (err) {
          console.error('Error getting userId:', err);
        }
      });

      this.socket.on('receive_message', (message) => {
        console.log('Socket: New message received:', message);
        this.notifyListeners('receive_message', message);
      });

      this.socket.on('onlineUsers', (users) => {
        console.log('Socket: Online users updated:', users);
        this.notifyListeners('onlineUsers', users);
      });

      this.socket.on('typing', (data) => {
        console.log('Socket: User is typing:', data);
        this.notifyListeners('typing', data);
      });

      this.socket.on('stop_typing', (data) => {
        console.log('Socket: User stopped typing:', data);
        this.notifyListeners('stop_typing', data);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.connected = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.connected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    } catch (error) {
      console.error('Socket init error:', error);
      this.connected = false;
    }
  };

  disconnect = (): void => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  };

  joinUser = (userId: string): void => {
    if (!userId) {
      console.error('Cannot join with empty userId');
      return;
    }

    if (this.socket && this.socket.connected) {
      console.log('Emitting join event with userId:', userId);
      this.socket.emit('join', userId);
      console.log('Joined with user ID:', userId);
    } else {
      console.warn(
        'Socket not connected, cannot join user. Will try to connect first.',
      );
      this.connect().then(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('join', userId);
          console.log('Joined with user ID (after connect):', userId);
        }
      });
    }
  };

  addListener = (event: string, callback: Function): void => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    console.log(
      `Added listener for event: ${event}, total listeners: ${
        this.listeners.get(event)?.length
      }`,
    );
  };

  removeListener = (event: string, callback: Function): void => {
    if (this.listeners.has(event)) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index !== -1) {
          eventListeners.splice(index, 1);
          console.log(
            `Removed listener for event: ${event}, remaining: ${eventListeners.length}`,
          );
        }
      }
    }
  };

  private notifyListeners = (event: string, data: any): void => {
    const eventListeners = this.listeners.get(event);
    if (eventListeners && eventListeners.length > 0) {
      console.log(
        `Notifying ${eventListeners.length} listeners for event: ${event}`,
      );
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in listener callback for event ${event}:`,
            error,
          );
        }
      });
    } else {
      console.log(`No listeners for event: ${event}`);
    }
  };

  getSocket = (): any => {
    return this.socket;
  };

  isConnected = (): boolean => {
    return this.connected && this.socket && this.socket.connected;
  };

  sendMessage(messageData: any) {
    if (!this.isConnected()) {
      console.warn(
        'Socket not connected. Attempting to connect before sending message.',
      );
      this.connect().then(() => {
        if (this.isConnected()) {
          console.log('Socket connected. Now sending message.');
          this.socket.emit('send_message', messageData);
          console.log('Message sent via socket after connecting:', messageData);
        } else {
          console.error(
            'Failed to connect socket. Message not sent via socket.',
          );
        }
      });
      return;
    }

    console.log('Socket connected. Sending message directly:', messageData);
    this.socket.emit('send_message', messageData);
    console.log('Message sent via socket:', messageData);
  }

  sendTypingIndicator(data: {
    senderId: string;
    receiverId: string;
    conversationId: string;
  }) {
    if (this.isConnected()) {
      this.socket.emit('typing', data);
    }
  }

  sendStopTypingIndicator(data: {
    senderId: string;
    receiverId: string;
    conversationId: string;
  }) {
    if (this.isConnected()) {
      this.socket.emit('stop_typing', data);
    }
  }

  markMessageAsRead(messageId: string) {
    if (this.isConnected()) {
      this.socket.emit('mark_as_read', {messageId});
    }
  }
}

const socketService = new SocketService();
export default socketService;
