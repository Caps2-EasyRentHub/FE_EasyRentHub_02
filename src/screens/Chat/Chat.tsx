import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chat_Icon } from '@/assets/Svg';

// Tạm thời sử dụng dữ liệu mẫu
const MOCK_CHATS = [
  {
    id: '1',
    participant: {
      id: 'user1',
      name: 'Nguyễn Văn A',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    lastMessage: {
      id: 'msg1',
      senderId: 'user1',
      receiverId: 'currentUser',
      content: 'Chào bạn, phòng trọ còn không?',
      timestamp: new Date(),
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: '2',
    participant: {
      id: 'user2',
      name: 'Trần Thị B',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    lastMessage: {
      id: 'msg2',
      senderId: 'currentUser',
      receiverId: 'user2',
      content: 'Cảm ơn bạn, tôi sẽ đến xem vào ngày mai',
      timestamp: new Date(Date.now() - 86400000), // 1 ngày trước
      isRead: true,
    },
    unreadCount: 0,
  },
];

const MOCK_MESSAGES = {
  '1': [
    {
      id: 'msg1-1',
      senderId: 'user1',
      receiverId: 'currentUser',
      content: 'Chào bạn, phòng trọ còn không?',
      timestamp: new Date(Date.now() - 3600000), // 1 giờ trước
      isRead: false,
    },
    {
      id: 'msg1-2',
      senderId: 'currentUser',
      receiverId: 'user1',
      content: 'Chào bạn, phòng vẫn còn. Bạn muốn đến xem không?',
      timestamp: new Date(Date.now() - 3500000),
      isRead: true,
    },
    {
      id: 'msg1-3',
      senderId: 'user1',
      receiverId: 'currentUser',
      content: 'Vâng, tôi muốn đến xem vào ngày mai. Bạn có thể cho địa chỉ cụ thể không?',
      timestamp: new Date(Date.now() - 3400000),
      isRead: false,
    },
  ],
  '2': [
    {
      id: 'msg2-1',
      senderId: 'user2',
      receiverId: 'currentUser',
      content: 'Chào bạn, tôi đã xem phòng của bạn. Phòng rất đẹp và phù hợp với tôi.',
      timestamp: new Date(Date.now() - 86400000), // 1 ngày trước
      isRead: true,
    },
    {
      id: 'msg2-2',
      senderId: 'currentUser',
      receiverId: 'user2',
      content: 'Cảm ơn bạn, tôi sẽ đến xem vào ngày mai',
      timestamp: new Date(Date.now() - 86300000),
      isRead: true,
    },
  ],
};

const ChatScreen = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [chats, setChats] = useState(MOCK_CHATS);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      setLoading(true);
      // Giả lập tải tin nhắn
      setTimeout(() => {
        setMessages(MOCK_MESSAGES[selectedChat.id] || []);
        setLoading(false);
      }, 500);
    }
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'currentUser',
        receiverId: selectedChat.participant.id,
        content: messageInput.trim(),
        timestamp: new Date(),
        isRead: false,
      };

      setMessages([...messages, newMessage]);
      setMessageInput('');

      // Cập nhật tin nhắn cuối cùng trong danh sách chat
      const updatedChats = chats.map(chat => {
        if (chat.id === selectedChat.id) {
          return {
            ...chat,
            lastMessage: newMessage,
            unreadCount: 0,
          };
        }
        return chat;
      });

      setChats(updatedChats);
      setSelectedChat(updatedChats.find(chat => chat.id === selectedChat.id));
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Nếu là hôm nay, hiển thị giờ:phút
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Nếu là hôm qua, hiển thị "Hôm qua"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    
    // Nếu là ngày khác, hiển thị ngày/tháng
    return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === 'currentUser';
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
            {item.content}
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

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => setSelectedChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.participant.avatar }}
          style={styles.avatar}
        />
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.participant.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
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
        <ActivityIndicator size="large" color="#1F4C6B" />
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
                source={{ uri: selectedChat.participant.avatar }}
                style={styles.headerAvatar}
              />
              <Text style={styles.headerUserName}>
                {selectedChat.participant.name}
              </Text>
            </View>
          </View>
          <FlatList
            style={styles.messagesList}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tin nhắn</Text>
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
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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