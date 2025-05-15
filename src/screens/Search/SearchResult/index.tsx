import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenWidth} from '@/themes/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import {Error, Filter} from '@/assets/Svg';
import {push} from '@/navigation/NavigationUtils';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import Slider from '@react-native-community/slider';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {EstateItems} from '@/utils/interface';
import Splash from '@/components/Splash';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const SearchResult = ({route}: any) => {
  const {lat, lng, address} = route.params;
  const {t} = useTranslation();
  const [search, setSearch] = useState(address || '');
  const {userToken} = useContext(AuthContext);
  const [data, setData] = useState<EstateItems[]>([]);
  const [originalData, setOriginalData] = useState<EstateItems[]>([]);
  const [load, setLoad] = useState(true);

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 10000000,
  });
  const [currentPriceRange, setCurrentPriceRange] = useState([0, 10000000]);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [floors, setFloors] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);

  const handleAddressSearch = async (searchAddress: string) => {
    if (!searchAddress) {
      try {
        const response = await fetch(
          `${Config.API_URL}/api/recommend?lat=${lat}&lng=${lng}`,
          {
            method: 'GET',
            headers: {Authorization: userToken},
          },
        );
        const res = await response.json();
        if (!res.estates) {
          setData([]);
          setOriginalData([]);
        } else {
          setData(res.estates);
          setOriginalData(res.estates);
        }
      } catch (error) {
        console.error('Error fetching estates:', error);
        setData([]);
        setOriginalData([]);
      } finally {
        setLoad(false);
      }
      return;
    }

    setLoad(true);
    try {
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress,
        )}`,
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData && geocodeData.length > 0) {
        const newLat = geocodeData[0].lat;
        const newLng = geocodeData[0].lon;

        const response = await fetch(
          `${Config.API_URL}/api/recommend?lat=${newLat}&lng=${newLng}`,
          {
            method: 'GET',
            headers: {Authorization: userToken},
          },
        );
        const res = await response.json();
        if (!res.estates) {
          setData([]);
          setOriginalData([]);
        } else {
          setData(res.estates);
          setOriginalData(res.estates);
        }
      } else {
        console.warn('No coordinates found for this address');
        setData([]);
        setOriginalData([]);
      }
    } catch (error) {
      console.error('Error searching address:', error);
      setData([]);
      setOriginalData([]);
    } finally {
      setLoad(false);
    }
  };

  const handleFilter = () => {
    setLoad(true);
    const filteredData = originalData.filter((item: EstateItems) => {
      const priceInRange =
        item.price >= currentPriceRange[0] &&
        item.price <= currentPriceRange[1];

      const bedroomMatch = bedrooms === 0 || item.property.bedroom === bedrooms;
      const bathroomMatch =
        bathrooms === 0 || item.property.bathroom === bathrooms;
      const floorMatch = floors === 0 || item.property.floors === floors;

      return priceInRange && bedroomMatch && bathroomMatch && floorMatch;
    });

    setData(filteredData);
    setLoad(false);
    handleClosePress();
  };

  const handleResetFilter = () => {
    setCurrentPriceRange([0, 10000000]);
    setBedrooms(0);
    setBathrooms(0);
    setFloors(0);
    setData(originalData);
    handleClosePress();
  };

  useEffect(() => {
    handleAddressSearch('');
  }, [lat, lng]);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['75%'], []);

  const handleOpenPress = () => bottomSheetRef.current?.expand();
  const handleClosePress = () => bottomSheetRef.current?.close();

  const RenderItems = ({item}: {item: EstateItems}) => {
    return (
      <View style={styles.cardItem}>
        <View style={styles.priceView}>
          <View style={styles.priceContent}>
            <Text style={styles.price}>$ </Text>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.stay}> /</Text>
            <Text style={styles.stay}>month</Text>
          </View>
        </View>

        <Image
          source={{uri: item.images[0]}}
          style={styles.images}
        />

        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            push({name: 'EstateDetail', params: {id: item._id, nearby: true}})
          }
        >
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.ratingView}>
              <Entypo
                name="star"
                color={'#FFC42D'}
                size={10}
              />
              <Text style={styles.rating}>3</Text>
            </View>
            <View style={styles.locationView}>
              <FontAwesome6
                name="location-dot"
                color={'#234F68'}
                size={9}
              />
              <Text style={styles.location}>
                {item.address.road}, {item.address.city}, {item.address.country}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.component}>
      <View style={{zIndex: 0}}>
        <BackButton />
      </View>

      <View style={styles.titleView}>
        <Text style={styles.transactionTitle}>{t('search_results')}</Text>
      </View>
      <TouchableOpacity
        style={styles.btnFilter}
        onPress={handleOpenPress}
        activeOpacity={0.6}
      >
        <Filter />
      </TouchableOpacity>
      <View>
        <TextInput
          placeholder="Nhập địa chỉ để tìm phòng trọ gần đó..."
          style={[
            styles.input,
            {fontFamily: search ? 'Lato-Bold' : 'Lato-Regular'},
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={setSearch}
          onSubmitEditing={() => handleAddressSearch(search)}
          value={search}
          clearButtonMode="while-editing"
          editable={true}
          selectTextOnFocus={true}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.icon}
          onPress={() => handleAddressSearch(search)}
        >
          <Feather
            name="search"
            size={20}
            color={'#252B5C'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.viewFound}>
        <Text style={styles.textFound}>Kết quả</Text>
        <Text style={styles.numFound}> {data ? data.length : 0} </Text>
      </View>
      {load ? (
        <Splash />
      ) : !data || data.length === 0 ? (
        <View style={{marginTop: 124}}>
          <View style={styles.viewSearch}>
            <Error color={true} />
          </View>
          <View style={styles.viewResult}>
            <Text style={styles.titleNormal}>{t('search')}</Text>
            <Text style={styles.titleHighlight}> {t('not_found')}</Text>
          </View>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.viewRender}>
            {data.map((item: EstateItems, index: number) => {
              return (
                <RenderItems
                  item={item}
                  key={index}
                />
              );
            })}
          </View>
        </ScrollView>
      )}

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
        <View style={styles.titleBts}>
          <Text style={styles.txtFilter}>{t('filter')}</Text>
        </View>

        <ScrollView style={styles.filterScrollView}>
          <View style={styles.filterContainer}>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceHeader}>
                <Text style={styles.filterLabel}>Khoảng giá:</Text>
              </View>
              <View style={styles.priceValues}>
                <Text style={styles.priceValue}>
                  Từ: {currentPriceRange[0].toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.priceValue}>
                  Đến: {currentPriceRange[1].toLocaleString('vi-VN')}đ
                </Text>
              </View>
              <MultiSlider
                values={[currentPriceRange[0], currentPriceRange[1]]}
                min={0}
                max={10000000}
                step={100000}
                sliderLength={screenWidth - 80}
                onValuesChange={(values) => setCurrentPriceRange(values)}
                markerStyle={{
                  backgroundColor: '#234F68',
                  height: 20,
                  width: 20,
                }}
                selectedStyle={{
                  backgroundColor: '#234F68',
                }}
                trackStyle={{
                  height: 4,
                }}
              />
              <View style={styles.priceRange}>
                <Text style={styles.priceRangeText}>0đ</Text>
                <Text style={styles.priceRangeText}>10.000.000đ</Text>
              </View>
            </View>

            <Text style={styles.filterTitle}>{t('property')}</Text>
            <View style={styles.propertyFilters}>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>{t('bedrooms')}</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setBedrooms(Math.max(0, bedrooms - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{bedrooms}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setBedrooms(bedrooms + 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>{t('bathrooms')}</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setBathrooms(Math.max(0, bathrooms - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{bathrooms}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setBathrooms(bathrooms + 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>{t('floors')}</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setFloors(Math.max(0, floors - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{floors}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setFloors(floors + 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleFilter}
            >
              <Text style={styles.applyButtonText}>{t('Đặt lại')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

export default SearchResult;

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
  btnFilter: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    position: 'absolute',
    top: 24,
    right: 24,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
  },
  input: {
    color: '#252B5C',
    fontSize: 15,
    height: 70,
    width: screenWidth - 48,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    marginTop: 20,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
  },

  icon: {
    position: 'absolute',
    top: 45,
    right: 40,
    zIndex: 2,
  },
  viewFound: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 24,
  },
  textFound: {
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
    fontSize: 20,
  },
  numFound: {
    color: '#234F68',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
  },
  viewSearch: {
    alignItems: 'center',
  },
  viewResult: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  titleNormal: {
    fontFamily: 'Lato-Medium',
    color: '#252B5C',
    fontSize: 30,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#234F68',
    fontSize: 30,
  },
  btnFavorite: {
    position: 'absolute',
    right: 48,
    top: 8,
  },
  viewRender: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginLeft: 24,
  },
  cardItem: {
    width: screenWidth / 2 - 27.5,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    marginTop: 20,
    padding: 8,
    marginRight: 7,
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
    width: screenWidth / 2 - 99.5,
  },
  priceView: {
    top: 154,
    right: 16,
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(35,79,104,.69)',
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
    fontSize: 16,
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
  titleBts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E7',
  },
  txtFilter: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
  },
  btnReset: {
    paddingVertical: 19,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#8BC83F',
  },
  txtReset: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Lato-Medium',
  },
  txtLocation: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginLeft: 24,
    marginTop: 30,
  },
  filterScrollView: {
    flexGrow: 1,
  },
  filterContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  filterTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    marginBottom: 16,
  },
  priceRangeContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  priceHeader: {
    marginBottom: 8,
  },
  filterLabel: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
  },
  priceValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceValue: {
    color: '#234F68',
    fontFamily: 'Lato-Bold',
    fontSize: 14,
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceRangeText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  propertyFilters: {
    marginTop: 16,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#F5F4F8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    color: '#234F68',
    fontSize: 20,
    fontFamily: 'Lato-Bold',
  },
  counterText: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginHorizontal: 16,
  },
  applyButton: {
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
  },
});
