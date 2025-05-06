import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import RadioGroup from 'react-native-radio-buttons-group';
import Splash from '@/components/Splash';
import {EstateDetailProps, TranSactionProps} from '@/utils/interface';
import {useTranslation} from 'react-i18next';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {push} from '@/navigation/NavigationUtils';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import {format} from 'date-fns';

const Confirm = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<TranSactionProps[]>([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    console.log('Auth Context: ', {
      userToken: userToken ? 'exists' : 'null',
      idUser,
    });
  }, [userToken, idUser]);

  useEffect(() => {
    if (!idUser || !userToken) {
      console.log('Missing user ID or token');
      setLoad(false);
      return;
    }

    setLoad(true);

    fetch(`${Config.API_URL}/api/rental/tenant-bookings/${idUser}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        // console.log('res.bookings');
        // console.log(res.bookings);
        if (res.bookings && Array.isArray(res.bookings)) {
          const pendingBookings = res.bookings.filter((tenantBooking) => {
            // console.log('Booking status:', tenantBooking.status);
            return tenantBooking.status === 'pending';
          });

          // console.log('Tất cả bookings:', res.bookings.length);
          // console.log('Số lượng bookings pending:', pendingBookings.length);
          setData(pendingBookings);
        } else {
          console.log('Không tìm thấy dữ liệu bookings hợp lệ');
          setData([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching bookings:', error);
        setData([]);
      })
      .finally(() => setLoad(false));
  }, [userToken, idUser]);

  const RenderItems = ({item}: {item: TranSactionProps}) => {
    const {userToken} = useContext(AuthContext);
    const [estateData, setEstateData] = useState<EstateDetailProps | null>(
      null,
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!item?.estate?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      fetch(`${Config.API_URL}/api/estate/${item.estate._id}`, {
        method: 'GET',
        headers: {Authorization: userToken},
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.estate) {
            setEstateData(res.estate);
          }
        })
        .catch((error) => {
          console.error('Error fetching estate details:', error);
        })
        .finally(() => setLoading(false));
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

    if (loading) {
      return (
        <View
          style={[
            styles.cardItem,
            {justifyContent: 'center', alignItems: 'center'},
          ]}
        >
          <Splash />
        </View>
      );
    }

    if (!estateData) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.cardItem}
        onPress={() =>
          push({
            name: 'ConfirmDetail',
            params: {transaction: item, estate: estateData},
          })
        }
      >
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
          source={{
            uri:
              estateData?.images && estateData.images.length > 0
                ? estateData.images[0]
                : null,
          }}
          style={styles.images}
          // defaultSource={require('@/assets/Images/no-image.png')}
        />

        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{estateData?.name || 'No Name'}</Text>
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.textTitle}>
          {data.length} {t('transactions')}
        </Text>

        <View style={styles.viewRender}>
          {load ? (
            <View style={{marginTop: 50, alignItems: 'center'}}>
              <Splash />
              <Text style={{marginTop: 20, textAlign: 'center'}}>
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : data.length === 0 ? (
            <Text style={{marginTop: 50, textAlign: 'center'}}>
              Không có giao dịch nào
            </Text>
          ) : (
            <View style={styles.viewRender}>
              {data.map((item: TranSactionProps, index: number) => (
                <RenderItems
                  item={item}
                  key={index}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Confirm;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    width: screenWidth,
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
    justifyContent: 'space-between',
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
