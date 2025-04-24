import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {observer} from 'mobx-react-lite';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getImages} from '../../assets/Images';
import {AuthContext} from '@/context/AuthContext';
import {measure} from 'react-native-reanimated';
import {Config} from '@/config';
import {Left_Icon} from '@/assets/Svg';
import BackButton from '@/components/BackButton';

const {city} = getImages();

interface RentalTransaction {
  _id: string;
  estate: {
    _id: string;
    name: string;
    address: {
      house_number: string;
      road: string;
      quarter: string;
      city: string;
      country: string;
      lat: string;
      lng: string;
    };
    property: {
      bedroom: number;
      bathroom: number;
      floors: number;
    };
    images: string[];
  };
  tenant: {
    _id: string;
    full_name: string;
  };
  landlord: {
    _id: string;
    full_name: string;
  };
  startDate: string;
  endDate: string;
  rentalPrice: number;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

const STATUS_COLORS = {
  pending: '#FFA500',
  approved: '#4CAF50',
  rejected: '#FF0000',
  cancelled: '#9E9E9E',
};

const changeLangue = {
  pending: 'Đang chờ',
  approved: 'Đã đặt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

const BookingHistory = observer(() => {
  const navigation = useNavigation();
  const {userToken, idUser, role} = useContext(AuthContext);
  const [bookings, setBookings] = useState<RentalTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = () => {
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append('Authorization', userToken);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(
      `${Config.API_URL}/api/rental/tenant-bookings/${idUser}`,
      requestOptions,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        // console.log('idUser: ', idUser);
        // console.log('Booking history: ', result);
        if (result.bookings && Array.isArray(result.bookings))
          setBookings(result.bookings);
      })
      .catch((error) => {
        console.error('Error fetching booking history: ', error);
      })
      .finally(() => setLoading(false));
  };

  const renderBookingItem = ({item}: {item: RentalTransaction}) => {
    if (!item || !item.estate) {
      return null;
    }

    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() =>
        navigation.navigate('EstateDetail', {
          id: item.estate._id,
          nearby: false,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri:
              item.estate.images && item.estate.images.length > 0
                ? item.estate.images[0]
                : '',
          }}
          style={styles.estateImage}
          defaultSource={city}
        />
        <View style={styles.headerInfo}>
          <Text
            style={styles.estateName}
            numberOfLines={1}
          >
            {item.estate.name || 'Không tên'}
          </Text>
          <Text style={styles.price}>
            ${item.rentalPrice ? item.rentalPrice.toLocaleString() : '0'}/tháng
          </Text>
        </View>
      </View>

      <ScrollView style={styles.detailsContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Địa chỉ:</Text>
          <Text style={styles.value}>
            {item.estate.address
              ? `${item.estate.address.house_number || ''} ${
                  item.estate.address.road || ''
                }, ${item.estate.address.quarter || ''}, ${
                  item.estate.address.city || ''
                }, ${item.estate.address.country || ''}`
              : 'Địa chỉ không có sẵn'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Các thông tin phòng:</Text>
          <Text style={styles.value}>
            {item.estate.property
              ? `${item.estate.property.bedroom || 0} Phòng ngủ, ${
                  item.estate.property.bathroom || 0
                } Phòng tắm, ${item.estate.property.floors || 0} Tầng`
              : 'Chi tiết phòng không có sẵn'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày bắt đầu:</Text>
          <Text style={styles.value}>
            {item.startDate
              ? moment(item.startDate).format('DD/MM/YYYY')
              : 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày kết thúc:</Text>
          <Text style={styles.value}>
            {item.endDate
              ? moment(item.endDate).format('DD/MM/YYYY')
              : 'Not specified'}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ghi chú:</Text>
            <Text style={styles.value}>{item.notes}</Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: STATUS_COLORS[item.status] || '#999999'},
            ]}
          >
            <Text style={styles.statusText}>
              {changeLangue[item.status] || 'Không xác định'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </TouchableOpacity>;

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.titleView}>
        <Text style={styles.headerTitle}>Lịch sử thuê phòng</Text>
      </View>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy phòng đã đặt</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  titleView: {
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  estateImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  estateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#4CAF50',
  },
  detailsContainer: {
    padding: 16,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#333333',
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default BookingHistory;
