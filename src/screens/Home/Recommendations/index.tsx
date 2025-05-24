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
import Splash from '@/components/Splash';
import { Config } from '@/config';

const Recommendations = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<EstateItems[]>([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoad(true);
      
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            'Authorization': userToken,
            'Content-Type': 'application/json'
          },
          redirect: "follow" as RequestRedirect,
        };

        const response = await fetch(
          "http://192.168.1.180:5000/api/recommendations/content-based",
          requestOptions
        );

        const result = await response.json();

        if (result.msg === "Success!" && Array.isArray(result.recommendations)) {
          setData(result.recommendations);
        } else {
          console.error('Unexpected data structure:', result);
          setData([]);
        }
      } catch (error) {
        console.error('API Error:', error);
        setData([]);
      } finally {
        setLoad(false);
      }
    };

    if (userToken) {
      fetchRecommendations();
    }
  }, [userToken]);

  const RenderItems = ({item}: {item: EstateItems}) => {
    return item.status === 'available' && (
      <View style={styles.cardItem}>
        <View style={styles.btnFavorite}>
          <FavoriteButton
            favorite={
              item.likes.find((like: any) => like === idUser) ? true : false
            }
            id={item._id}
          />
        </View>

        <View style={styles.priceView}>
          <View style={styles.priceContent}>
            <Text style={styles.price}>$ </Text>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.stay}> /</Text>
            <Text style={styles.stay}>tháng</Text>
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
              <Text style={styles.rating}>
                {item.reviews ? item.reviews.length : 0}
              </Text>
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
      <Text style={styles.textHeader}>{t('Đề xuất')}</Text>
      {load ? (
        <Splash />
      ) : (
        <View style={styles.viewRender}>
          {data.map((item: EstateItems, index: number) => (
            <RenderItems
              item={item}
              key={index}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default Recommendations;

const styles = StyleSheet.create({
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
    zIndex: 1,
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
  },
});
