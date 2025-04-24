import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {EstateItems} from '@/utils/interface';
import {screenWidth} from '@/themes/Responsive';
import {BackButton} from '@/components';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import Splash from '@/components/Splash';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {push} from '@/navigation/NavigationUtils';

const AllEstates = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<EstateItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstates = async () => {
      try {
        const response = await fetch(`${Config.API_URL}/api/estates`, {
          method: 'GET',
          headers: {Authorization: userToken},
        });
        const json = await response.json();
        // Lọc ra các phòng có trạng thái available và không phải pending
        const availableEstates = json.estates.filter(
          (estate: EstateItems) =>
            estate.status === 'available' && estate.status !== 'pending',
        );
        setData(availableEstates);
      } catch (error) {
        console.error('Error fetching estates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstates();
  }, [userToken]);

  const RenderEstateItem = ({item}: {item: EstateItems}) => {
    return (
      <View style={styles.cardItem}>
        <View style={styles.btnFavorite}>
          <FavoriteButton
            favorite={item.likes.find((like: any) => like === idUser) ? true : false}
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

        <Image source={{uri: item.images[0]}} style={styles.images} />

        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            push({name: 'EstateDetail', params: {id: item._id, nearby: true}})
          }>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.ratingView}>
              <Entypo name="star" color={'#FFC42D'} size={10} />
              <Text style={styles.rating}>{item.rating_star}</Text>
            </View>
            <View style={styles.locationView}>
              <FontAwesome6 name="location-dot" color={'#234F68'} size={9} />
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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>{t('Tất cả các phòng')}</Text>
        <View style={styles.placeholder} />
      </View>
      {loading ? (
        <Splash />
      ) : (
        <ScrollView>
          <View style={styles.estatesContainer}>
            {data.map((item, index) => (
              <RenderEstateItem key={index} item={item} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F4F8',
  },
  title: {
    fontFamily: 'Lato-Bold',
    fontSize: 24,
    color: '#252B5C',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  estatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },
  cardItem: {
    width: screenWidth / 2 - 27.5,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    marginTop: 20,
    padding: 8,
    marginHorizontal: 7,
  },
  btnFavorite: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  priceView: {
    position: 'absolute',
    top: 154,
    right: 16,
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
});

export default AllEstates; 