import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState, useCallback, useMemo, useRef, useContext} from 'react';
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

const AddEstateInfo = ({route}: any) => {
  const {data} = route.params;
  const {userToken} = useContext(AuthContext);
  const {t} = useTranslation();

  const [active, setActive] = useState(true);
  const [sell, setSell] = useState(0);
  const [rent, setRent] = useState(0);
  const [bedroom, setBedroom] = useState<number>(1);
  const [bathroom, setBathroom] = useState<number>(1);
  const [floors, setFloors] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch(`${Config.API_URL}/api/estates`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          setLoading(false);
          if (result) {
            bottomSheetRef.current?.snapToIndex(0);
            setSuccess(true);
          } else {
            Alert.alert(
              t('error'),
              result.message || t('something_went_wrong'),
            );
          }
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          Alert.alert(t('error'), t('something_went_wrong'));
        });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };
  const handleClosePress = () => bottomSheetRef.current?.close();

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
              <TouchableOpacity style={styles.btnAddMoreModal}>
                <Text
                  style={styles.txtAddMoreModal}
                  onPress={() => navigate({name: 'CreateEstate'})}
                >
                  {t('add_more')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnFinishModal}
                onPress={() => navigate({name: 'Profile'})}
              >
                <Text style={styles.txtFinishModal}>{t('finish')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Error />
            <Text style={[styles.titleNormal, {marginTop: 24}]}>
              {t('aw_snap')}
            </Text>
            <Text style={styles.titleHighlight}>{t('error')}</Text>
            <View style={styles.btnModalGroup}>
              <TouchableOpacity
                style={styles.btnAddMoreModal}
                onPress={handleClosePress}
              >
                <Text style={styles.txtAddMoreModal}>{t('close')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnFinishModal}>
                <Text
                  style={styles.txtFinishModal}
                  onPress={handleCreateEstate}
                >
                  {t('retry')}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginTop: 20,
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
  btnAddMoreModal: {
    width: screenWidth / 2 - 29,
    height: 70,
    backgroundColor: '#F5F4F8',
    borderRadius: 10,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnFinishModal: {
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
  txtFinishModal: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
  },
});
