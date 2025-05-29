import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useRef, useEffect, useState} from 'react';
import {EstateDetailProps, Featured, UserData} from '@/utils/interface';
import {screenWidth} from '@/themes/Responsive';
import {BackButton} from '@/components';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {Bath_Icon, Bed_Icon, Chat_Icon} from '@/assets/Svg';
import {useTranslation} from 'react-i18next';
import Maps from '@/components/Maps';
import Reviews from '@/screens/Reviews';
import {ScrollView} from 'react-native-virtualized-view';
import NearbyEstate from '@/screens/Home/NearbyEstate';
import {push} from '@/navigation/NavigationUtils';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import Splash from '../../components/Splash';
import { chatService } from '@/services/chatService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EstateDetail: React.FC<Featured> = ({route, navigation}) => {
  const {t} = useTranslation();
  const {id, nearby} = route.params;
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<EstateDetailProps | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    setLoad(true);
    fetch(`${Config.API_URL}/api/estate/${id}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.estate);
      })
      .finally(() => setLoad(false));
  }, []);

  useEffect(() => {
    setLoad(true);
    fetch(`${Config.API_URL}/api/user/${idUser}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setUser(res.user);
      })
      .finally(() => setLoad(false));
  }, []);

  const handleChatWithOwner = async () => {
    if (!data || !data.user || !idUser) {
      console.error('Missing data for chat initialization');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        if (userToken) {
          await AsyncStorage.setItem('token', userToken);
        }
      }

      await AsyncStorage.setItem('userId', idUser);

      const messageData = {
        senderId: idUser,
        receiverId: data.user._id,
        text: `Xin chào, tôi quan tâm đến "${data.name}". Vui lòng cho tôi biết thêm thông tin.`
      };

      const result = await chatService.sendMessage(messageData);
      console.log('Message sent result:', result);

      push({
        name: 'Chat',
        params: {
          conversationId: result.conversationId,
          otherUserId: data.user._id,
          otherUserName: data.user.full_name,
          otherUserAvatar: data.user.avatar
        }
      });
    } catch (error) {
      console.error('Error initiating chat:', error);
      alert('Không thể kết nối chat. Vui lòng thử lại sau.');
    }
  };

  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const AnimatedHeader = Animated.createAnimatedComponent(View);

  return load ? (
    <Splash />
  ) : (
    data && user && (
      <View style={styles.component}>
        <View style={styles.btnHeader}>
          <BackButton />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={5}
          onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            scrollOffsetY.setValue(offsetY);
          }}
        >
          <View>
            <Image
              source={{uri: data.images[0]}}
              style={styles.images}
            />
            <View style={styles.imgArrayView}>
              {data.images.slice(1, 3).map((item: string, index: number) => (
                <View
                  key={index}
                  style={styles.insideImg}
                >
                  <Image
                    source={{uri: item}}
                    style={styles.imgArray}
                  />
                </View>
              ))}
            </View>
            {data.images.length > 3 && (
              <View style={styles.countImage}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Lato-Regular',
                    color: '#FFFFFF',
                  }}
                >
                  +{data.images.length - 3}
                </Text>
              </View>
            )}
            <View style={styles.ratingView}>
              <Entypo
                name="star"
                color={'#FFC42D'}
                size={16}
              />
              <Text style={styles.ratingText}>3</Text>
            </View>
          </View>

          <View style={styles.nameView}>
            <Text style={styles.nameStyle}>{data.name}</Text>
            <View>
              <Text style={styles.priceStyle}>{data.price}đ/tháng</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <FontAwesome6
              name="location-dot"
              color={'#1F4C6B'}
              size={14}
            />
            <Text style={styles.locationStyle}>
              {data.address.road}, {data.address.quarter}, {data.address.city}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.facilitiesView}>
            {data.property.bedroom && (
              <View style={styles.facilities}>
                <Bed_Icon />
                <Text style={styles.bedroom}>
                  {data.property.bedroom} {t('bedroom')}
                </Text>
              </View>
            )}
            {data.property.bathroom && (
              <View style={styles.facilities}>
                <Bath_Icon />
                <Text style={styles.bedroom}>
                  {data.property.bathroom} {t('bathroom')}
                </Text>
              </View>
            )}
          </View>

          {data.user._id !== idUser && (
            <View style={styles.ownerView}>
              <View style={styles.ownerInfo}>
                <Image
                  source={{uri: data.user.avatar}}
                  style={styles.avatarStyles}
                />
                <Text style={styles.username}>{data.user.full_name}</Text>
              </View>
              <TouchableOpacity onPress={handleChatWithOwner}>
                <Chat_Icon />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.separator} />

          <Text style={styles.locationTitle}>{t('location')}</Text>
          <View style={styles.locationView}>
            <View style={styles.locationIcon}>
              <Octicons
                name="location"
                color={'#53587A'}
                size={16}
              />
            </View>
            <Text style={styles.locationText}>
              {data.address.road}, {data.address.quarter}, {data.address.city}
            </Text>
          </View>

          <View style={styles.maps}>
            <Maps
              user={user}
              estate={data}
            />
          </View>

          <Reviews estate={data} />

          {/* {nearby && (
            <NearbyEstate
              detail={true}
              id={data._id}
            />
          )} */}

          {data.user._id !== idUser && (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => push({name: 'Booking', params: {estate: data}})}
            >
              <Text style={styles.bookButtonText}>{t('book_room')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    )
  );
};

export default EstateDetail;

const styles = StyleSheet.create({
  component: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  header: {
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  btnHeader: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  images: {
    width: '100%',
    height: 400,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  imgArrayView: {
    flexDirection: 'column',
    position: 'absolute',
    zIndex: 1,
    bottom: 40,
    right: 24,
    gap: 8,
  },
  imgArray: {
    width: 65,
    height: 65,
    borderRadius: 16,
  },
  insideImg: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 16,
  },
  ratingView: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    zIndex: 1,
    backgroundColor: 'rgba(35,79,104,0.8)',
    paddingHorizontal: 20,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratingText: {
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginLeft: 6,
    color: '#FFFFFF',
  },
  countImage: {
    position: 'absolute',
    zIndex: 2,
    bottom: 40,
    right: 24,
    backgroundColor: 'rgba(23,12,46,0.7)',
    width: 65,
    height: 65,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  nameStyle: {
    fontFamily: 'Lato-Bold',
    fontSize: 26,
    color: '#252B5C',
    flex: 1,
    marginRight: 15,
  },
  priceStyle: {
    color: '#252B5C',
    fontSize: 24,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  locationStyle: {
    color: '#53587A',
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    marginLeft: 8,
    flex: 1,
  },
  perText: {
    color: '#53587A',
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    marginTop: 4,
    textAlign: 'right',
  },
  separator: {
    backgroundColor: '#ECEDF3',
    marginHorizontal: 24,
    height: 1,
    marginTop: 24,
  },
  facilitiesView: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  facilities: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4F8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  bedroom: {
    color: '#53587A',
    marginLeft: 8,
    fontSize: 15,
  },
  ownerView: {
    marginHorizontal: 24,
    backgroundColor: '#F5F4F8',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  avatarStyles: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 16,
    marginLeft: 12,
  },
  locationTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 24,
    marginLeft: 24,
  },
  locationView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#F5F4F8',
    padding: 16,
    borderRadius: 16,
  },
  locationText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
  locationIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maps: {
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  bookButton: {
    backgroundColor: '#8BC83F',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 24,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
