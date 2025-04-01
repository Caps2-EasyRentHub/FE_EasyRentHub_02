import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  FunctionComponent,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import BackButton from '../../../../../components/BackButton';
import FavoriteButton from '../../../../../components/FavoriteButton';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {screenWidth} from '@/themes/Responsive';
import {navigate, push} from '@/navigation/NavigationUtils';
import {RouteTransaction} from '@/utils/interface';
import moment from 'moment';
import {AuthContext} from '@/context/AuthContext';
import axios from 'axios';
import {Config} from '@/config';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {Error, Success} from '@/assets/Svg';

const TransactionDetail: React.FC<RouteTransaction> = ({route}) => {
  const {transaction, estate} = route.params;
  const {t} = useTranslation();
  const fromDate = moment(transaction.checkIn, 'DD/MM/YYYY');
  const toDate = moment(transaction.checkOut, 'DD/MM/YYYY');
  const totalDate = toDate.diff(fromDate, 'days');
  const [checked, setChecked] = useState(transaction.status);
  const {userToken} = useContext(AuthContext);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const handleStatus = () => {
    axios
      .patch(
        `${Config.API_URL}/api/payment/${transaction._id}`,
        {
          status: '3',
        },
        {
          headers: {Authorization: userToken},
        },
      )
      .then((res) => setChecked('3'))
      .catch((e) => {
        console.log(e);
      });
  };

  const handleClosePress = () => bottomSheetRef.current?.close();

  const EstateView = () => {
    return (
      <View style={styles.estateView}>
        <View style={styles.estateContent}>
          {/* <FavoriteButton favorite={transaction.assets.favorite} /> */}
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
          <View style={styles.typeView}>
            <Text style={styles.typeText}>{transaction.type}</Text>
          </View>
        </View>
      </View>
    );
  };

  const TransactionDetail = () => {
    return (
      <View style={styles.transactionView}>
        <Text style={styles.transactionText}>{t('transaction_detail')}</Text>
        <View style={styles.tranDetail}>
          <View style={styles.tranView}>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('check_in')}</Text>
              <Text style={styles.tranText}>{transaction.checkIn}</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('check_out')}</Text>
              <Text style={styles.tranText}>{transaction.checkOut}</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('owner_name')}</Text>
              <Text style={styles.tranText}>{transaction.user.full_name}</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('transaction_type')}</Text>
              <Text style={styles.tranText}>{transaction.type}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const PaymentDetail = () => {
    return (
      <View style={styles.transactionView}>
        <Text style={styles.transactionText}>{t('payment_detail')}</Text>
        <View style={styles.payDetail}>
          <View style={styles.tranView}>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('period_time')}</Text>
              <Text style={styles.tranText}>{totalDate} Days</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('monthly_payment')}</Text>
              <Text style={styles.tranText}>{transaction.checkOut}</Text>
            </View>
            <View style={styles.tranContent}>
              <Text style={styles.tranText}>{t('discount')}</Text>
              <Text style={styles.tranText}>-$ {transaction.discount}</Text>
            </View>
          </View>
        </View>
        <View style={styles.payView}>
          <View style={styles.payContent}>
            <Text style={styles.payText}>{t('total')}</Text>
            <Text style={styles.payText}>$ {transaction.price}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.component}>
      <BackButton />
      <View style={styles.titleView}>
        <Text style={styles.transactionTitle}>{t('transaction_detail')}</Text>
      </View>
      <ScrollView>
        <EstateView />
        <TransactionDetail />
        <PaymentDetail />
        <View style={styles.transactionView}>
          <Text style={styles.transactionText}>{t('payment_method')}</Text>
          <View style={styles.tranDetail}>
            <Text style={styles.methodText}>{t('direct_transaction')}</Text>
          </View>
        </View>
        {(checked === '1' || checked === '2') && (
          <TouchableOpacity
            style={[styles.btnCancel, {backgroundColor: '#fc4b6c'}]}
            onPress={() => bottomSheetRef.current?.expand()}
          >
            <Text style={styles.textReview}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
        {checked === '3' && (
          <TouchableOpacity
            style={styles.btnCancel}
            activeOpacity={1}
          >
            <Text style={styles.txtCancel}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
        {checked === '4' && (
          <TouchableOpacity
            style={styles.btnReview}
            onPress={() => push({name: 'AddReview', params: {id: estate._id}})}
          >
            <Text style={styles.textReview}>{t('add_review')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <View style={styles.contentContainer}>
          <Error />
          <Text style={[styles.titleNormal, {marginTop: 24}]}>
            You definitely
          </Text>
          <Text style={styles.titleHighlight}>want to cancel the room</Text>
          <View style={styles.btnModalGroup}>
            <TouchableOpacity
              style={styles.btnAddMoreModal}
              onPress={handleClosePress}
            >
              <Text style={styles.txtAddMoreModal}>{t('close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnRetryModal}>
              <Text
                style={styles.txtFinishModal}
                onPress={handleStatus}
              >
                {t('confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};

export default TransactionDetail;

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
    marginTop: 35,
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
  contentContainer: {
    alignItems: 'center',
    flex: 1,
  },
  titleNormal: {
    fontFamily: 'Lato-Regular',
    color: '#000000',
    fontSize: 30,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#204D6C',
    fontSize: 30,
  },
  btnModalGroup: {
    flexDirection: 'row',
    bottom: 24,
    position: 'absolute',
  },
  btnFinishModal: {
    width: screenWidth - 29,
    height: 70,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtFinishModal: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
  },
  btnAddMoreModal: {
    width: screenWidth / 2 - 29,
    height: 70,
    backgroundColor: '#F5F4F8',
    borderRadius: 10,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRetryModal: {
    width: screenWidth / 2 - 29,
    height: 70,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtAddMoreModal: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
  },
});
