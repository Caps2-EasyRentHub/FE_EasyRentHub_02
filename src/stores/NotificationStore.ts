import {makeAutoObservable} from 'mobx';
import {Config} from '@/config';

export interface Notification {
  id: string;
  estateId: string;
  estateName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

class NotificationStore {
  notifications: Notification[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
  }

  markAsRead(id: string) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead() {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
  }

  clearNotifications() {
    this.notifications = [];
  }

  async checkEstateStatus(estateId: string, userToken: string) {
    try {
      const response = await fetch(`${Config.API_URL}/api/estate/${estateId}`, {
        method: 'GET',
        headers: {Authorization: userToken},
      });
      const data = await response.json();
      
      if (data.estate && data.estate.status === 'available') {
        this.addNotification({
          id: Date.now().toString(),
          estateId: data.estate._id,
          estateName: data.estate.name,
          message: `Phòng "${data.estate.name}" đã sẵn sàng cho thuê!`,
          timestamp: new Date(),
          read: false,
        });
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái phòng:', error);
    }
  }
}

export default new NotificationStore(); 