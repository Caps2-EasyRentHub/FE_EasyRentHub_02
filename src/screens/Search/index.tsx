import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {useTranslation} from 'react-i18next';
import {Marker_Icon, Pin_Location} from '@/assets/Svg';
import {push} from '@/navigation/NavigationUtils';
import {Config} from '@/config';
import {EstateDetailProps, EstateItems} from '@/utils/interface';
import {AuthContext} from '@/context/AuthContext';

const Search = () => {
  const {t} = useTranslation();
  const [search, setSearch] = useState('');
  // const [address, setAddress] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [changeLocation, setChangeLocation] = useState({
    latitude: 16.055061228490178,
    longitude: 108.20310270503711,
  });

  const [data, setData] = useState<EstateItems[]>([]);
  const [estate, setEstate] = useState<EstateDetailProps[]>([]);
  const [idEstate, setIdEstate] = useState('');
  const {userToken, idUser} = useContext(AuthContext);

  useEffect(() => {
    const loadEstates = async () => {
      await fetch(`${Config.API_URL}/api/estates`, {
        method: 'GET',
        headers: {Authorization: userToken},
      })
        .then((res) => res.json())
        .then((res) => {
          setData(res.estates);
        });
    };
    loadEstates();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (idEstate) {
      const loadEstate = async () => {
        await fetch(`${Config.API_URL}/api//estate/${idEstate}`, {
          method: 'GET',
          headers: {Authorization: userToken},
        })
          .then((res) => res.json())
          .then((res) => {
            setEstate([res.estate]);
          });
      };
      loadEstate();
    }
  }, [idEstate]);
  const handleFavorite = (id: any) => {
    console.log(id);

    if (id === idUser) {
      return true;
    } else {
      return false;
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
          provider={PROVIDER_GOOGLE}
        >
          {data?.map((item: any, index: number) => {
            return (
              item.status === 1 && (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: parseFloat(item.address.lat),
                    longitude: parseFloat(item.address.lng),
                  }}
                  onPress={() => setIdEstate(item._id)}
                >
                  <View style={{marginTop: 9}}>
                    <Marker_Icon />
                    <Image
                      source={{uri: item.images[0]}}
                      style={styles.markerImage}
                    />
                  </View>
                </Marker>
              )
            );
          })}
        </MapView>
      </View>

      <View style={styles.view2}>
        <View style={{position: 'absolute', zIndex: 1, top: 89}}>
          <View style={styles.icon}>
            <Feather
              name="search"
              size={20}
              color={'#252B5C'}
            />
          </View>
          <TextInput
            placeholder="Search House, Apartment, etc"
            style={[
              styles.input,
              {fontFamily: search ? 'Lato-Bold' : 'Lato-Regular'},
            ]}
            returnKeyType="search"
            onSubmitEditing={() => {
              push({
                name: 'SearchResult',
                params: {result: search},
              });
            }}
            placeholderTextColor={'#A1A5C1'}
            onChangeText={(text) => setSearch(text)}
            value={search}
          />
        </View>
        {Array.isArray(estate) &&
          estate.map((item: any, index: number) => {
            return (
              <TouchableOpacity
                style={styles.itemView}
                key={index}
                onPress={() =>
                  push({
                    name: 'EstateDetail',
                    params: {id: item._id, nearby: true},
                  })
                }
              >
                <View style={styles.contentView}>
                  <Image
                    source={{uri: item.images[0]}}
                    style={styles.imgItem}
                  />
                  <View style={styles.rightView}>
                    <Text style={styles.nameEstate}>{item.name}</Text>
                    <View style={styles.ratingView}>
                      <Entypo
                        name="star"
                        color={'rgba(35,79,104,.42)'}
                        size={12}
                      />
                      <Text style={styles.rating}>3.5</Text>
                    </View>
                    <View style={styles.ratingView}>
                      <FontAwesome6
                        name="location-dot"
                        color={'#234F68'}
                        size={12}
                      />
                      <Text style={styles.location}>
                        {item.address.road}, {item.address.city}
                      </Text>
                    </View>
                    <View style={styles.priceView}>
                      <Text style={styles.price}>$ </Text>
                      <Text style={styles.price}>{item.price.rent}</Text>
                      <Text style={styles.stay}> /</Text>
                      <Text style={styles.stay}>month</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
};

export default Search;

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
    height: screenHeight - 120,
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
    borderRadius: 25,
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
  itemView: {
    position: 'relative',
    width: screenWidth - 48,
    height: 156,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    marginBottom: 10,
    borderRadius: 25,
    bottom: -screenHeight + 156 + 90 + 30,
  },
  contentView: {
    flexDirection: 'row',
  },
  btnFavoriteView: {
    left: 8,
    top: 8,
  },
  imgItem: {
    width: screenWidth / 2 - 16,
    height: 140,
    borderRadius: 18,
    margin: 8,
  },
  rightView: {
    marginLeft: 16,
    marginTop: 16,
  },
  nameEstate: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 16,
    width: screenWidth / 2 - 24 - 48,
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    fontSize: 14,
    width: screenWidth / 2 - 24 - 48 - 16,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
  },
  price: {
    color: '#252B5C',
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  stay: {
    color: '#252B5C',
    fontSize: 12,
    fontFamily: 'Lato-Regular',
  },
});
