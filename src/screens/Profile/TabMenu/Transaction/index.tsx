import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  EstateDetailProps,
  EstateItems,
  TranSactionProps,
} from '@/utils/interface';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import {push} from '@/navigation/NavigationUtils';
import {getImages} from '@/assets/Images';
import {Pencil_Icon} from '@/assets/Svg';
import {t} from 'i18next';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import Splash from '@/components/Splash';

const RenderItems = ({item}: {item: TranSactionProps}) => {
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<EstateDetailProps | null>(null);
  const [load, setLoad] = useState(true);
  useEffect(() => {
    setLoad(true);
    fetch(`${Config.API_URL}/api/estate/${item.estateId}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.estate);
      })
      .finally(() => setLoad(false));
  }, []);
  const getStatus = (status: string) => {
    switch (status) {
      case '1':
        return 'Processing';
      case '2':
        return 'Booked';
      case '3':
        return 'Cancel Booking';
      default:
        return 'Complete';
    }
  };
  const getColorStatus = (status: string) => {
    switch (status) {
      case '1':
        return '#fdd43f';
      case '2':
        return '#1a97f5';
      case '3':
        return '#fc4b6c';
      default:
        return '#39cb7f';
    }
  };
  return (
    data && (
      <View style={styles.cardItem}>
        {/* <View style={styles.btnFavorite}>
          <FavoriteButton
            favorite={
              data.likes.find((item: any) => item._id === idUser) ? true : false
            }
            id={data._id}
          />
        </View> */}

        <View style={styles.priceView}>
          <View style={styles.priceContent}>
            <Text style={styles.price}>{item.type}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusView,
            {backgroundColor: getColorStatus(item.status)},
          ]}
        >
          <View style={styles.priceContent}>
            <Text style={styles.price}>{getStatus(item.status)}</Text>
          </View>
        </View>

        <Image
          source={{uri: data?.images[0]}}
          style={styles.images}
        />

        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            push({
              name: 'TransactionDetail',
              params: {transaction: item, estate: data},
            })
          }
        >
          <Text style={styles.cardName}>{data?.name}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.locationView}>
              <AntDesign
                name="clockcircle"
                color={'#8BC83F'}
                size={10}
              />
              <Text style={styles.location}>{item.checkIn}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  );
};
const Transaction = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<[TranSactionProps] | null>(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    setLoad(true);
    fetch(`${Config.API_URL}/api/payment/${idUser}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.payments);
      })
      .finally(() => setLoad(false));
  }, []);
  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.textTitle}>
          {data && data.length} {t('transactions')}
        </Text>
        <View style={styles.viewRender}>
          {load ? (
            <Splash />
          ) : (
            data &&
            data.map((item: TranSactionProps, index: number) => {
              return (
                <RenderItems
                  item={item}
                  key={index}
                />
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Transaction;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    width: screenWidth,
    height: screenHeight,
    marginBottom: 332,
  },
  textTitle: {
    textTransform: 'lowercase',
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
    fontSize: 18,
    marginTop: 30,
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
    width: screenWidth / 2 - 76,
  },
  priceView: {
    top: 154,
    right: 16,
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(35,79,104,0.69)',
    borderRadius: 8,
  },
  statusView: {
    top: 154,
    left: 16,
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(35,79,104,0.69)',
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
    fontSize: 12,
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
});
