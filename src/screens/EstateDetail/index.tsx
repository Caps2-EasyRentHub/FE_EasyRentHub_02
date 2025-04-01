import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useRef, useEffect, useState} from 'react';
import {EstateDetailProps, Featured, Likes, UserData} from '@/utils/interface';
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

  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const AnimatedHeader = Animated.createAnimatedComponent(View);
  const DynamicHeader = ({value}: any) => {
    const animatedHeaderHeight = value.interpolate({
      inputRange: [0, 85],
      outputRange: [0, 85],
      extrapolate: 'clamp',
      useNativeDriver: false,
    });
    return (
      <AnimatedHeader style={[styles.header, {height: animatedHeaderHeight}]} />
    );
  };

  return load ? (
    <Splash />
  ) : (
    data && user && (
      <View style={styles.component}>
        <DynamicHeader value={scrollOffsetY} />

        <View style={styles.btnHeader}>
          <BackButton />
          <FavoriteButton
            size={50}
            favorite={
              data.likes.find((item: any) => item._id === idUser) ? true : false
            }
            id={data._id}
          />
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
            <View style={styles.imgArrayView}>
              {data.images.length > 3
                ? data.images.slice(0, 3).map((item: any, index: number) => {
                    return (
                      <View
                        style={styles.insideImg}
                        key={index}
                      >
                        <Image
                          source={{uri: item}}
                          style={styles.imgArray}
                        />
                      </View>
                    );
                  })
                : data.images.map((item: any, index: number) => {
                    return (
                      <View
                        style={styles.insideImg}
                        key={index}
                      >
                        <Image
                          source={{uri: item}}
                          style={styles.imgArray}
                        />
                      </View>
                    );
                  })}
            </View>
            {data.images.length > 3 ? (
              <View style={styles.countImage}>
                <Text style={{fontSize: 20, fontFamily: 'Lato-Regular'}}>
                  +{data.images.length - 3}
                </Text>
              </View>
            ) : null}

            <View style={[styles.ratingView]}>
              <Entypo
                name="star"
                color={'#FFC42D'}
                size={12}
              />
              <Text style={styles.ratingText}>3</Text>
            </View>
            <Image
              source={{uri: data.images[0]}}
              style={styles.images}
            />
          </View>
          <View style={styles.nameView}>
            <Text style={styles.nameStyle}>{data.name}</Text>
            <Text style={styles.priceStyle}>$ {data.price.rent}</Text>
          </View>
          <View style={styles.nameView}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FontAwesome6
                name="location-dot"
                color={'#1F4C6B'}
                size={12}
              />
              <Text style={styles.locationStyle}>
                {data.address.road}, {data.address.quarter}, {data.address.city}
              </Text>
            </View>

            <Text style={styles.perText}>per month</Text>
          </View>
          {data.user._id !== idUser && (
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <TouchableOpacity
                style={styles.rentButton}
                onPress={() => push({name: 'Transaction', params: {data}})}
              >
                <Text style={styles.rentText}>{t('rent')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buyText}>{t('buy')}</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.separator}></View>
          {data.user._id !== idUser && (
            <View style={styles.ownerView}>
              <View style={{flexDirection: 'row'}}>
                <Image
                  source={{uri: data.user.avatar}}
                  style={styles.avatarStyles}
                />
                <View style={{marginLeft: 16}}>
                  <Text style={styles.username}>{data.user.full_name}</Text>
                  {/* <Text style={styles.address}>{data.address}</Text> */}
                </View>
              </View>
              <Chat_Icon />
            </View>
          )}

          <View style={styles.facilitiesView}>
            {data.property.bedroom ? (
              <View style={styles.facilities}>
                <Bed_Icon />
                <Text style={styles.bedroom}>
                  {data.property.bedroom} {t('bedroom')}
                </Text>
              </View>
            ) : null}
            {data.property.bathroom ? (
              <View style={styles.facilities}>
                <Bath_Icon />
                <Text style={styles.bedroom}>
                  {data.property.bathroom} {t('bathroom')}
                </Text>
              </View>
            ) : null}
          </View>
          <View>
            <Text style={styles.locationTitle}>{t('location')}</Text>
            <View style={styles.locationView}>
              <View style={styles.locationIcon}>
                <Octicons
                  name="location"
                  color={'#53587A'}
                  size={14}
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
          </View>
          <Reviews estate={data} />
          {nearby && (
            <NearbyEstate
              detail={true}
              id={data._id}
            />
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
  },
  btnHeader: {
    position: 'absolute',
  },
  images: {
    width: screenWidth - 20,
    height: 500,
    borderRadius: 50,
    margin: 10,
  },
  imgArrayView: {
    flexDirection: 'column',
    position: 'absolute',
    zIndex: 1,
    bottom: 30,
    right: 24,
  },
  imgArray: {
    width: 60,
    height: 60,
    borderRadius: 18,
  },
  insideImg: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 5,
  },
  ratingView: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    zIndex: 1,
    backgroundColor: 'rgba(35,79,104,.69)',
    width: 95,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratingText: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    marginLeft: 4,
    color: '#FFFFFF',
  },
  countImage: {
    position: 'absolute',
    zIndex: 1,
    bottom: 33,
    right: 27,
    backgroundColor: 'rgba(23,12,46,.43)',
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 5,
  },
  nameStyle: {
    fontFamily: 'Lato-Bold',
    fontSize: 25,
    color: '#252B5C',
    width: screenWidth / 1.4,
  },
  priceStyle: {
    color: '#252B5C',
    fontSize: 25,
    fontWeight: '500',
  },
  locationStyle: {
    color: '#53587A',
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    width: screenWidth - 120,
  },
  perText: {color: '#53587A', fontSize: 14, fontFamily: 'Lato-Regular'},
  rentButton: {
    backgroundColor: '#8BC83F',
    paddingHorizontal: 24,
    paddingVertical: 17.5,
    borderRadius: 20,
    marginLeft: 24,
  },
  buyButton: {
    backgroundColor: '#F5F4F8',
    paddingHorizontal: 24,
    paddingVertical: 17.5,
    borderRadius: 20,
    marginLeft: 24,
  },
  rentText: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
  },
  buyText: {
    color: '#252B5C',
    fontFamily: 'Lato-Regular',
  },
  separator: {
    backgroundColor: '#ECEDF3',
    marginHorizontal: 24,
    height: 1.3,
    marginTop: 23,
  },
  avatarStyles: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  username: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 15,
  },
  address: {
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    fontSize: 12,
  },
  ownerView: {
    justifyContent: 'space-between',
    width: screenWidth - 48,
    backgroundColor: '#F5F4F8',
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 24,
    marginTop: 20,
  },
  facilitiesView: {
    flexDirection: 'row',
    marginLeft: 24,
    marginTop: 20,
  },
  facilities: {
    flexDirection: 'row',
    backgroundColor: '#F5F4F8',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 100,
    marginRight: 10,
  },
  bedroom: {
    color: '#53587A',
    marginLeft: 8,
  },
  locationTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginLeft: 24,
  },
  locationView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 25,
    marginTop: 20,
  },
  locationText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 15,
    width: screenWidth - 140,
  },
  locationIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F4F8',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maps: {
    marginTop: 15,
    marginBottom: 35,
  },
});
