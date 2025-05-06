import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import React, {useContext, useEffect, useState, useRef} from 'react';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {observer} from 'mobx-react-lite';
import notificationStore from '@/stores/NotificationStore';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '@/utils/type';
import {format, formatDistanceToNow} from 'date-fns';
import {vi} from 'date-fns/locale';
import {io} from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons';

// const SOCKET_URL = 'http://192.168.1.2:5000';
// const API_URL = 'http://192.168.1.2:5000/api/notifies';

interface Notification {
  _id: string;
  content: string;
  createdAt: string;
  image?: string;
  isRead: boolean;
  recipients: any[];
  text: string;
  updatedAt: string;
  url: string;
  user: any;
}

const Notification = () => {
  const {userToken, idUser} = useContext(AuthContext);
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socketInstance = io(`${Config.API_URL}`, {
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully:', socketInstance.id);

      if (idUser) {
        socketInstance.emit('join', idUser);
        console.log('Joined with user ID:', idUser);
      }
    });

    socketInstance.on('getNotify', (data) => {
      console.log('New notification received:', data);
      setNotifications((prev) => [data, ...prev]);
    });

    // socketInstance.on('onlineUsers', (users) => {
    //   console.log('Online users updated:', users);
    // });

    // socketInstance.on('connect_error', (error) => {
    //   console.error('Socket connection error:', error.message);
    // });

    // socketInstance.on('disconnect', (reason) => {
    //   console.log('Socket disconnected:', reason);
    // });

    return () => {
      if (socketRef.current) {
        console.log('Socket.IO disconnected manually');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [idUser]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const myHeaders = new Headers();
        myHeaders.append('Authorization', userToken);

        const requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow',
        };

        console.log('Attempting to fetch notifications');
        const response = await fetch(
          `${Config.API_URL}/api/notifies`,
          requestOptions,
        );

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response received:', typeof result);
        console.log('response:', response);

        if (result && result.notifies) {
          console.log(
            `Found ${result.notifies.length} notifications in 'notifies' array`,
          );
          setNotifications(result.notifies);
          setError('');
        } else {
          console.warn(
            'Unexpected response format:',
            JSON.stringify(result).substring(0, 100),
          );
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please check your connection.');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userToken]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationStore.markAsRead(id);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? {...notif, isRead: true} : notif,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNavigate = (url: string) => {
    if (url && url.startsWith('/rental-details/')) {
      const id = url.split('/rental-details/')[1];
      if (id) {
        navigation.navigate('EstateDetail', {id});
      }
    }
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: false,
        locale: vi,
      });
    } catch (e) {
      return '';
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleOptions = () => {
    console.log('Options menu clicked');
  };

  const handleRetry = () => {
    setLoading(true);
    setError('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải thông báo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
        >
          <Icon
            name="chevron-back"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity
          onPress={handleOptions}
          style={styles.optionsButton}
        >
          <Icon
            name="ellipsis-horizontal"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError('');
            }}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : notifications && notifications.length > 0 ? (
        <ScrollView style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              style={styles.notificationItem}
              onPress={() => {
                handleMarkAsRead(notification._id);
                if (notification.url) {
                  handleNavigate(notification.url);
                }
              }}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri:
                      notification.user?.avatar ||
                      'https://i.pinimg.com/736x/6b/7a/b3/6b7ab3939b7d6c6e8eb302731fa5e832.jpg',
                  }}
                  style={styles.avatar}
                />
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.mainContent}>
                  <Text style={styles.notificationTitle}>
                    <Text style={styles.boldText}>
                      {notification.user?.full_name}
                    </Text>
                    <Text style={styles.regularText}> {notification.text}</Text>
                  </Text>
                  <Text style={styles.timeText}>
                    {getTimeAgo(notification.createdAt)}
                  </Text>
                </View>

                {notification.image && (
                  <View style={styles.propertyCard}>
                    <Image
                      source={{uri: notification.image}}
                      style={styles.propertyImage}
                    />
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyName}>
                        {notification.content}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {!notification.isRead && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Image
            source={require('@/assets/Images/common/empty_notify.jpg')}
            style={styles.emptyStateImage}
            onError={() => console.log('Error loading empty state image')}
          />
          <Text style={styles.emptyStateTitle}>
            Không có gì để xem ở đây ...
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            Bạn không có thông báo vào lúc này. {'\n'}
            Vui lòng thử lại sau.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default observer(Notification);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -100,
  },
  emptyStateImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  optionsButton: {
    padding: 4,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mainContent: {
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 2,
    color: '#000000',
  },
  boldText: {
    fontWeight: '600',
  },
  regularText: {
    fontWeight: 'normal',
  },
  timeText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  propertyImage: {
    width: 60,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  propertyDetail: {
    fontSize: 14,
    color: '#757575',
  },
  unreadIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1976D2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8BC83F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
