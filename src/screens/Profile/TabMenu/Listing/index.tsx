import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {EstateItems} from '@/utils/interface';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import {navigate, push} from '@/navigation/NavigationUtils';
import {getImages} from '@/assets/Images';
import {Pencil_Icon} from '@/assets/Svg';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';

const Listing = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 100);
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      await fetch(`${Config.API_URL}/api/user_estates/${idUser}?limit=100`, {
        method: 'GET',
        headers: {Authorization: userToken},
      })
        .then((res) => res.json())
        .then((res) => {
          setData(res.estates);
        });
    };
    loadPosts();
  }, []);

  const RenderItems = ({item}: {item: EstateItems}) => {
    return (
      <View style={styles.cardItem}>
        <FavoriteButton
          favorite={
            item.likes.find((item: any) => item === idUser) ? true : false
          }
          id={item._id}
        />
        <View style={styles.btnFavorite}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              {
                backgroundColor: '#8BC83F',
                width: 25,
                height: 25,
                top: 8,
                left: 7,
              },
            ]}
            activeOpacity={0.5}
            onPress={() => push({name: 'EditListing', params: {id: item._id}})}
          >
            <Pencil_Icon />
          </TouchableOpacity>
        </View>

        {item.status === 0 && (
          <View style={[styles.statusView, {backgroundColor: '#fdd43f'}]}>
            <View style={styles.priceContent}>
              <Text
                style={{
                  color: '#F5F4F8',
                  fontSize: 12,
                  fontFamily: 'Lato-Bold',
                  marginLeft: 2,
                }}
              >
                Wait
              </Text>
            </View>
          </View>
        )}

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
            push({name: 'EstateDetail', params: {id: item._id, nearby: false}})
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
              <Text style={styles.rating}>4</Text>
            </View>
            <View style={styles.locationView}>
              <FontAwesome6
                name="location-dot"
                color={'#234F68'}
                size={9}
              />
              <Text style={styles.location}>{item.address.road}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <View style={styles.viewTitle}>
          <Text style={styles.textTitle}>
            {data.length} {t('listings')}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigate({name: 'CreateEstate'})}
          >
            <AntDesign
              name="plus"
              color={'#FFFFFF'}
              size={16}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.viewRender}>
          {data.map((item: EstateItems, index: number) => {
            return (
              <RenderItems
                item={item}
                key={index}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default Listing;

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    marginBottom: 332,
    backgroundColor: '#FFFFFF',
  },
  textTitle: {
    textTransform: 'lowercase',
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
    fontSize: 18,
  },
  viewRender: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  btnFavorite: {
    position: 'absolute',
    right: 48,
    top: 8,
  },

  cardItem: {
    width: screenWidth / 2 - 27.5,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    marginTop: 20,
    padding: 8,
    marginRight: 5,
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
  viewButton: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  viewTitle: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: screenWidth - 48,
  },
  addButton: {
    backgroundColor: '#234F68',
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusView: {
    top: 154,
    left: 16,
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(35,79,104,0.69)',
    borderRadius: 8,
  },
});
