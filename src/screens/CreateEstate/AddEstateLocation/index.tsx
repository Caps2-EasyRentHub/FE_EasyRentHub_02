import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import BackButton from '@/components/BackButton';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import {Pin_Location} from '@/assets/Svg';
import {push} from '@/navigation/NavigationUtils';

const AddEstateLocation = ({route}: any) => {
  const {data} = route.params;

  const {t} = useTranslation();
  const [search, setSearch] = useState('');
  const [address, setAddress] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadLocation, setLoadLocation] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [road, setRoad] = useState('');
  const [quarter, setQuarter] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [changeLocation, setChangeLocation] = useState({
    latitude: 16.055061228490178,
    longitude: 108.20310270503711,
  });

  useEffect(() => {
    setIsLoading(false);
    setLoadLocation(true);
    setTimeout(() => {
      getLocation();
      setLoadLocation(false);
    }, 0);
  }, [search]);

  const getLocation = async () => {
    if (search) {
      const URL = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&q=${search}`;
      try {
        const response = await axios.get(URL);
        const address = response.data;
        setAddress(address);
      } catch (error) {
        console.error('Lỗi:', error);
      }
    }
  };
  const handleChangeLocation = (item: any) => {
    setDisplayName(item.display_name);
    const addressComponents = item.display_name.split(',');
    if (item.display_name.startsWith('K')) {
      setRoad(addressComponents[0].trim());
      setChangeLocation({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
      setQuarter(addressComponents[1].trim());
      setCity(addressComponents[addressComponents.length - 3].trim());
      setCountry(addressComponents[addressComponents.length - 1].trim());
    } else {
      setRoad(addressComponents[0].trim() + ' ' + addressComponents[1].trim());
      setChangeLocation({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
      setQuarter(addressComponents[2].trim());
      setCity(addressComponents[addressComponents.length - 3].trim());
      setCountry(addressComponents[addressComponents.length - 1].trim());
    }
  };

  return isLoading ? (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#8BC83F"
      />
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.borderRadiusMap}>
        <MapView
          style={styles.map}
          region={{
            latitude: changeLocation.latitude,
            longitude: changeLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {changeLocation.latitude !== 0 && (
            <Marker
              coordinate={changeLocation}
              title={road}
            >
              <View style={{top: 9, position: 'absolute'}}>
                <Pin_Location />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <View style={styles.view2}>
        <BackButton />
        <View style={{position: 'absolute', zIndex: 1, top: 89}}>
          <View style={styles.icon}>
            <Feather
              name="search"
              size={20}
              color={'#252B5C'}
            />
          </View>
          <TextInput
            placeholder="Find location"
            style={[
              styles.input,
              {fontFamily: search ? 'Lato-Bold' : 'Lato-Regular'},
            ]}
            placeholderTextColor={'#A1A5C1'}
            onChangeText={(text) => setSearch(text)}
            value={search}
          />
        </View>
        {road && (
          <View style={styles.locView}>
            <Text style={styles.addressTitle}>Location detail</Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 15,
                marginBottom: 20,
                marginHorizontal: 15,
                alignItems: 'center',
              }}
            >
              <View style={styles.iconLocView}>
                <Octicons
                  name="location"
                  color={'#53587A'}
                  size={14}
                />
              </View>
              <Text style={styles.addressText}>{displayName}</Text>
            </View>
          </View>
        )}

        {road && (
          <TouchableOpacity
            style={styles.chooseLocBtn}
            activeOpacity={0.8}
            onPress={() =>
              push({
                name: 'AddEstateImages',
                params: {
                  data: {
                    name: data.name,
                    listType: data.listType,
                    address: {
                      road,
                      quarter,
                      city,
                      country,
                      lat: changeLocation.latitude,
                      lng: changeLocation.longitude,
                    },
                  },
                },
              })
            }
          >
            <Text style={styles.btnNext}>{t('next')}</Text>
          </TouchableOpacity>
        )}

        {search && (
          <View style={styles.viewSearch}>
            <Text style={styles.titleSearch}>{t('location')}</Text>
            <ScrollView>
              {loadLocation ? (
                <View
                  style={{
                    width: screenWidth - 78,
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color="#8BC83F"
                  />
                </View>
              ) : (
                address &&
                address?.map((item: any, index: any) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => handleChangeLocation(item)}
                  >
                    <View style={styles.iconLocation}>
                      <Octicons
                        name="location"
                        color={'#53587A'}
                        size={8}
                      />
                    </View>
                    <Text style={styles.txtLocation}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

export default AddEstateLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  borderRadiusMap: {
    borderRadius: 25,
    width: screenWidth - 24,
    height: screenHeight - 24,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerImage: {
    width: 32.32,
    height: 32.71,
    borderRadius: 100,
    position: 'absolute',
    top: 4,
    left: 4,
  },
  icon: {
    position: 'absolute',
    top: 25,
    left: 40,
    zIndex: 2,
  },
  input: {
    color: '#252B5C',
    fontSize: 15,
    height: 70,
    width: screenWidth - 48,
    marginHorizontal: 24,
    paddingHorizontal: 46,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  activeInput: {
    backgroundColor: '#234F68',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    opacity: 0.67,
  },
  view2: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
  },
  locView: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    width: screenWidth - 48,
    marginLeft: 24,
    position: 'absolute',
    top: screenHeight - 238,
  },
  chooseLocBtn: {
    position: 'absolute',
    top: screenHeight - 95,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 45,
    width: screenWidth - 90,
    height: 65,
    backgroundColor: '#8BC83F',
  },
  addressTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    marginLeft: 15,
    marginTop: 20,
  },
  addressText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    width: screenWidth - 128,
    marginLeft: 15,
  },
  iconLocView: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECEDF3',
    borderRadius: 50,
  },
  iconLocation: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECEDF3',
    borderRadius: 50,
    marginRight: 10,
  },
  viewSearch: {
    marginTop: 180,
    maxHeight: 200,
    width: screenWidth - 48,
    marginHorizontal: 24,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  titleSearch: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    marginVertical: 20,
  },
  txtLocation: {
    color: '#53587A',
    fontSize: 16,
    marginBottom: 15,
    width: screenWidth - 100,
  },
  btnNext: {
    fontFamily: 'Lato-Bold',
    color: '#FFF',
    fontSize: 16,
  },
});
