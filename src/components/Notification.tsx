import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {observer} from 'mobx-react-lite';
import notificationStore from '@/stores/NotificationStore';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '@/utils/type';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';

const Notification = () => {
  const {userToken} = useContext(AuthContext);
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${Config.API_URL}/api/notifications`, {
          headers: {Authorization: userToken},
        });
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [userToken]);

  const handleMarkAsRead = async (id: string) => {
    await notificationStore.markAsRead(id);
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? {...notif, read: true} : notif,
      ),
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationStore.markAllAsRead();
    setNotifications(prev =>
      prev.map(notif => ({...notif, read: true})),
    );
  };

  const handleNavigate = (type: string, id: string) => {
    if (type === 'estate') {
      navigation.navigate('EstateDetail', {id});
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAll}>Đánh dấu đã đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      {notifications.map(notification => (
        <TouchableOpacity
          key={notification.id}
          style={[
            styles.notificationItem,
            {backgroundColor: notification.read ? '#FFFFFF' : '#F5F4F8'},
          ]}
          onPress={() => {
            handleMarkAsRead(notification.id);
            handleNavigate(notification.type, notification.estateId);
          }}
        >
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>
              {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', {
                locale: vi,
              })}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default observer(Notification);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F4F8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#252B5C',
  },
  markAll: {
    fontSize: 14,
    color: '#234F68',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F4F8',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252B5C',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#53587A',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#A1A5C1',
  },
}); 