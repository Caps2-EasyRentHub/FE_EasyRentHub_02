import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import BackButton from '../../../../../components/BackButton';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {screenWidth} from '@/themes/Responsive';
import {RouteConfirm} from '@/utils/interface';
import moment from 'moment';
import {RadioButton} from 'react-native-paper';
import axios from 'axios';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {goBack} from '@/navigation/NavigationUtils';

const ConfirmDetail: React.FC<RouteConfirm> = ({route}) => {
  const {transaction, estate} = route.params;
  const [checked, setChecked] = useState<string>(transaction.status);
  const {userToken, idUser} = useContext(AuthContext);
  const {t} = useTranslation();

  const startDate = moment(transaction.startDate).format('DD/MM/YYYY');
  const endDate = moment(transaction.endDate).format('DD/MM/YYYY');
  const fromDate = moment(startDate, 'DD/MM/YYYY');
  const toDate = moment(endDate, 'DD/MM/YYYY');
  const totalDate = toDate.diff(fromDate, 'days');

  const sumPrice = transaction.rentalPrice * totalDate;

  const handleApproveBooking = () => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', userToken);

    const requestOptions = {
      method: 'PATCH',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(
      `${Config.API_URL}/api/rental/approve/${transaction._id}`,
      requestOptions,
    )
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        Alert.alert('Thành công', 'Đã chấp nhận đặt phòng');
        goBack();
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Lỗi', 'Không thể chấp nhận đặt phòng');
      });
  };

  const handleCancelBooking = () => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', userToken);

    const urlencoded = new URLSearchParams();

    const requestOptions = {
      method: 'PATCH',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };

    fetch(
      `${Config.API_URL}/api/rental/cancel/${transaction._id}`,
      requestOptions,
    )
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        Alert.alert('Thành công', 'Đã hủy đặt phòng');
        goBack();
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Lỗi', 'Không thể hủy đặt phòng');
      });
  };

  const handleStatus = () => {
    if (checked === '1') {
      handleApproveBooking();
    } else if (checked === '2') {
      handleCancelBooking();
    }
  };

  const EstateView = () => {
    return (
      <View style={styles.estateView}>
        <View style={styles.estateContent}>
          <Image
            source={{uri: estate.images[0]}}
            style={styles.estateImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{estate.name}</Text>

            <View style={styles.ratingView}>
              <FontAwesome6
                name="location-dot"
                color={'#234F68'}
                size={9}
              />
              <Text style={styles.location}>
                {estate.address.road}, {estate.address.city},{' '}
                {estate.address.country}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const PaymentDetail = () => {
    return (
      <View style={styles.transactionView}>
        <Text style={styles.transactionText}>{t('booking_details')}</Text>
        <View style={styles.payDetail}>
          <View style={styles.tranView}>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('check_in')}</Text>
              <Text style={styles.tranText}>{startDate}</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('check_out')}</Text>
              <Text style={styles.tranText}>{endDate}</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('period_time')}</Text>
              <Text style={styles.tranText}>{totalDate} Days</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('note_customer')}</Text>
              <Text style={styles.tranText}>{transaction.notes}</Text>
            </View>
          </View>
        </View>
        <View style={styles.payView}>
          <View style={styles.payContent}>
            <Text style={styles.payText}>{t('total')}</Text>
            <Text style={styles.payText}>$ {sumPrice}</Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.component}>
      <BackButton />
      <View style={styles.titleView}>
        <Text style={styles.transactionTitle}>{t('booking_details')}</Text>
      </View>
      <ScrollView>
        <EstateView />
        <PaymentDetail />
        <View style={styles.transactionView}>
          <Text style={styles.transactionText}>{t('payment_method')}</Text>
          <View style={styles.tranDetail}>
            <Text style={styles.methodText}>{t('direct_transaction')}</Text>
          </View>
        </View>
        <RadioButton.Group
          onValueChange={(newValue) => setChecked(newValue)}
          value={checked}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.radioView}
            onPress={() => {
              setChecked('1');
            }}
          >
            <RadioButton
              value="1"
              color="#8BC83F"
              disabled={checked === '1' ? false : true}
            />
            <Text
              style={{
                color: checked === '1' ? '#8BC83F' : '#53587A',
                opacity: checked === '1' ? 1 : 0.7,
              }}
            >
              Chấp nhận
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.radioView, {marginBottom: 24}]}
            onPress={() => {
              setChecked('2');
            }}
          >
            <RadioButton
              value="2"
              color="#8BC83F"
            />
            <Text
              style={{
                color: checked === '2' ? '#8BC83F' : '#53587A',
                opacity: checked === '2' ? 1 : 0.7,
              }}
            >
              Hủy
            </Text>
          </TouchableOpacity>
        </RadioButton.Group>

        <TouchableOpacity
          style={styles.btnReview}
          onPress={handleStatus}
        >
          <Text style={styles.textReview}>{t('Xác nhận')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ConfirmDetail;

const styles = StyleSheet.create({
  component: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  transactionTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
  },
  titleView: {
    alignItems: 'center',
  },
  estateView: {
    marginHorizontal: 24,
    marginTop: 35,
    borderRadius: 20,
    backgroundColor: '#F5F4F8',
  },
  estateContent: {
    marginVertical: 8,
    marginLeft: 8,
    flexDirection: 'row',
  },
  estateImage: {
    height: 140,
    width: screenWidth / 2 - 24,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cardContent: {
    width: screenWidth / 2 - 68,
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
  },

  location: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 2,
    fontSize: 12,
  },
  typeView: {
    width: 70,
    height: 47,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 8,
    right: 16,
    position: 'absolute',
  },
  typeText: {
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
  },
  transactionText: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
  },
  transactionView: {
    marginLeft: 24,
    marginTop: 35,
  },
  tranDetail: {
    width: screenWidth - 48,
    borderWidth: 1,
    borderColor: '#ECEDF3',
    borderRadius: 25,
    marginTop: 24,
  },
  tranView: {
    width: screenWidth - 80,
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 9,
  },
  tranContent: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  tranText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    marginTop: 15,
  },
  payDetail: {
    width: screenWidth - 48,
    borderWidth: 1,
    borderColor: '#ECEDF3',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: 24,
  },
  payView: {
    backgroundColor: '#F5F4F8',
    width: screenWidth - 48,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  payContent: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginVertical: 24,
    marginHorizontal: 16,
  },
  payText: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
  },
  payImages: {
    width: 20,
    height: 20,
  },
  methodView: {
    width: screenWidth - 80,
    marginLeft: 15,
    marginVertical: 15,
    flexDirection: 'row',
  },

  methodText: {
    color: '#53587A',
    marginLeft: 15,
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    marginVertical: 15,
  },
  btnReview: {
    width: screenWidth - 100,
    height: 70,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 50,
    marginTop: 11,
    marginBottom: 24,
  },
  btnCancel: {
    width: screenWidth - 100,
    height: 70,
    backgroundColor: '#F5F4F8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 50,
    marginTop: 35,
    marginBottom: 24,
  },
  textReview: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
  },
  txtCancel: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
  },
  radioView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 5,
  },
});
