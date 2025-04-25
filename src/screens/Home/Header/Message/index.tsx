import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {Chat_Icon} from '@/assets/Svg';
import {chatService} from '@/services/chatService';
import {useAuth} from '@/hooks/useAuth';
import {useNavigation} from '@react-navigation/native';
import {Chat} from '@/types/chat';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '@/utils/type';

type NavigationProp = StackNavigationProp<RootStackParams>;

const Message: React.FC = () => {
  const {user} = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const chats = await chatService.getChats(user.id);
      const totalUnread = chats.reduce((acc: number, chat: Chat) => {
        return acc + (chat.unreadCount || 0);
      }, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra khi tải tin nhắn';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch initial unread count
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Set up real-time updates (polling every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  const handleChatPress = () => {
    navigation.navigate('Chat');
  };

  return (
    <TouchableOpacity
      onPress={handleChatPress}
      style={styles.container}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Tin nhắn${
        unreadCount > 0 ? `, Bạn có ${unreadCount} tin nhắn chưa đọc` : ''
      }`}
    >
      <Chat_Icon />
      {loading ? (
        <View style={[styles.badge, styles.loadingBadge]}>
          <Text style={styles.badgeText}>...</Text>
        </View>
      ) : (
        unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  loadingBadge: {
    backgroundColor: '#666666',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Message;
