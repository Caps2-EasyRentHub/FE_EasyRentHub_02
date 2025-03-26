import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import {Marker_Icon} from '@/assets/Svg';

const Maps = ({user, estate}: any) => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [mapDelta, setMapDelta] = useState<{
    mapLatDelta: number;
    mapLonDelta: number;
  } | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    requestCameraPermission();
  }, [isLoading]);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
        handleGetDirections();
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const {latitude, longitude} = position.coords;
        const URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const URL1 = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${estate.address.lat}&lon=${estate.address.lng}`;
        try {
          const response = await axios.get(URL);
          const response1 = await axios.get(URL1);
          const current = `${response.data.address.road},  ${response.data.address.city_district}, ${response.data.address.city}`;
          const address = `${response1.data.address.road},  ${response1.data.address.city_district}, ${response1.data.address.city}`;

          setCurrentAddress(current);
          setAddress(address);
        } catch (error) {
          console.error('Lỗi:', error);
        }
        setIsLoading(false);
      },
      (error) => {
        console.log('Error: ', error.message);
      },
      {enableHighAccuracy: false},
    );
  };

  const handleGetDirections = async () => {
    if (user.address && estate.address) {
      const latDelta = Math.abs(user.address.lat - estate.address.lat);
      const lonDelta = Math.abs(user.address.lng - estate.address.lng);
      const zoomLatDelta = latDelta * 3;
      const zoomLonDelta = lonDelta * 3;

      const mapLatDelta = Math.max(zoomLatDelta, 0.001);
      const mapLonDelta = Math.max(zoomLonDelta, 0.001);
      setMapDelta({mapLatDelta, mapLonDelta});
    }
    if (user.address && estate.address) {
      const URL = `https://router.project-osrm.org/route/v1/driving/${user.address.lng},${user.address.lat};${estate.address.lng},${estate.address.lat}?overview=full&geometries=geojson`;
      try {
        const response = await axios.get(URL);
        if (response.data.code === 'Ok') {
          const coordinates = response.data.routes[0].geometry.coordinates;

          const arr = coordinates.map((coordinate: any) => ({
            latitude: coordinate[1],
            longitude: coordinate[0],
          }));
          arr.unshift({
            latitude: parseFloat(user.address.lat),
            longitude: parseFloat(user.address.lng),
          });
          arr.push({
            latitude: parseFloat(estate.address.lat),
            longitude: parseFloat(estate.address.lng),
          });
          setRouteCoordinates(arr);
        }
      } catch (error) {
        console.log('Error: ', error);
      }
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
        {mapDelta &&
          user.address &&
          estate.address &&
          routeCoordinates !== null && (
            <MapView
              style={styles.map}
              region={{
                latitude: parseFloat(user.address.lat),
                longitude: parseFloat(user.address.lng),
                latitudeDelta: mapDelta?.mapLatDelta,
                longitudeDelta: mapDelta?.mapLonDelta,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(user.address.lat),
                  longitude: parseFloat(user.address.lng),
                }}
                title={
                  user.address?.road +
                  ', ' +
                  user.address?.city +
                  ', ' +
                  user.address?.country
                }
              >
                <View style={{top: 9, position: 'absolute'}}>
                  <Marker_Icon />
                  <Image
                    source={{uri: user.avatar}}
                    style={styles.markerImage}
                  />
                </View>
              </Marker>

              <Marker
                coordinate={{
                  latitude: parseFloat(estate.address.lat),
                  longitude: parseFloat(estate.address.lng),
                }}
                title={
                  estate.address?.road +
                  ', ' +
                  estate.address?.city +
                  ', ' +
                  estate.address?.country
                }
              >
                <View style={{marginTop: 9}}>
                  <Marker_Icon />
                  <Image
                    source={{uri: estate.images[0]}}
                    style={styles.markerImage}
                  />
                </View>
              </Marker>
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={3}
                strokeColor="#8BC83F"
              />
            </MapView>
          )}
      </View>
    </View>
  );
};

export default Maps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  borderRadiusMap: {
    borderRadius: 25,
    width: screenWidth - 48,
    height: 250,
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
});
