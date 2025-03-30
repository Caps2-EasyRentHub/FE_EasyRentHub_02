import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import BackButton from '@/components/BackButton';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import Geolocation from 'react-native-geolocation-service';
import {ButtonCenter, Marker_Icon} from '@/assets/Svg';
import {getImages} from '@/assets/Images';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import {goBack} from '@/navigation/NavigationUtils';

const Location = () => {
  const {t} = useTranslation();
  const {userToken, avatarUser, idUser, fullName} = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [road, setRoad] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState<any>([]);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>({
    latitude: parseFloat(lat as string) || 16.055061228490178,
    longitude: parseFloat(lng as string) || 108.20310270503711,
  });
  const [changeLocation, setChangeLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    fetch(`${Config.API_URL}/api/user/${idUser}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setLat(res.user.address.lat);
        setLng(res.user.address.lng);
        setRoad(res.user.address.road);
        setCity(res.user.address.city);
        setCountry(res.user.address.country);
      })
      .finally(() => setIsLoading(false));
  }, []);
  const handleChooseLocation = (lat: any, lng: any) => {
    console.log(lat, lng, road, city, country);

    const address = {
      lat,
      lng,
      road,
      city,
      country,
    };
    axios
      .patch(
        `${Config.API_URL}/api/user`,
        {
          address,
          avatar: avatarUser,
          full_name: fullName,
        },
        {headers: {Authorization: userToken}},
      )
      .catch((err) => {
        console.log(err);
      })
      .finally(() => goBack());
  };

  const getChooseLocation = async () => {
    const URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${changeLocation.latitude}&lon=${changeLocation.longitude}`;
    try {
      const response = await axios.get(URL);
      const road = response.data.address.road;
      const city = response.data.address.city;
      const country = response.data.address.country;
      setRoad(road), setCity(city), setCountry(country);
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const {latitude, longitude} = position.coords;
        const URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        try {
          const response = await axios.get(URL);
          const road = response.data.address.road;
          const city = response.data.address.city;
          const country = response.data.address.country;

          setRoad(road), setCity(city), setCountry(country);
        } catch (error) {
          console.error('Lỗi:', error);
        }
        setChangeLocation({latitude, longitude});

        setIsLoading(false);
      },
      (error) => {
        console.log('Error: ', error.message);
      },
      {enableHighAccuracy: false},
    );
  };

  useEffect(() => {
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
    getLocation();
  }, [search]);

  const handleChangeLocation = (item: any) => {
    const addressComponents = item.display_name.split(',');
    if (item.display_name.startsWith('K')) {
      setRoad(addressComponents[0].trim());
      setChangeLocation({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
      setCity(addressComponents[addressComponents.length - 3].trim());
      setCountry(addressComponents[addressComponents.length - 1].trim());
    } else {
      setRoad(addressComponents[0].trim() + ' ' + addressComponents[1].trim());
      setChangeLocation({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
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
    lat && lng && (
      <View style={styles.container}>
        <View style={styles.borderRadiusMap}>
          {currentLocation !== null && (
            <MapView
              style={styles.map}
              region={{
                latitude:
                  changeLocation.latitude !== 0
                    ? changeLocation?.latitude
                    : lat
                    ? parseFloat(lat)
                    : currentLocation.latitude,
                longitude:
                  changeLocation.longitude !== 0
                    ? changeLocation?.longitude
                    : lng
                    ? parseFloat(lng)
                    : currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onLongPress={(e) => {
                setChangeLocation({
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                });
              }}
              // onRegionChange={(e) => {
              //   setChangeLocation({
              //     latitude: e.latitude,
              //     longitude: e.longitude,
              //   });
              // }}
            >
              <Marker
                coordinate={{
                  latitude:
                    changeLocation.latitude !== 0
                      ? changeLocation.latitude
                      : parseFloat(lat as string),
                  longitude:
                    changeLocation.longitude !== 0
                      ? changeLocation.longitude
                      : parseFloat(lng as string),
                }}
                title={
                  road && city && country
                    ? `${road}, ${city}, ${country}`
                    : 'Unknown Location'
                }
              >
                <View style={{top: 9, position: 'absolute'}}>
                  <Marker_Icon />
                  <Image
                    source={{uri: avatarUser as string}}
                    style={styles.markerImage}
                  />
                </View>
              </Marker>
            </MapView>
          )}
        </View>
        {search && (
          <View style={styles.viewSearch}>
            <Text style={styles.titleSearch}>{t('location')}</Text>
            <ScrollView>
              {address &&
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
                ))}
            </ScrollView>
          </View>
        )}
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
          <TouchableOpacity
            style={styles.currentLocation}
            onPress={getCurrentLocation}
          >
            <ButtonCenter />
          </TouchableOpacity>
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
              <Text style={styles.addressText}>
                {road}, {city}, {country}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={styles.chooseLocBtn}
              activeOpacity={0.8}
              onPress={getChooseLocation}
            >
              <Text style={styles.locationTxtBtn}>{t('choose_location')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chooseLocBtn}
              activeOpacity={0.8}
              onPress={() =>
                handleChooseLocation(
                  changeLocation.latitude,
                  changeLocation.longitude,
                )
              }
            >
              <Text style={styles.locationTxtBtn}>{t('next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  );
};

export default Location;

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
    top: screenHeight - 95,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 20,
    left: 10,
    width: screenWidth / 2 - 40,
    height: 65,
    backgroundColor: '#8BC83F',
    zIndex: 10,
  },
  locationTxtBtn: {fontFamily: 'Lato-Bold', color: '#FFF', fontSize: 16},
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
  viewSearch: {
    top: 180,
    maxHeight: 200,
    width: screenWidth - 48,
    marginHorizontal: 24,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
    position: 'absolute',
  },
  titleSearch: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    marginVertical: 20,
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
  txtLocation: {
    color: '#53587A',
    fontSize: 16,
    marginBottom: 15,
    width: screenWidth - 100,
  },
  currentLocation: {
    position: 'absolute',
    top: screenHeight - 300,
    right: -14,
  },
});
