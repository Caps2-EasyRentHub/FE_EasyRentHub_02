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
    const getConversations = async () => {
      await fetch(`${Config.API_URL}/api/conversations`, {
        method: 'GET',
        headers: {Authorization: userToken},
      })
        .then((res) => res.json())
        .then((res) => {
          setConversation(
            res.conversations.map((item: any) => {
              return item;
            }),
          );
        });
    };
    getConversations();
  }, []);

  // const FavoriteItems = () => {
  //   return (
  //     <View>
  //       {conversation &&
  //         conversation.recipients?.map((item: any, index: any) => {
  //           return (
  //             <Swipeable
  //               renderRightActions={() => RightSwipe(1)}
  //               overshootRight={false}
  //               key={index}
  //             >
  //               <TouchableOpacity
  //                 style={styles.itemView}
  //                 onPress={() =>
  //                   push({
  //                     name: 'MessagesDetail',
  //                     params: {
  //                       avatar: item.avatar,
  //                       _id: item._id,
  //                       full_name: item.full_name,
  //                     },
  //                   })
  //                 }
  //               >
  //                 <View style={styles.contentView}>
  //                   <View>
  //                     <View style={styles.viewAvatar}>
  //                       <Image
  //                         source={getImages().picture_1}
  //                         style={styles.avatar}
  //                       />
  //                     </View>
  //                     <View style={styles.viewIcon}>
  //                       <View style={styles.iconOnline} />
  //                     </View>
  //                   </View>

  //                   <View style={styles.rightView}>
  //                     <Text style={styles.name}>Perry</Text>
  //                     <Text style={styles.text}>
  //                       tempor incididunt ut labore et dolore adssd asdffg asad
  //                       asd
  //                     </Text>
  //                   </View>
  //                   <View style={styles.viewTime}>
  //                     <Text style={styles.time}>10.45</Text>
  //                     <View style={styles.btnSeen}>
  //                       <Text style={styles.btnSeenText}>2</Text>
  //                     </View>
  //                   </View>
  //                 </View>
  //               </TouchableOpacity>
  //             </Swipeable>
  //           );
  //         })}

  //       {/* <Swipeable
  //         renderRightActions={() => RightSwipe(1)}
  //         overshootRight={false}
  //       >
  //         <View style={styles.itemView}>
  //           <View style={styles.contentView}>
  //             <View>
  //               <View style={styles.viewAvatar}>
  //                 <Image
  //                   source={getImages().picture_1}
  //                   style={styles.avatar}
  //                 />
  //               </View>
  //               {!online && (
  //                 <View style={styles.viewIcon}>
  //                   <View style={styles.iconOnline} />
  //                 </View>
  //               )}
  //             </View>

  //             <View style={styles.rightView}>
  //               <Text style={styles.name}>Perry</Text>
  //               <Text style={styles.textSeen}>
  //                 tempor incididunt ut labore et dolore adssd asdffg asad asd
  //               </Text>
  //             </View>
  //             <View style={styles.viewTime}>
  //               <Text style={styles.time}>2 Day ago</Text>
  //               {!seen && (
  //                 <View style={styles.btnSeen}>
  //                   <Text style={styles.btnSeenText}>2</Text>
  //                 </View>
  //               )}
  //             </View>
  //           </View>
  //         </View>
  //       </Swipeable> */}
  //     </View>
  //   );
  // };
  const renderChat = ({item}: any) => {
    const dateTime = new Date(item.createdAt);
    const hour = dateTime.getHours(); // Lấy giờ
    const minute = dateTime.getMinutes(); // Lấy phút

    return (
      <Swipeable
        renderRightActions={() => RightSwipe(1)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.itemView}
          onPress={() =>
            item.recipients?.map((item: any) => {
              item._id !== idUser &&
                push({
                  name: 'MessagesDetail',
                  params: {
                    avatar: item.avatar,
                    _id: item._id,
                    full_name: item.full_name,
                  },
                });
            })
          }
        >
          <View style={styles.contentView}>
            <View>
              <View style={styles.viewAvatar}>
                {item.recipients?.map((item: any, index: any) => {
                  return (
                    item._id !== idUser && (
                      <Image
                        key={index}
                        source={{uri: item.avatar}}
                        style={styles.avatar}
                      />
                    )
                  );
                })}
              </View>
              <View style={styles.viewIcon}>
                <View style={styles.iconOnline} />
              </View>
            </View>

            <View style={styles.rightView}>
              {item.recipients?.map((item: any, index: any) => {
                return (
                  item._id !== idUser && (
                    <Text
                      style={styles.name}
                      key={index}
                    >
                      {item.full_name}
                    </Text>
                  )
                );
              })}
              {item._id !== idUser && (
                <Text style={styles.text}>{item.text}</Text>
              )}
            </View>
            <View style={styles.viewTime}>
              <Text style={styles.time}>
                {hour}.{minute}
              </Text>
              {/* <View style={styles.btnSeen}>
                <Text style={styles.btnSeenText}>2</Text>
              </View> */}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };
  
  const RightSwipe = (item: any) => {
    return (
      <TouchableOpacity
        style={styles.DeleteView}
        onPress={() => handleUnFavorite(item)}
      >
        <View style={styles.trashIcon}>
          <Feather
            name="trash"
            color={'#FFFFFF'}
            size={20}
          />
        </View>
      ) : unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
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
