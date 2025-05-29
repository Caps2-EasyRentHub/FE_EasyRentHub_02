import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import React, {useContext, useEffect, useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import {push} from '@/navigation/NavigationUtils';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import Splash from '@/components/Splash';

interface Estate {
  _id: string;
  name: string;
  address: string;
  images: string[];
  property: string;
  status: string;
  price: number;
  reviews?: Array<{
    estateUserId: string;
  }>;
}

interface TranSactionProps {
  _id: string;
  estate: Estate;
  startDate: string;
  endDate: string;
  status: string;
}

const RenderItems = ({item}: {item: TranSactionProps}) => {
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<Estate | null>(null);
  const [load, setLoad] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoad(true);
    if (!item?.estate?._id) {
      setError(true);
      setLoad(false);
      return;
    }

    fetch(`${Config.API_URL}/api/estate/${item.estate._id}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.estate) {
          setData(res.estate);
        } else {
          setError(true);
        }
      })
      .finally(() => setLoad(false));
  }, [item?.estate?._id, userToken]);

  const getStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ';
      case 'approved':
        return 'Đã đặt';
      case 'cancelled':
        return 'Đã Hủy';
      default:
        return 'Hoàn thành';
    }
  };

  const getColorStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return '#fdd43f';
      case 'approved':
        return '#1a97f5';
      case 'cancelled':
        return '#fc4b6c';
      default:
        return '#39cb7f';
    }
  };

  if (load) {
    return <Splash />;
  }

  if (error || !data) {
    return null;
  }

  return (
    <View style={styles.cardItem}>
      {/* <View style={styles.btnFavorite}>
          <FavoriteButton
            favorite={
              data.likes.find((item: any) => item._id === idUser) ? true : false
            }
            id={data._id}
          />
        </View> */}

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
            <Text style={styles.location}>
              {item.startDate
                ? format(new Date(item.startDate), 'dd/MM/yyyy')
                : item.checkIn
                ? format(new Date(item.checkIn), 'dd/MM/yyyy')
                : 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Transaction = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [_data, setData] = useState<[TranSactionProps] | null>(null);
  const [filteredData, setFilteredData] = useState<TranSactionProps[] | null>(
    null,
  );
  const [load, setLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!idUser || !userToken) {
      console.log('Missing user ID or token');
      setLoad(false);
      return;
    }

    try {
      const response = await fetch(
        `${Config.API_URL}/api/rental/tenant-bookings/${idUser}`,
        {
          method: 'GET',
          headers: {Authorization: userToken},
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const res = await response.json();

      if (res.bookings && Array.isArray(res.bookings)) {
        setFilteredData(res.bookings);
      } else {
        console.error('Invalid bookings data:', res);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setFilteredData([]);
    } finally {
      setLoad(false);
      setRefreshing(false);
    }
  }, [idUser, userToken]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTransactions();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#8BC83F']}
        />
      }
    >
      <View>
        <Text style={styles.textTitle}>
          {t('transactions')} {filteredData && filteredData.length} {t('phòng')}
        </Text>
        <View style={styles.viewRender}>
          {load ? (
            <Splash />
          ) : (
            filteredData &&
            filteredData.map((item: TranSactionProps, index: number) => {
              return (
                <RenderItems
                  item={item}
                  key={item._id || index}
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
  },
  textTitle: {
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
