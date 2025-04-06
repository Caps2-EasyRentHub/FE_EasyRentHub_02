import React from 'react';
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

const {city} = getImages();

interface RentalTransaction {
  _id: string;
  estate: string;
  tenant: string;
  landlord: string;
  estateName: string;
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
  startDate: Date;
  rentalPrice: number;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  isBooked: boolean;
}

const STATUS_COLORS = {
  pending: '#FFA500',
  approved: '#4CAF50',
  rejected: '#FF0000',
  completed: '#2196F3',
  cancelled: '#9E9E9E',
};

// Mock data for demonstration
const mockBookings: RentalTransaction[] = [
  {
    _id: '1',
    estate: 'estate1',
    tenant: 'tenant1',
    landlord: 'landlord1',
    estateName: 'Luxury Apartment Downtown',
    address: {
      house_number: '123',
      road: 'Main Street',
      quarter: 'Downtown',
      city: 'Ho Chi Minh',
      country: 'Vietnam',
      lat: '10.762622',
      lng: '106.660172',
    },
    property: {
      bedroom: 3,
      bathroom: 2,
      floors: 1,
    },
    images: ['https://example.com/image1.jpg'],
    startDate: new Date('2024-04-01'),
    rentalPrice: 1500,
    notes: 'Beautiful view of the city',
    status: 'pending',
    isBooked: true,
  },
  {
    _id: '2',
    estate: 'estate2',
    tenant: 'tenant2',
    landlord: 'landlord2',
    estateName: 'Modern Villa with Pool',
    address: {
      house_number: '456',
      road: 'Beach Road',
      quarter: 'Seaside',
      city: 'Da Nang',
      country: 'Vietnam',
      lat: '16.047079',
      lng: '108.206230',
    },
    property: {
      bedroom: 4,
      bathroom: 3,
      floors: 2,
    },
    images: ['https://example.com/image2.jpg'],
    startDate: new Date('2024-03-15'),
    rentalPrice: 2500,
    notes: 'Private pool included',
    status: 'approved',
    isBooked: true,
  },
];

const BookingHistory = observer(() => {
  const navigation = useNavigation();

  const renderBookingItem = ({item}: {item: RentalTransaction}) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('EstateDetail', {id: item.estate, nearby: false})}
    >
      <View style={styles.cardHeader}>
        <Image
          source={{uri: item.images[0]}}
          style={styles.estateImage}
          defaultSource={city}
        />
        <View style={styles.headerInfo}>
          <Text 
            style={styles.estateName}
            numberOfLines={1}
          >
            {item.estateName}
          </Text>
          <Text style={styles.price}>
            ${item.rentalPrice.toLocaleString()}/month
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.detailsContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>
            {`${item.address.house_number} ${item.address.road}, ${item.address.quarter}, ${item.address.city}, ${item.address.country}`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Property Details:</Text>
          <Text style={styles.value}>
            {`${item.property.bedroom} Bedrooms • ${item.property.bathroom} Bathrooms • ${item.property.floors} Floor(s)`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Start Date:</Text>
          <Text style={styles.value}>
            {moment(item.startDate).format('MMM DD, YYYY')}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.value}>{item.notes}</Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: STATUS_COLORS[item.status]},
            ]}
          >
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking History</Text>
      </View>
      <FlatList
        data={mockBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
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