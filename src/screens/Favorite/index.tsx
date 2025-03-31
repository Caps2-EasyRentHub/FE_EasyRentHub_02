import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {Swipeable} from 'react-native-gesture-handler';
import {Empty} from '@/assets/Svg';
import {screenWidth} from '@/themes/Responsive';
import {getImages} from '@/assets/Images';
import FavoriteButton from '@/components/FavoriteButton';
import {collectStoredAnnotations} from 'mobx/dist/internal';
import {EstateDetailProps} from '@/utils/interface';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import Loading from '@/components/Loading';
import {push} from '@/navigation/NavigationUtils';
import Splash from '@/components/Splash';
import {observer} from 'mobx-react-lite';

const Favorite = () => {
  const {t} = useTranslation();
  const [data, setData] = useState<EstateDetailProps[]>([]);
  const {userToken, idUser} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(`${Config.API_URL}/api/getLikeEstates`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.likeEstates);
      })
      .finally(() => {
        setRefreshing(false);
        setIsLoading(false);
      });
  }, [refreshing]);

  const FavoriteItems = () => {
    return data.map((item: EstateDetailProps, index: any) => {
      return (
        <Swipeable
          renderRightActions={() => RightSwipe(item)}
          key={index}
          overshootRight={false}
        >
          <TouchableOpacity
            onPress={() =>
              push({
                name: 'EstateDetail',
                params: {id: item._id, nearby: true},
              })
            }
            style={styles.itemView}
          >
            <View style={styles.contentView}>
              <View style={styles.btnFavoriteView}>
                <FavoriteButton
                  favorite={item.likes[0] === idUser ? true : false}
                  id={item._id}
                />
              </View>

              <Image
                source={{uri: item.images[0]}}
                style={styles.imgItem}
              />
              <View style={styles.rightView}>
                <Text style={styles.nameEstate}>{item.name}</Text>
                <View style={styles.ratingView}>
                  <Entypo
                    name="star"
                    color={'rgba(35,79,104,.42)'}
                    size={12}
                  />
                  <Text style={styles.rating}>3.5</Text>
                </View>
                <View style={styles.ratingView}>
                  <FontAwesome6
                    name="location-dot"
                    color={'#234F68'}
                    size={12}
                  />
                  <Text style={styles.location}>
                    {item.address.road}, {item.address.city}
                  </Text>
                </View>
                <View style={styles.priceView}>
                  <Text style={styles.price}>$ </Text>
                  <Text style={styles.price}>{item.price.rent}</Text>
                  <Text style={styles.stay}> /</Text>
                  <Text style={styles.stay}>month</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    });
  };
  const handleUnFavorite = (item: any) => {
    console.log(item.id);
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
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.component}>
      <Text style={styles.favoriteTitle}>{t('my_favorite')}</Text>
      <TouchableOpacity style={styles.btnDelete}>
        <Feather
          name="trash"
          color={'#252B5C'}
          size={15}
        />
      </TouchableOpacity>
      <Text style={styles.txtEstates}>
        {data.length} {t('estates')}
      </Text>
      {isLoading ? (
        <Splash />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8BC83F']}
            />
          }
        >
          {data.length === 0 ? (
            <View style={styles.emptyView}>
              <Empty />
              <Text style={styles.titleNormal}>{t('your_favorite')}</Text>
              <Text style={styles.titleHighlight}>{t('empty')}</Text>
            </View>
          ) : (
            <FavoriteItems />
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default observer(Favorite);

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  favoriteTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
    textAlign: 'center',
  },
  btnDelete: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    position: 'absolute',
    top: 24,
    right: 24,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    zIndex: 1,
  },
  txtEstates: {
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 24,
  },
  emptyView: {
    marginTop: 124,
    alignItems: 'center',
  },
  titleNormal: {
    fontFamily: 'Lato-Medium',
    color: '#252B5C',
    fontSize: 30,
    marginTop: 14,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#1F4C6B',
    fontSize: 30,
  },
  itemView: {
    width: screenWidth - 48,
    height: 156,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    marginBottom: 10,
    borderRadius: 25,
  },
  contentView: {
    flexDirection: 'row',
  },
  btnFavoriteView: {
    left: 8,
    top: 8,
  },
  imgItem: {
    width: screenWidth / 2 - 16,
    height: 140,
    borderRadius: 18,
    margin: 8,
  },
  rightView: {
    marginLeft: 16,
    marginTop: 16,
  },
  nameEstate: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 16,
    width: screenWidth / 2 - 24 - 48,
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    color: '#53587A',
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  location: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 2,
    fontSize: 14,
    width: screenWidth / 2 - 24 - 48 - 16,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
  },
  price: {
    color: '#252B5C',
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  stay: {
    color: '#252B5C',
    fontSize: 12,
    fontFamily: 'Lato-Regular',
  },
  DeleteView: {
    backgroundColor: '#234F68',
    justifyContent: 'center',
    alignItems: 'center',
    height: 156,
    width: 118,
    marginLeft: -50,
    marginRight: 24,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  trashIcon: {
    left: 18,
  },
});
