import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '@/hooks/useAuth';
import {useSocket} from '@/hooks/useSocket';
import axios from 'axios';
import {Config} from '@/config';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = () => {
  const {user} = useAuth();
  const {messages, sendMessage, joinUser} = useSocket();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (user?.id) {
      joinUser(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      axios
        .get(`${Config.API_URL}/api/messages/conversations/${user.id}`)
        .then((res) => {
          setChats(res.data || []);
        })
        .catch(() => setChats([]))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  // Khi chọn chat, có thể filter messages theo participant
  const filteredMessages = selectedChat
    ? messages.filter(
        (msg) =>
          (msg.senderId === user.id &&
            msg.receiverId === selectedChat.participant.id) ||
          (msg.senderId === selectedChat.participant.id &&
            msg.receiverId === user.id),
      )
    : [];

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      sendMessage({
        senderId: user.id,
        receiverId: selectedChat.participant.id,
        text: messageInput.trim(),
        mediaUrl: '',
        mediaType: 'text',
      });
      setMessageInput('');
    }
  };

  const formatTime = (date: any) => {
    const now = new Date();
    const messageDate = new Date(date);
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    return messageDate.toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const renderMessage = ({item}: {item: any}) => {
    const isCurrentUser = item.senderId === user.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}
          >
            {item.text || item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderChatItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => setSelectedChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{uri: item.participant.avatar}}
          style={styles.avatar}
        />
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.participant.name}</Text>
        <Text
          style={styles.lastMessage}
          numberOfLines={1}
        >
          {item.lastMessage.content}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.messageTime}>
          {formatTime(item.lastMessage.timestamp)}
        </Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#1F4C6B"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {selectedChat ? (
        <View style={styles.chatDetailContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedChat(null)}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerUserInfo}>
              <Image
                source={{uri: selectedChat.participant.avatar}}
                style={styles.headerAvatar}
              />
              <Text style={styles.headerUserName}>
                {selectedChat.participant.name}
              </Text>
            </View>
          </View>
          <FlatList
            style={styles.messagesList}
            data={filteredMessages.slice().reverse()}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id || item._id}
            inverted
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={messageInput}
              onChangeText={setMessageInput}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.chatListContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: 60,
                width: 50,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
              }}
              accessibilityLabel="Quay lại"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="chevron-left" size={28} color="#222" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Tin nhắn</Text>
            </View>
          </View>
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatListContainer: {
    flex: 1,
  },
  headerRow: {
    position: 'relative',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#252B5C',
  },
  chatList: {
    padding: 8,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252B5C',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#535F70',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: '#535F70',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#1F4C6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatDetailContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#252B5C',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252B5C',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: '#1F4C6B',
    borderTopRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#252B5C',
  },
  currentUserTime: {
    color: '#A1A5B1',
  },
  otherUserTime: {
    color: '#535F70',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#1F4C6B',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
