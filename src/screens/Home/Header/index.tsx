import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {getImages} from '@/assets/Images';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {navigate} from '@/navigation/NavigationUtils';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import Splash from '@/components/Splash';
import {screenWidth} from '@/themes/Responsive';

const Header = ({navigation, load}: any) => {
  const {idUser, userToken} = useContext(AuthContext);
  const [isLoad, setIsLoad] = useState(true);
  const [road, setRoad] = useState();
  const [city, setCity] = useState();
  useEffect(() => {
    fetch(`${Config.API_URL}/api/user/${idUser}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setRoad(res.user.address.road);
        setCity(res.user.address.city);
      })
      .finally(() => setIsLoad(false));
  }, [load]);
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.locationView}
        activeOpacity={0.6}
        onPress={() => navigate({name: 'Location'})}
      >
        <Ionicons
          name="location-sharp"
          size={12.5}
          color={'#234F68'}
        />
        <Text style={styles.textLocation}>
          {isLoad ? (
            <ActivityIndicator
              size="small"
              color="#8BC83F"
            />
          ) : (
            road
          )}
        </Text>
        <Feather
          name="chevron-down"
          size={12.5}
          color={'#234F68'}
        />
      </TouchableOpacity>
      <View style={{flexDirection: 'row'}}>
        {/* <TouchableOpacity
          style={styles.notification}
          onPress={() =>
            navigate({
              name: 'Notification',
            })
          }
        >
          <Feather
            name="bell"
            size={20}
            color={'#252B5C'}
          />
          <View
            style={{
              backgroundColor: '#FFFFFF',
              width: 12,
              height: 12,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              right: 12,
              top: 8,
            }}
          >
            <View
              style={{
                backgroundColor: '#FD5F4A',
                width: 6,
                height: 6,
                borderRadius: 6,
              }}
            />
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.notification}
          onPress={() =>
            navigate({
              name: 'Message',
            })
          }
        >
          <AntDesign
            name="message1"
            size={20}
            color={'#252B5C'}
          />
          <View
            style={{
              backgroundColor: '#FFFFFF',
              width: 12,
              height: 12,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              right: 12,
              top: 8,
            }}
          >
            <View
              style={{
                backgroundColor: '#FD5F4A',
                width: 6,
                height: 6,
                borderRadius: 6,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  locationView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEDF3',
    padding: 16,
    borderRadius: 25,
    maxWidth: screenWidth / 2,
  },
  notification: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: '#8BC83F',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    marginLeft: 13,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 44,
  },
  textLocation: {
    color: '#252B5C',
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 8,
  },
});
