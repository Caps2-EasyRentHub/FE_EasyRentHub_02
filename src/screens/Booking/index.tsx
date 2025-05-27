import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import axios, {AxiosError} from 'axios';
import {push} from '@/navigation/NavigationUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FaceCapture from '@/components/FaceCapture';
import {faceAuthService} from '@/services/faceAuthService';

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
  const {userToken, idUser} = useContext(AuthContext);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
    return moment(checkOut).diff(moment(checkIn), 'days') || 1;
  };

  const calculateTotalPrice = () => {
    const days = calculateTotalDays();
    return days * estate.price;
  };

  const handleShowFaceAuth = () => {
    console.log('Booking: Showing face authentication modal');
    setIsModalVisible(true);
  };

  const handleFaceCapture = async (imagePath: string) => {
    try {
      console.log('Booking: Face captured, path:', imagePath);
      setCapturedImage(imagePath);
      
      setIsValidating(true);
      console.log('Booking: Validating face...');
      const validationResult = await faceAuthService.validateFace(imagePath);
      setIsValidating(false);
      
      console.log('Booking: Validation result:', validationResult);
      
      if (validationResult.success) {
        setIsVerifying(true);
        console.log('Booking: Verifying face...');
        const verifyResult = await faceAuthService.verifyFace(imagePath);
        setIsVerifying(false);
        
        console.log('Booking: Verification result:', verifyResult);
        
        if (verifyResult.success) {
          setFaceVerified(true);
          setIsModalVisible(false);
          
          Toast.show({
            type: 'success',
            text1: t('Xác thực thành công'),
            text2: t('Bạn có thể tiếp tục thuê phòng'),
            position: 'bottom',
            visibilityTime: 3000,
          });
          
          setTimeout(() => {
            processBooking();
          }, 1500);
        } else {
          setCapturedImage(null);
          setIsModalVisible(false);
          setFaceVerified(false);
          
          Toast.show({
            type: 'error',
            text1: t('Xác thực thất bại'),
            text2: verifyResult.message || t('Khuôn mặt không khớp'),
            position: 'bottom',
            visibilityTime: 3000,
          });
        }
      } else {
        setCapturedImage(null);
        setIsModalVisible(false);
        setFaceVerified(false);
        
        Toast.show({
          type: 'error',
          text1: t('Xác thực thất bại'),
          text2: validationResult.message || t('Không phát hiện khuôn mặt hợp lệ'),
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('Booking: Error in face authentication:', error);
      setCapturedImage(null);
      setIsValidating(false);
      setIsVerifying(false);
      setIsModalVisible(false);
      setFaceVerified(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xác thực';
      Toast.show({
        type: 'error',
        text1: t('Xác thực thất bại'),
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 3000,
      });

      if (axios.isAxiosError(error)) {
        console.log('API Error Response:', JSON.stringify(error.response?.data));
        console.log('API Error Config:', JSON.stringify({
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }));
      }
    }
  };

  const handleFaceCaptureError = (error: string) => {
    console.log('Booking: Face capture error:', error);
    setIsModalVisible(false);
    setFaceVerified(false);
    Toast.show({
      type: 'error',
      text1: t('Chụp ảnh thất bại'),
      text2: error,
      position: 'bottom',
      visibilityTime: 3000,
    });
  };

  const processBooking = async () => {
    if (!idUser) {
      console.error('User ID is missing');
      return;
    }

    if (!faceVerified) {
      console.log('Booking: Face not verified, showing face auth modal');
      handleShowFaceAuth();
      return;
    }

    try {
      setLoading(true);
      console.log('Booking: Processing booking...');
      const response = await axios.post(
        `${Config.API_URL}/api/rental/request`,
        {
          estateId: estate._id,
          userId: idUser,
          startDate: moment(checkIn).format('YYYY-MM-DD'),
          endDate: moment(checkOut).format('YYYY-MM-DD'),
          notes: note,
        },
        {
          headers: {Authorization: userToken},
        },
      );

      console.log('Booking: Booking response:', response.data);
      if (response.data) {
        push({
          name: 'TransactionDetail',
          params: {
            transaction: response.data.booking,
            estate: estate,
          },
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Booking error:', axiosError);
      if (axiosError.response) {
        console.error('Error response:', axiosError.response.data);
      }
      
      Alert.alert(
        t('Đặt phòng thất bại'),
        t('Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại sau.'),
        [{text: t('OK')}]
      );
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
            onPress={() => setShowCheckInPicker(true)}
          >
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
            onPress={() => setShowCheckOutPicker(true)}
          >
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

        {/* Hiển thị trạng thái xác thực nếu đã xác thực */}
        {faceVerified && (
          <View style={styles.verificationStatus}>
            <Text style={styles.verificationText}>
              {t('Xác thực khuôn mặt thành công')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.disabledButton]}
          onPress={handleShowFaceAuth}
          disabled={loading}
        >
          <Text style={styles.bookButtonText}>
            {loading ? t('processing') : t('book_room')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal xác thực khuôn mặt */}
      <FaceCapture
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={handleFaceCapture}
        onError={handleFaceCaptureError}
        title={t('Face Authentication')}
        subtitle={t('Please look at the camera to verify your identity')}
      />
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
    color: 'black',
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
  verificationStatus: {
    backgroundColor: '#E6F7F0',
    padding: 10,
    borderRadius: 8,
    borderColor: '#8BC83F',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationText: {
    color: '#8BC83F',
    fontWeight: 'bold',
  },
});

export default Booking;
