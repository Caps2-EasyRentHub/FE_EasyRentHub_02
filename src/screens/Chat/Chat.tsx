import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { chatService } from '@/services/chatService';
import socketService from '@/services/socketService';
import { AuthContext } from '@/context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const EmptyStateIcon = ({ size, color }) => (
  <View style={{ alignItems: 'center' }}>
    <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
  </View>
);

const ChatScreen = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesListRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [showConversations, setShowConversations] = useState(true);
  const [mediaFile, setMediaFile] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [sendingStatus, setSendingStatus] = useState({
    isSending: false,
    error: null
  });

  useEffect(() => {
    const getUserId = async () => {
      try {      
        let id = null;
        
        if (user) {
          id = user.id || user._id;
        }
        
        if (!id) {
          id = await AsyncStorage.getItem('userId');
        }
        
        if (!id) {
          id = await AsyncStorage.getItem('id');
        }
        
        if (!id) {
          id = await AsyncStorage.getItem('user_id');
        }
        
        setUserId(id);
      } catch (error) {
        console.error('Error getting userId:', error);
      }
    };
    
    getUserId();
  }, [user]);

  useEffect(() => {
    if (userId) {
      console.log('Connecting to socket with userId:', userId);
      
      // Connect to socket
      socketService.connect();
      
      // Join user's room with their ID
      socketService.joinUser(userId);
      
      const handleNewMessage = (newMessage) => {
        console.log('Socket message received in Chat component:', newMessage);
        
        // If it's a new message for the current conversation, add it to the messages
        if (selectedConversation && newMessage.conversationId === selectedConversation._id) {
          console.log('Adding new message to current conversation');
          
          // Add message if it's not already in the list
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === newMessage._id);
            if (exists) {
              console.log('Message already exists, not adding');
              return prev;
            }
            const updated = [...prev, newMessage];
            return updated;
          });
          
          // Scroll to the new message
          setTimeout(() => {
            messagesListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          // Mark as read if it's from another user
          if (newMessage.senderId !== userId) {
            // Mark message as read
            socketService.markMessageAsRead(newMessage._id);
          }
        }
        
        // Update the conversations list to show the latest message
        updateConversationWithNewMessage(newMessage);
      };
      
      // Add listener for incoming messages
      socketService.addListener('receive_message', handleNewMessage);
      
      return () => {
        // Remove listener when component unmounts
        socketService.removeListener('receive_message', handleNewMessage);
      };
    }
  }, [userId, selectedConversation]);

  useEffect(() => {
    if (userId) {
      console.log('Fetching conversations with userId:', userId);
      fetchConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) {
      console.error('Attempting to fetch conversations without userId');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting API call to fetch conversations with userId:', userId);
      const result = await chatService.getConversations(userId);
      console.log('Conversations API result:', result ? `Found ${result.length} conversations` : 'No result');
      
      if (!result || result.length === 0) {
        console.log('No conversations found or empty result');
        setConversations([]);
        setLoading(false);
        return;
      }
      
      setConversations(result);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách cuộc trò chuyện');
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      setError(null);
      
      const result = await chatService.getMessages(conversationId);
      
      if (result && result.length > 0) {
        setMessages(result);
        
        setTimeout(() => {
          messagesListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      } else {
        console.log('No messages found for this conversation');
      }
      
      setLoadingMessages(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    if (width < 768) {
      setShowConversations(false);
    }
    
    if (conversation && conversation._id) {
      fetchMessages(conversation._id);
    }
  };

  const updateConversationWithNewMessage = (newMessage) => {
    setConversations(prev => {
      const updatedConversations = [...prev];
      const index = updatedConversations.findIndex(
        conv => conv._id === newMessage.conversationId
      );
      
      if (index !== -1) {
        updatedConversations[index] = {
          ...updatedConversations[index],
          lastMessage: newMessage.text,
          lastMessageType: newMessage.mediaType || 'text',
          lastUpdated: newMessage.timestamp,
        };
        
        const updatedConv = updatedConversations.splice(index, 1)[0];
        updatedConversations.unshift(updatedConv);
      }
      
      return updatedConversations;
    });
  };

  const handleSendMessage = async () => {  
    if (!messageInput.trim()) {
      console.log('Empty message, not sending');
      return;
    }
    
    if (!selectedConversation) {
      console.log('No active conversation');
      Alert.alert('Thông báo', 'Vui lòng chọn cuộc trò chuyện');
      return;
    }
    
    if (!userId) {
      console.log('No user ID');
      Alert.alert('Thông báo', 'Không tìm thấy ID người dùng');
      return;
    }
    
    console.log('All conditions passed, trying to send message');
    
    try {
      // Get the receiver ID
      const receiverId = selectedConversation.members.find(id => id !== userId);
      if (!receiverId) {
        console.log('Cannot find receiver ID');
        Alert.alert('Lỗi', 'Không tìm thấy người nhận');
        return;
      }
      
      // Message data
      const messageData = {
        senderId: userId,
        receiverId: receiverId,
        text: messageInput.trim(),
        conversationId: selectedConversation._id, // Add this for socket
        timestamp: new Date().toISOString() // Add timestamp for optimistic update
      };
      
      console.log('Message data prepared:', messageData);
      
      // Clear input immediately
      setMessageInput('');
      
      // Create a temporary message with a local ID for optimistic update
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        ...messageData,
        sending: true  // Flag to show sending status
      };
      
      // Add message optimistically to the UI
      setMessages(prev => [...prev, tempMessage]);
      
      // Scroll to the new message
      setTimeout(() => {
        messagesListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Send via socket for real-time delivery
      socketService.sendMessage(messageData);
      
      // Send via HTTP for persistence
      const result = await chatService.sendMessage(messageData);
      console.log('Message sent result:', result);
      
      // Update the messages list with the actual message from the server
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id 
            ? { ...result, sending: false }
            : msg
        )
      );
      
      // Update conversation with new message
      updateConversationWithNewMessage({
        ...result,
        conversationId: selectedConversation._id
      });
    } catch (error) {
      console.error('Send message error:', error);
      
      // Mark the message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.sending 
            ? { ...msg, sending: false, sendFailed: true }
            : msg
        )
      );
      
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn: ' + error.message);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    
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

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === userId;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {!isCurrentUser && (
          <Image
            source={{ uri: selectedConversation?.otherUser?.avatar || 'https://via.placeholder.com/50' }}
            style={styles.messageAvatar}
          />
        )}
        
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
            item.sending && styles.sendingBubble,
            item.sendFailed && styles.failedBubble,
          ]}
        >
          {item.mediaUrl && item.mediaType === 'image' ? (
            <Image 
              source={{ uri: item.mediaUrl }} 
              style={styles.messageImage} 
            />
          ) : (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}
          >
              {item.text}
          </Text>
          )}
          
          <Text
            style={[
              styles.messageTime,
              isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
            ]}
          >
            {formatTime(item.timestamp)}
            {item.sending && ' • Đang gửi...'}
            {item.sendFailed && ' • Gửi thất bại'}
          </Text>
        </View>
        
        {isCurrentUser && item.read && (
          <Ionicons name="checkmark-done" size={16} color="#4CD964" style={styles.readIcon} />
        )}
      </View>
    );
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        selectedConversation?._id === item._id && styles.selectedConversation,
      ]}
      onPress={() => handleSelectConversation(item)}
    >
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: item.otherUser?.avatar || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.conversationInfo}>
        <Text style={styles.userName}>
          {item.otherUser?.name || 'Người dùng'}
        </Text>
        
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || 'Chưa có tin nhắn'}
        </Text>
      </View>
      
      <View style={styles.conversationMeta}>
        <Text style={styles.timeStamp}>
          {formatTime(item.lastUpdated)}
        </Text>
        
        {(item.unreadCount > 0) && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderConversationEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <EmptyStateIcon size={70} color="#CDCDCD" />
      <Text style={styles.emptyStateText}>Không có cuộc trò chuyện nào</Text>
      <Text style={styles.emptyStateSubtext}>Bắt đầu trò chuyện với người khác</Text>
    </View>
  );

  const pickMedia = () => {
    // Implement the logic to pick media
  };

  const handleMessageInputChange = (text) => {
    console.log('Input changed:', text);
    setMessageInput(text);
  };

  const sendMessage = async () => {
    // Implement the logic to send message
  };

  // Thêm hàm debug đơn giản để kiểm tra sự kiện click
  const debugSendButton = () => {
    console.log('Send button clicked!');
    console.log('Message input:', messageInput);
    console.log('Active conversation:', selectedConversation?._id);
    console.log('User ID:', userId);
    
    // Gọi hàm gửi tin nhắn
    handleSendMessage();
  };

  if (loading && !selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F4C6B" />
      </View>
      </SafeAreaView>
    );
  }

  // Mobile view
  if (width < 768) {
  return (
    <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        
        {showConversations ? (
          // Conversations List View for Mobile
          <>
            <View style={styles.mobileHeader}>
              <Text style={styles.headerTitle}>Tin nhắn</Text>
            </View>
            
            {conversations.length > 0 ? (
              <FlatList
                data={conversations}
                renderItem={renderConversationItem}
                keyExtractor={(item) => item._id || String(Math.random())}
                contentContainerStyle={styles.conversationsList}
              />
            ) : (
              renderConversationEmptyState()
            )}
          </>
        ) : (
          // Chat Detail View for Mobile
          <>
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backButton}
                onPress={() => setShowConversations(true)}
            >
                <Ionicons name="arrow-back" size={24} color="#1F4C6B" />
            </TouchableOpacity>
              
              <Image
                source={{ uri: selectedConversation?.otherUser?.avatar || 'https://via.placeholder.com/40' }}
                style={styles.headerAvatar}
              />
              
              <View style={styles.headerUserInfo}>
              <Text style={styles.headerUserName}>
                  {selectedConversation?.otherUser?.name || 'Người dùng'}
                </Text>
                <Text style={styles.headerUserStatus}>
                  {selectedConversation?.otherUser?.status || ''}
              </Text>
              </View>
            </View>
            
            {loadingMessages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1F4C6B" />
          </View>
            ) : (
          <FlatList
                ref={messagesListRef}
                data={messages}
            renderItem={renderMessage}
                keyExtractor={(item) => item._id || String(Math.random())}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => messagesListRef.current?.scrollToEnd({ animated: false })}
              />
            )}
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={100}
              style={styles.inputContainer}
            >
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={pickMedia}
                  disabled={uploadingMedia}
                >
                  <Ionicons name="attach" size={24} color="#1F4C6B" />
                </TouchableOpacity>
                
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={messageInput}
              onChangeText={(text) => {
                console.log('Input changed:', text);
                setMessageInput(text);
              }}
              multiline
            />
                
            <TouchableOpacity
              style={styles.sendButton}
                  onPress={debugSendButton}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color="#FFFFFF" 
                  />
            </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        )}
      </SafeAreaView>
    );
  }

  // Desktop/Tablet view
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>
      
      <View style={styles.content}>
        {/* Danh sách cuộc trò chuyện */}
        <View style={styles.conversationsPanel}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              placeholderTextColor="#888"
            />
          </View>
          
          {conversations.length > 0 ? (
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item._id || String(Math.random())}
              contentContainerStyle={styles.conversationsList}
            />
          ) : (
            renderConversationEmptyState()
          )}
        </View>
        
        {/* Chi tiết cuộc trò chuyện */}
        <View style={styles.messagesPanel}>
          {selectedConversation ? (
            <>
              <View style={styles.chatHeader}>
                <View style={styles.headerUserContainer}>
                  <Image
                    source={{ uri: selectedConversation.otherUser?.avatar || 'https://via.placeholder.com/40' }}
                    style={styles.headerAvatar}
                  />
                  
                  <View style={styles.headerUserInfo}>
                    <Text style={styles.headerUserName}>
                      {selectedConversation.otherUser?.name || 'Người dùng'}
                    </Text>
                    <Text style={styles.headerUserRole}>
                      {selectedConversation.otherUser?.role || ''}
                    </Text>
                  </View>
                </View>
              </View>
              
              {loadingMessages ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1F4C6B" />
        </View>
      ) : (
                <FlatList
                  ref={messagesListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item._id || String(Math.random())}
                  contentContainerStyle={styles.messagesList}
                  onContentSizeChange={() => messagesListRef.current?.scrollToEnd({ animated: false })}
                />
              )}
              
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.inputContainer}
              >
                <View style={styles.inputRow}>
            <TouchableOpacity
                    style={styles.attachButton}
                    onPress={pickMedia}
                    disabled={uploadingMedia}
                  >
                    <Ionicons name="attach" size={24} color="#1F4C6B" />
            </TouchableOpacity>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChangeText={(text) => {
                      console.log('Input changed:', text);
                      setMessageInput(text);
                    }}
                    multiline
                  />
                  
                  {sendingStatus.error && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>Lỗi: {sendingStatus.error}</Text>
                    </View>
                  )}

                  {sendingStatus.isSending && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#1F4C6B" />
                      <Text style={styles.loadingText}>Đang gửi tin nhắn...</Text>
                    </View>
                  )}
                </View>
              </KeyboardAvoidingView>
            </>
          ) : (
            <View style={styles.noConversationContainer}>
              <EmptyStateIcon size={100} color="#E0E0E0" />
              <Text style={styles.noConversationText}>
                Chọn một cuộc trò chuyện để bắt đầu
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEEF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEEF2',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F4C6B',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationsPanel: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#EBEEF2',
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    margin: 12,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 14,
  },
  conversationsList: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  selectedConversation: {
    backgroundColor: '#E6EEF5',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252B5C',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#797C8B',
  },
  conversationMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  timeStamp: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#1F4C6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messagesPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEEF2',
    backgroundColor: '#FFFFFF',
  },
  headerUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerUserInfo: {
    justifyContent: 'center',
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252B5C',
  },
  headerUserRole: {
    fontSize: 12,
    color: '#4CD964',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  messagesList: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '90%',
  },
  currentUserBubble: {
    backgroundColor: '#1F4C6B',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  otherUserBubble: {
    backgroundColor: '#F0F2F5',
    borderBottomLeftRadius: 4,
  },
  sendingBubble: {
    opacity: 0.7,
  },
  failedBubble: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#252B5C',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: '#A0A0A0',
  },
  readIcon: {
    marginLeft: 4,
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  videoContainer: {
    width: 200,
    height: 150,
    backgroundColor: '#252B5C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  videoText: {
    color: '#FFFFFF',
    marginTop: 8,
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EBEEF2',
    backgroundColor: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#1F4C6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  noConversationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  noConversationText: {
    fontSize: 16,
    color: '#797C8B',
    marginTop: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252B5C',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#797C8B',
    marginTop: 8,
    textAlign: 'center',
  },
  typingContainer: {
    padding: 8,
    marginLeft: 16,
    marginBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#797C8B',
    opacity: 0.7,
  },
  typingText: {
    fontSize: 12,
    color: '#797C8B',
  },
  mediaPreviewContainer: {
    marginBottom: 12,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  videoPreview: {
    width: 120,
    height: 120,
    backgroundColor: '#252B5C',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreviewText: {
    color: '#FFFFFF',
    marginTop: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  errorContainer: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  loadingText: {
    color: '#1F4C6B',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ChatScreen;
