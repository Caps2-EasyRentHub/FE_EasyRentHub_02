import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState, useCallback, useMemo, useRef, useContext, useEffect} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Error, Minus, Plus, Success} from '@/assets/Svg';
import {navigate, push} from '@/navigation/NavigationUtils';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import Loading from '@/components/Loading';
import axios from 'axios';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {useSubscription} from '@/context/SubscriptionContext';
import {useNavigation} from '@react-navigation/native';

const AddEstateInfo = ({route}: any) => {
  const {data} = route.params;
  const {userToken} = useContext(AuthContext);
  const {refreshSubscription} = useSubscription();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [active, setActive] = useState(true);
  const [sell, setSell] = useState(0);
  const [rent, setRent] = useState(0);
  const [bedroom, setBedroom] = useState<number>(1);
  const [bathroom, setBathroom] = useState<number>(1);
  const [floors, setFloors] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [priceRecommendation, setPriceRecommendation] = useState(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const handleCreateEstate = async () => {
    setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Authorization', userToken);

      const raw = JSON.stringify({
        name: data.name,
        images: data.images,
        address: {
          house_number: data.house_number,
          road: data.address.road,
          quarter: data.address.quarter,
          city: data.address.city,
          country: data.address.country,
          lat: data.address.lat,
          lng: data.address.lng,
        },
        price: price,
        property: {
          bedroom: bedroom,
          bathroom: bathroom,
          floors: floors,
        },
        status: 'available',
      });

      const response = await fetch(`${Config.API_URL}/api/estates`, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      });

      const result = await response.json();

      if (response.ok && result) {
        try {
          const usageResponse = await fetch(`${Config.API_URL}/api/payment/record-usage-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': userToken
            }
          });
          
          if (usageResponse.ok) {
            setIsRefreshing(true);
            await refreshSubscription();
            setIsRefreshing(false);
          }
        } catch (usageError) {
          console.error('Failed to record usage:', usageError);
        }
        
        bottomSheetRef.current?.snapToIndex(0);
        setSuccess(true);
      } else {
        Alert.alert(
          t('error'),
          result.message || t('something_went_wrong'),
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleClosePress = useCallback(() => {
    if (success) {
      navigation.navigate('CreateEstate');
    } else {
      bottomSheetRef.current?.close();
    }
  }, [success, navigation]);

  const fetchPriceRecommendation = async () => {
    try {
      console.log('data', data);
      if (!data?.address?.lat || !data?.address?.lng || !data?.address?.city) {
        setPriceRecommendation({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin địa chỉ để sử dụng tính năng gợi ý giá'
        });
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", userToken);

      const raw = JSON.stringify({
        userLocation: {
          lat: data.address.lat,
          lng: data.address.lng,
          city: data.address.city
        },
        propertyFeatures: {
          bedroom: bedroom,
          bathroom: bathroom,
          floors: floors
        }
      });

      const response = await fetch(`${Config.API_URL}/api/price-recommendation-by-location`, {
        method: "POST",
        headers: myHeaders,
        body: raw,
      });

      const result = await response.json();
      setPriceRecommendation(result);
    } catch (error) {
      console.error('Error fetching price recommendation:', error);
      setPriceRecommendation({
        success: false,
        message: 'Đã có lỗi xảy ra khi lấy thông tin gợi ý giá'
      });
    }
  };

  useEffect(() => {
    fetchPriceRecommendation();
  }, [bedroom, bathroom, floors]);

  return (
    <View style={styles.component}>
      {loading && <Loading />}
      <View style={{zIndex: loading ? 0 : 1}}>
        <BackButton />
      </View>
      <ScrollView>
        <View style={styles.pageTitle}>
          <Text style={styles.addList}>{t('add_listing')}</Text>
        </View>
        <View style={styles.circle} />
        <View style={styles.titleView}>
          <Text style={styles.titleHighlight}>{t('almost_finish')}</Text>
          <Text style={styles.titleNormal}>{t('complete_listing')}</Text>
        </View>
        <View style={styles.propertyView}>
          <Text style={styles.sellTitle}>{t('property')}</Text>
          <View style={styles.propertyFrom}>
            <View style={styles.proTxtView}>
              <Text style={styles.propertyText}>{t('bedroom')}</Text>
            </View>
            <View style={styles.quantity}>
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => {
                  if (bedroom > 0) {
                    setBedroom(bedroom - 1);
                  }
                }}
              >
                <Minus />
              </TouchableOpacity>
              <Text style={styles.qtyBedroom}>{bedroom}</Text>
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => setBedroom(bedroom + 1)}
              >
                <Plus />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.propertyFrom}>
            <View style={styles.proTxtView}>
              <Text style={styles.propertyText}>{t('bathroom')}</Text>
            </View>
            <View style={styles.quantity}>
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => {
                  if (bathroom > 0) {
                    setBathroom(bathroom - 1);
                  }
                }}
              >
                <Minus />
              </TouchableOpacity>
              <Text style={styles.qtyBedroom}>{bathroom}</Text>
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => setBathroom(bathroom + 1)}
              >
                <Plus />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.propertyFrom}>
            <View style={styles.proTxtView}>
              <Text style={styles.propertyText}>{t('floors')}</Text>
            </View>
            <View style={styles.quantity}>
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => {
                  if (floors > 0) {
                    setFloors(floors - 1);
                  }
                }}
              >
                <Minus />
              </TouchableOpacity>
              <Text style={styles.qtyBedroom}>{floors}</Text>
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => setFloors(floors + 1)}
              >
                <Plus />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View>
          <Text style={styles.inputTitle}>{t('price')}</Text>
          <View>
            <TextInput
              style={styles.sellInput}
              keyboardType="numeric"
              onChangeText={(value) => {
                if (value === '') {
                  setPrice(null);
                } else {
                  const parsedValue = parseFloat(value);
                  setPrice(isNaN(parsedValue) ? null : parsedValue);
                }
              }}
              placeholder="Nhập giá"
            />
            <View style={styles.dollarIcon}>
              <FontAwesome
                name="dollar"
                color={'#252B5C'}
                size={16}
              />
            </View>
          </View>
        </View>
        {priceRecommendation && (
          <View style={styles.recommendationContainer}>
            <Text style={styles.recommendationTitle}>{t('Đề xuất giá')}</Text>
            {priceRecommendation.success ? (
              <>
                <Text style={styles.recommendationText}>
                  {priceRecommendation.explanation}
                </Text>
                <View style={styles.priceRangeContainer}>
                  <Text style={styles.priceRangeText}>
                    {`${(priceRecommendation.recommendedPriceRange.min / 1000000).toFixed(1)} - ${(priceRecommendation.recommendedPriceRange.max / 1000000).toFixed(1)} triệu`}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[styles.recommendationText, styles.errorText]}>
                {priceRecommendation.message}
              </Text>
            )}
          </View>
        )}
        <TouchableOpacity
          style={styles.btnFinish}
          activeOpacity={0.8}
          onPress={handleCreateEstate}
        >
          <Text style={styles.txtFinish}>{t('finish')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClosePress}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        {success ? (
          <View style={styles.contentContainer}>
            <Success />
            <Text style={[styles.titleNormal, {marginTop: 24}]}>
              {t('listing_now')}
            </Text>
            <Text style={styles.titleHighlight}>{t('published')}</Text>
            <View style={styles.btnModalGroup}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => {
                  bottomSheetRef.current?.close();
                  push({name: 'HomeScreen'});
                }}
              >
                <Text style={styles.txtCancel}>{t('Về trang chủ')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDone}
                onPress={() => {
                  bottomSheetRef.current?.close();
                  push({name: 'CreateEstate'});
                }}
              >
                <Text style={styles.txtDone}>{t('Thêm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Error />
            <Text style={[styles.titleNormal, {marginTop: 24}]}>
              {t('something_went_wrong')}
            </Text>
            <Text style={styles.titleHighlight}>{t('try_again')}</Text>
            <TouchableOpacity
              style={[styles.btnReview, {marginTop: 50}]}
              onPress={() => {
                bottomSheetRef.current?.close();
              }}
            >
              <Text style={styles.textReview}>{t('try_again')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

export default AddEstateInfo;

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
  },
  pageTitle: {
    alignItems: 'center',
  },
  addList: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
  },
  circle: {
    height: 280,
    width: 313,
    borderRadius: 500,
    backgroundColor: 'rgba(31,76,107,.3)',
    position: 'absolute',
    top: -58,
    left: -130,
  },
  titleView: {
    flexDirection: 'row',
    marginTop: 35,
    marginBottom: 20,
    marginHorizontal: 24,
    flexWrap: 'wrap',
  },
  titleNormal: {
    fontFamily: 'Lato-Medium',
    color: '#000000',
    fontSize: 30,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 30,
  },
  sellTitle: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 20,
    marginLeft: 24,
  },
  sellInput: {
    width: screenWidth - 48,
    height: 70,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    marginTop: 10,
    borderRadius: 25,
    paddingLeft: 16,
    color: '#252B5C',
  },
  dollarIcon: {
    position: 'absolute',
    right: 40,
    top: 45,
  },
  rentTitle: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 20,
    marginLeft: 24,
    marginTop: 35,
  },
  rentInput: {
    width: screenWidth - 48,
    height: 70,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    marginTop: 20,
    borderRadius: 25,
    paddingLeft: 16,
    color: '#252B5C',
  },
  btnNormal: {
    backgroundColor: '#F5F4F8',
    borderRadius: 20,
    paddingVertical: 17.5,
    paddingHorizontal: 24,
    marginRight: 10,
  },
  btnText: {
    fontFamily: 'Lato-Medium',
    color: '#252B5C',
  },
  btnView: {
    flexDirection: 'row',
    marginLeft: 24,
    marginTop: 20,
  },
  propertyView: {
    marginTop: 40,
    marginBottom: 20,
  },
  propertyFrom: {
    width: screenWidth - 48,
    height: 70,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    marginTop: 20,
    borderRadius: 25,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  proTxtView: {
    justifyContent: 'center',
    marginLeft: 16,
  },
  propertyText: {
    color: '#252B5C',
    fontSize: 14,
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  qtyBedroom: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 16,
    marginHorizontal: 18,
  },

  btnQty: {
    backgroundColor: '#A1A5C1',
    paddingTop: 10.26,
    paddingLeft: 10.26,
    paddingBottom: 9.47,
    paddingRight: 9.47,
    borderRadius: 9,
  },
  btnQtyText: {
    fontFamily: 'Lato-Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  btnFinish: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 75,
    marginBottom: 24,
    width: screenWidth - 150,
    height: 65,
    backgroundColor: '#8BC83F',
  },
  txtFinish: {
    fontFamily: 'Lato-Bold',
    color: '#FFF',
    fontSize: 16,
  },
  btnModalGroup: {
    flexDirection: 'row',
    bottom: 24,
    position: 'absolute',
  },
  btnCancel: {
    width: screenWidth / 2 - 29,
    height: 70,
    backgroundColor: '#F5F4F8',
    borderRadius: 10,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDone: {
    width: screenWidth / 2 - 29,
    height: 70,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtCancel: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
  },
  txtDone: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
  },
  btnReview: {
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    paddingVertical: 17.5,
    paddingHorizontal: 24,
    marginLeft: 75,
    marginTop: 50,
    width: screenWidth - 150,
    height: 65,
  },
  textReview: {
    fontFamily: 'Lato-Bold',
    color: '#FFF',
    fontSize: 16,
  },
  inputTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginLeft: 26,
  },
  recommendationContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#F5F4F8',
    borderRadius: 10,
  },
  recommendationTitle: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 18,
    marginBottom: 10,
  },
  recommendationText: {
    fontFamily: 'Lato-Medium',
    color: '#252B5C',
    fontSize: 16,
  },
  priceRangeContainer: {
    marginTop: 10,
  },
  priceRangeText: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
  },
});
