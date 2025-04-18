import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import axios from 'axios';
import {push} from '@/navigation/NavigationUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

interface BookingProps {
  route: {
    params: {
      estate: any;
    };
  };
}

const Booking: React.FC<BookingProps> = ({route}) => {
  const {estate} = route.params;
  const {t} = useTranslation();
  const {userToken} = useContext(AuthContext);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckInChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckIn(selectedDate);
    }
  };

  const handleCheckOutChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOut(selectedDate);
    }
  };

  const calculateTotalDays = () => {
    return moment(checkOut).diff(moment(checkIn), 'days');
  };

  const calculateTotalPrice = () => {
    const days = calculateTotalDays();
    return days * estate.price;
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${Config.API_URL}/api/rental/request`,
        {
          estateId: estate._id,
          checkIn: moment(checkIn).format('DD/MM/YYYY'),
          checkOut: moment(checkOut).format('DD/MM/YYYY'),
          note: note,
          price: calculateTotalPrice(),
          status: '1',
        },
        {
          headers: {Authorization: userToken},
        },
      );

      if (response.data) {
        push({
          name: 'TransactionDetail',
          params: {
            transaction: response.data.transaction,
            estate: estate,
          },
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('book_room')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('check_in')}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckInPicker(true)}>
            <Text style={styles.dateText}>
              {moment(checkIn).format('DD/MM/YYYY')}
            </Text>
          </TouchableOpacity>
          {showCheckInPicker && (
            <DateTimePicker
              value={checkIn}
              mode="date"
              display="default"
              onChange={handleCheckInChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('check_out')}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckOutPicker(true)}>
            <Text style={styles.dateText}>
              {moment(checkOut).format('DD/MM/YYYY')}
            </Text>
          </TouchableOpacity>
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOut}
              mode="date"
              display="default"
              onChange={handleCheckOutChange}
              minimumDate={checkIn}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('period_time')}</Text>
          <Text style={styles.periodText}>{calculateTotalDays()} days</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('note_customer')}</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
            placeholder={t('note')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('total')}</Text>
          <Text style={styles.totalPrice}>
            ${calculateTotalPrice().toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.disabledButton]}
          onPress={handleBooking}
          disabled={loading}>
          <Text style={styles.bookButtonText}>
            {loading ? t('processing') : t('book_room')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#252B5C',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252B5C',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#F5F4F8',
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#252B5C',
  },
  periodText: {
    fontSize: 16,
    color: '#53587A',
  },
  noteInput: {
    backgroundColor: '#F5F4F8',
    padding: 12,
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8BC83F',
  },
  bookButton: {
    backgroundColor: '#8BC83F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Booking; 