// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import { useContext } from 'react';
// import { ChatContext } from '../../context/ChatContext';
// import { AuthContext } from '../../context/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { FontAwesome } from '@expo/vector-icons';
// import moment from 'moment';
// import { Message, Chat } from '../../types/chat';

// const AdminLandlordChat = () => {
//   const { t } = useTranslation();
//   const chatContext = useContext(ChatContext);
//   const { idUser, userRole } = useContext(AuthContext);
//   const [messageInput, setMessageInput] = useState('');

//   useEffect(() => {
//     if (chatContext && idUser && userRole) {
//       if (userRole === 'admin') {
//         chatContext.loadAdminChats(idUser);
//       } else if (userRole === 'landlord') {
//         chatContext.loadLandlordChats(idUser);
//       }
//     }
//   }, [idUser, userRole, chatContext]);

//   const handleSendMessage = async () => {
//     if (messageInput.trim() && chatContext) {
//       await chatContext.sendMessage(messageInput.trim());
//       setMessageInput('');
//     }
//   };

//   const renderMessage = ({ item }: { item: Message }) => {
//     const isCurrentUser = item.senderId === idUser;
//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
//         ]}
//       >
//         <View
//           style={[
//             styles.messageBubble,
//             isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
//           ]}
//         >
//           <Text
//             style={[
//               styles.messageText,
//               isCurrentUser ? styles.currentUserText : styles.otherUserText,
//             ]}
//           >
//             {item.content}
//           </Text>
//         </View>
//         <Text
//           style={[
//             styles.messageTime,
//             isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
//           ]}
//         >
//           {moment(item.timestamp).format('HH:mm')}
//         </Text>
//       </View>
//     );
//   };

//   const renderChatItem = ({ item }: { item: Chat }) => {
//     const isOnline = true; // TODO: Implement real online status
//     return (
//       <TouchableOpacity
//         style={styles.chatItem}
//         onPress={() => {
//           if (chatContext) {
//             chatContext.dispatch({ type: 'SET_CURRENT_CHAT', payload: item });
//             chatContext.loadMessages(item.id);
//           }
//         }}
//       >
//         <Image
//           source={{ uri: item.participant.avatar }}
//           style={styles.avatar}
//         />
//         <View style={styles.chatInfo}>
//           <Text style={styles.chatName}>{item.participant.name}</Text>
//           <Text
//             style={styles.lastMessage}
//             numberOfLines={1}
//           >
//             {item.lastMessage.content}
//           </Text>
//         </View>
//         <View style={styles.chatMeta}>
//           <Text style={styles.time}>
//             {moment(item.lastMessage.timestamp).format('HH:mm')}
//           </Text>
//           {item.unreadCount > 0 && (
//             <View style={styles.unreadBadge}>
//               <Text style={styles.unreadCount}>{item.unreadCount}</Text>
//             </View>
//           )}
//           <View
//             style={[
//               styles.onlineIndicator,
//               isOnline ? styles.online : styles.offline,
//             ]}
//           />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>
//           {userRole === 'admin'
//             ? t('chat_with_landlord')
//             : t('chat_with_admin')}
//         </Text>
//       </View>

//       {chatContext?.state.currentChat ? (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.chatContainer}
//         >
//           <FlatList
//             data={chatContext.state.messages}
//             renderItem={renderMessage}
//             keyExtractor={(item) => item.id}
//             style={styles.messagesList}
//           />
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               value={messageInput}
//               onChangeText={setMessageInput}
//               placeholder={t('type_message')}
//               multiline
//             />
//             <TouchableOpacity
//               style={styles.sendButton}
//               onPress={handleSendMessage}
//               disabled={!messageInput.trim()}
//             >
//               <FontAwesome
//                 name="send"
//                 size={20}
//                 color={messageInput.trim() ? '#FFFFFF' : '#A1A5B1'}
//               />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       ) : (
//         <FlatList
//           data={chatContext?.state.chats || []}
//           renderItem={renderChatItem}
//           keyExtractor={(item) => item.id}
//           style={styles.chatsList}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F4F8',
//   },
//   header: {
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#252B5C',
//   },
//   chatContainer: {
//     flex: 1,
//   },
//   messagesList: {
//     flex: 1,
//     padding: 16,
//   },
//   messageContainer: {
//     marginBottom: 16,
//     maxWidth: '80%',
//   },
//   currentUserMessage: {
//     alignSelf: 'flex-end',
//   },
//   otherUserMessage: {
//     alignSelf: 'flex-start',
//   },
//   messageBubble: {
//     padding: 12,
//     borderRadius: 16,
//   },
//   currentUserBubble: {
//     backgroundColor: '#1F4C6B',
//     borderTopRightRadius: 4,
//   },
//   otherUserBubble: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   currentUserText: {
//     color: '#FFFFFF',
//   },
//   otherUserText: {
//     color: '#252B5C',
//   },
//   messageTime: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   currentUserTime: {
//     color: '#A1A5B1',
//     textAlign: 'right',
//   },
//   otherUserTime: {
//     color: '#535F70',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E0E0E0',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     marginRight: 8,
//     maxHeight: 100,
//   },
//   sendButton: {
//     backgroundColor: '#1F4C6B',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     justifyContent: 'center',
//   },
//   chatsList: {
//     flex: 1,
//   },
//   chatItem: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   chatInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   chatName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#252B5C',
//   },
//   lastMessage: {
//     fontSize: 14,
//     color: '#535F70',
//     marginTop: 4,
//   },
//   chatMeta: {
//     alignItems: 'flex-end',
//   },
//   time: {
//     fontSize: 12,
//     color: '#A1A5B1',
//   },
//   unreadBadge: {
//     backgroundColor: '#1F4C6B',
//     borderRadius: 12,
//     minWidth: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   unreadCount: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   onlineIndicator: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginTop: 4,
//   },
//   online: {
//     backgroundColor: '#4CAF50',
//   },
//   offline: {
//     backgroundColor: '#9E9E9E',
//   },
// });

// export default AdminLandlordChat;