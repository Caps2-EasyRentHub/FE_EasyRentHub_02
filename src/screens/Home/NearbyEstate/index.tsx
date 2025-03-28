import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {EstateItems} from '@/utils/interface';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {screenWidth} from '@/themes/Responsive';
import {push} from '@/navigation/NavigationUtils';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import Splash from '@/components/Splash';

const NearbyEstate = ({detail, id}: {detail: boolean; id: string}) => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
  useEffect(() => {
    setLoad(true);

    fetch(`${Config.API_URL}/api/getRecommend/${detail ? id : idUser}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.estates);
      })
      .finally(() => setLoad(false));
  }, []);

  const RenderItems = ({item}: {item: EstateItems}) => {
    return item._id === id
      ? null
      : item.status === 1 && (
          <View style={styles.cardItem}>
            <View style={styles.btnFavorite}>
              <FavoriteButton
                favorite={
                  item.likes.find((item: any) => item === idUser) ? true : false
                }
                id={item._id}
              />
            </View>

            <View style={styles.priceView}>
              <View style={styles.priceContent}>
                <Text style={styles.price}>$ </Text>
                <Text style={styles.price}>{item.price.rent}</Text>
                <Text style={styles.stay}> /</Text>
                <Text style={styles.stay}>month</Text>
              </View>
            </View>

            <Image
              source={{uri: item.images[0]}}
              style={styles.images}
            />

            <TouchableOpacity
              style={styles.cardContent}
              onPress={() =>
                push({
                  name: 'EstateDetail',
                  params: {id: item._id, nearby: true},
                })
              }
            >
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.ratingView}>
                  <Entypo
                    name="star"
                    color={'#FFC42D'}
                    size={10}
                  />
                  <Text style={styles.rating}>{item.rating_star}</Text>
                </View>
                <View style={styles.locationView}>
                  <FontAwesome6
                    name="location-dot"
                    color={'#234F68'}
                    size={9}
                  />
                  <Text style={styles.location}>
                    {item.address.road}, {item.address.city}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
  };
  return (
    <View>
      {detail ? (
        <Text style={styles.textHeader}>{t('nearby_location')}</Text>
      ) : (
        <Text style={styles.textHeader}>{t('explore_nearby_estates')}</Text>
      )}
      {load ? (
        <Splash />
      ) : (
        <View style={styles.viewRender}>
          {data?.map((item: EstateItems, index: number) => {
            return (
              <RenderItems
                item={item}
                key={index}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default NearbyEstate;

const styles = StyleSheet.create({
  component: {
    flex: 1,
  },
  textHeader: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#252B5C',
    marginLeft: 24,
  },
  btnFavorite: {
    position: 'absolute',
    right: 48,
    top: 8,
  },
  viewRender: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginLeft: 24,
    marginBottom: 20,
  },
  cardItem: {
    width: screenWidth / 2 - 27.5,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    marginTop: 20,
    padding: 8,
    marginRight: 7,
  },
  cardContent: {
    width: screenWidth / 2 - 56,
    marginLeft: 12,
    marginTop: 8,
  },
  cardName: {
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    color: '#252B5C',
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginRight: 7.5,
  },
  locationView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    height: 12,
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
    fontSize: 12,
    width: screenWidth / 2 - 99.5,
  },
  priceView: {
    top: 154,
    right: 16,
    position: 'absolute',
    zIndex: 1,
    // width: 75,
    // height: 25,
    backgroundColor: 'rgba(35,79,104,.69)',
    borderRadius: 8,
  },
  priceContent: {
    marginHorizontal: 8,
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
  },
  price: {
    color: '#F5F4F8',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  stay: {
    color: '#F5F4F8',
    fontSize: 10,
    fontFamily: 'Lato-Regular',
  },
  images: {
    width: screenWidth / 2 - 43.5,
    height: 180,
    borderRadius: 25,
  },
});
