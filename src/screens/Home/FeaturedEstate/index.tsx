import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FavoriteButton from '@/components/FavoriteButton';
import {EstateDetailProps, FeaturedProps} from '@/utils/interface';
import {push} from '@/navigation/NavigationUtils';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import Splash from '@/components/Splash';

const FeaturedEstates: React.FC<FeaturedProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [data, setData] = useState<EstateDetailProps[]>([]);
  const {userToken, idUser} = useContext(AuthContext);
  const [load, setLoad] = useState(true);
  useEffect(() => {
    setLoad(true);
    fetch(`${Config.API_URL}/api/estates`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.estates);
      })
      .finally(() => setLoad(false));
  }, []);

  const RenderItems = ({item}: {item: EstateDetailProps}) => {
    return item.status === 1 ? (
      <View style={styles.cardItem}>
        <View>
          <FavoriteButton
            favorite={
              item.likes.find((item: any) => item._id === idUser) ? true : false
            }
            id={item._id}
          />
          <Image
            source={{uri: item.images[0]}}
            style={styles.images}
          />
        </View>

        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            push({name: 'EstateDetail', params: {id: item._id, nearby: true}})
          }
        >
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={styles.ratingView}>
            <Entypo
              name="star"
              color={'#FFC42D'}
              size={10}
            />
            <Text style={styles.rating}>3.9</Text>
          </View>
          <View style={styles.ratingView}>
            <FontAwesome6
              name="location-dot"
              color={'#234F68'}
              size={9}
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
        </TouchableOpacity>
      </View>
    ) : null;
  };
  return (
    <View>
      <View style={styles.itemHeader}>
        <Text style={styles.textHeader}>{t('featured_estates')}</Text>
        <Text style={styles.textViewAll}>{t('view_all')}</Text>
      </View>
      {load ? (
        <Splash />
      ) : (
        <View style={styles.listFeatured}>
          <FlatList
            data={data}
            renderItem={(item) => RenderItems(item)}
            keyExtractor={(item) => item._id.toString()}
            horizontal
          />
        </View>
      )}
    </View>
  );
};

export default FeaturedEstates;

const styles = StyleSheet.create({
  listFeatured: {
    flexDirection: 'row',
    marginLeft: 24,
    marginBottom: 24,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  textHeader: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#252B5C',
  },
  textViewAll: {
    fontSize: 12,
    color: '#234F68',
    fontFamily: 'Lato-Regular',
  },
  images: {
    width: 130,
    height: 140,
    borderRadius: 25,
  },
  cardItem: {
    width: 268,
    height: 156,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    marginRight: 10,
  },
  cardContent: {
    width: 108,
    marginLeft: 12,
    marginTop: 8,
  },
  cardName: {
    fontFamily: 'Lato-Bold',
    fontSize: 12,
    color: '#252B5C',
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    color: '#53587A',
    fontSize: 10,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  location: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 2,
    fontSize: 10,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 29,
  },
  price: {
    color: '#252B5C',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  stay: {
    color: '#252B5C',
    fontSize: 10,
    fontFamily: 'Lato-Regular',
  },
});
