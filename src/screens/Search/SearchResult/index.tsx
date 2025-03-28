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
import {getImages} from '@/assets/Images';
import {push} from '@/navigation/NavigationUtils';
import FavoriteButton from '@/components/FavoriteButton';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import Slider from '@react-native-community/slider';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {EstateItems} from '@/utils/interface';
import Splash from '@/components/Splash';

const SearchResult = ({route}: any) => {
  const {result} = route.params;
  const {t} = useTranslation();
  const [search, setSearch] = useState(result);
  const [location, setLocation] = useState('');
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState<EstateItems[]>([]);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    setLoad(true);
    fetch(`${Config.API_URL}/api/searchEstates?name=${search}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.estates);
      })
      .finally(() => setLoad(false));
  }, [search]);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['50%'], []);

  const handleOpenPress = () => bottomSheetRef.current?.expand();
  const handleClosePress = () => bottomSheetRef.current?.close();

  const RenderItems = ({item}: {item: EstateItems}) => {
    return (
      item.status === 1 && (
        <View style={styles.cardItem}>
          <View style={styles.btnFavorite}>
            {/* <FavoriteButton favorite={item.assets.favorite} /> */}
          </View>

          <View style={styles.priceView}>
            <View style={styles.priceContent}>
              <Text style={styles.price}>$ </Text>
              <Text style={styles.price}>{item.price.rent}</Text>
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
                  {item.address.road}, {item.address.city},{' '}
                  {item.address.country}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
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
          placeholder="Search House, Apartment, etc"
          style={[
            styles.input,
            {fontFamily: search ? 'Lato-Bold' : 'Lato-Regular'},
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => setSearch(text)}
          value={search}
        />
        <View style={styles.icon}>
          <Feather
            name="search"
            size={20}
            color={'#252B5C'}
          />
        </View>
      </View>
      <View style={styles.viewFound}>
        <Text style={styles.textFound}>Found</Text>
        <Text style={styles.numFound}> {data.length} </Text>
        <Text style={styles.textFound}>estates</Text>
      </View>
      {load ? (
        <Splash />
      ) : data.length === 0 ? (
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
          <TouchableOpacity style={styles.btnReset}>
            <Text style={styles.txtReset}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.txtLocation}>{t('price')}</Text>

        <Slider
          style={{width: 200, height: 40}}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text style={styles.txtLocation}>{t('location')}</Text>
        <View>
          <TextInput
            placeholder="Address filtering"
            style={[
              styles.input,
              {fontFamily: search ? 'Lato-Bold' : 'Lato-Regular'},
            ]}
            placeholderTextColor={'#A1A5C1'}
            onChangeText={(text) => setLocation(text)}
            value={location}
          />
          <View style={styles.icon}>
            <Feather
              name="search"
              size={20}
              color={'#252B5C'}
            />
          </View>
        </View>
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
    // width: 75,
    // height: 25,
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
  },
  txtFilter: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
  },
  btnReset: {
    paddingVertical: 19,
    paddingHorizontal: 30,
    borderRadius: 35,
    backgroundColor: '#1F4C6B',
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
});
