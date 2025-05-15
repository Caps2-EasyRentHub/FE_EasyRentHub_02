import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, {useState, useContext, useEffect, useCallback} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import {House_Icon, Minus, Plus, Pin_Location} from '@/assets/Svg';
import {goBack} from '@/navigation/NavigationUtils';
import Loading from '@/components/Loading';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import MapView, {Marker} from 'react-native-maps';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';

const EditListing = ({route}: any) => {
  const {estateId} = route.params;
  const {userToken} = useContext(AuthContext);
  const {t} = useTranslation();

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const [name, setName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [road, setRoad] = useState('');
  const [quarter, setQuarter] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [bedroom, setBedroom] = useState<number>(1);
  const [bathroom, setBathroom] = useState<number>(1);
  const [floors, setFloors] = useState<number>(1);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<any>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 16.055061228490178,
    longitude: 108.20310270503711,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [showMap, setShowMap] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    const fetchEstateDetails = async () => {
      try {
        const response = await fetch(
          `${Config.API_URL}/api/estate/${estateId}`,
          {
            method: 'GET',
            headers: {Authorization: userToken},
          },
        );
        const result = await response.json();

        if (result && result.estate) {
          const estate = result.estate;
          setName(estate.name || '');
          setHouseNumber(estate.address?.house_number?.toString() || '');
          setRoad(estate.address?.road || '');
          setQuarter(estate.address?.quarter || '');
          setCity(estate.address?.city || '');
          setCountry(estate.address?.country || '');

          if (estate.address?.lat && estate.address?.lng) {
            setLat(estate.address.lat);
            setLng(estate.address.lng);
            setMapRegion({
              latitude: parseFloat(estate.address.lat),
              longitude: parseFloat(estate.address.lng),
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            });
          }

          setPrice(estate.price || 0);
          setBedroom(estate.property?.bedroom || 1);
          setBathroom(estate.property?.bathroom || 1);
          setFloors(estate.property?.floors || 1);
          setExistingImages(estate.images || []);
        } else {
          Alert.alert(t('error'), t('estate_not_found'));
          goBack();
        }
      } catch (error) {
        console.error('Error loading estate details:', error);
        Alert.alert(t('error'), t('something_went_wrong'));
        goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchEstateDetails();
  }, [estateId, userToken, t]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (search) {
        searchLocation();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [search]);

  const searchLocation = async () => {
    if (!search) return;

    setIsSearching(true);
    try {
      const URL = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&q=${search}`;
      const response = await axios.get(URL);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(t('error'), t('location_search_failed'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (item: any) => {
    setShowSearchResults(false);

    const addressComponents = item.display_name.split(',');

    if (item.display_name.startsWith('K')) {
      setRoad(addressComponents[0].trim());
      setQuarter(addressComponents[1].trim());
    } else {
      setRoad(addressComponents[0].trim() + ' ' + addressComponents[1].trim());
      setQuarter(addressComponents[2].trim());
    }

    setCity(addressComponents[addressComponents.length - 3].trim());
    setCountry(addressComponents[addressComponents.length - 1].trim());
    setLat(item.lat);
    setLng(item.lon);

    setMapRegion({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });

    setShowMap(true);
  };

  const selectImages = useCallback(async () => {
    try {
      const selected = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: true,
        includeBase64: true,
      });

      setNewImages([...newImages, ...selected.map((item) => item.path)]);
    } catch (error) {
      console.log('Image selection cancelled or failed');
    }
  }, [newImages]);

  const uploadImages = async () => {
    if (newImages.length === 0) return;

    setIsUploadingImages(true);
    const tempUploadedImages: string[] = [];

    try {
      for (const imagePath of newImages) {
        const formData = new FormData();
        const imageFile = {
          uri: imagePath,
          type: 'image/jpeg',
          name: 'image.jpg',
        };

        formData.append('file', imageFile);
        formData.append('upload_preset', 'zkrhoyir');
        formData.append('cloud_name', 'dw1sniewf');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dw1sniewf/image/upload',
          {
            method: 'POST',
            body: formData,
          },
        );

        const result = await response.json();
        if (result.url) {
          tempUploadedImages.push(result.url);
        }
      }

      setUploadedImages(tempUploadedImages);
      Alert.alert(t('Thành công'), t('cập nhật ảnh'));
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert(t('error'), t('Lỗi cập nhật'));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeExistingImage = (index: number) => {
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);
  };

  const removeNewImage = (index: number) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };

  const handleUpdateEstate = async () => {
    if (
      !name ||
      !houseNumber ||
      !road ||
      !city ||
      !country ||
      !lat ||
      !lng ||
      price <= 0
    ) {
      setOperationSuccess(false);
      setResultMessage(t('Vui lòng điền đầy đủ thông tin bắt buộc'));
      setResultModalVisible(true);
      return;
    }

    setUpdating(true);
    try {
      let newUploadedImages: string[] = [];

      if (newImages.length > 0) {
        try {
          for (const imagePath of newImages) {
            const formData = new FormData();
            const imageFile = {
              uri: imagePath,
              type: 'image/jpeg',
              name: 'image.jpg',
            };

            formData.append('file', imageFile);
            formData.append('upload_preset', 'zkrhoyir');
            formData.append('cloud_name', 'dw1sniewf');

            const response = await fetch(
              'https://api.cloudinary.com/v1_1/dw1sniewf/image/upload',
              {
                method: 'POST',
                body: formData,
              },
            );

            const result = await response.json();
            if (result.url) {
              newUploadedImages.push(result.url);
            }
          }
        } catch (error) {
          console.error('Image upload error:', error);
          setUpdating(false);

          setOperationSuccess(false);
          setResultMessage(t('Không thể tải lên hình ảnh'));
          setResultModalVisible(true);
          return;
        }
      }

      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Authorization', userToken);

      const allImages = [...existingImages, ...newUploadedImages];

      const raw = JSON.stringify({
        name: name,
        images: allImages,
        address: {
          house_number: parseInt(houseNumber),
          road: road,
          quarter: quarter,
          city: city,
          country: country,
          lat: lat,
          lng: lng,
        },
        price: price,
        property: {
          bedroom: bedroom,
          bathroom: bathroom,
          floors: floors,
        },
      });

      const requestOptions = {
        method: 'PATCH',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch(
        `${Config.API_URL}/api/estate/${estateId}`,
        requestOptions,
      );
      const result = await response.json();

      if (response.ok) {
        setOperationSuccess(true);
        setResultMessage(t('Cập nhật phòng trọ thành công'));
        setResultModalVisible(true);
      } else {
        setOperationSuccess(false);
        setResultMessage(result.message || t('Cập nhật không thành công'));
        setResultModalVisible(true);
      }
    } catch (error) {
      console.error('Error updating estate:', error);
      setOperationSuccess(false);
      setResultMessage(t('Đã xảy ra lỗi, vui lòng thử lại sau'));
      setResultModalVisible(true);
    } finally {
      setUpdating(false);
    }
  };

  const ResultModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={resultModalVisible}
      onRequestClose={() => {
        setResultModalVisible(false);
        if (operationSuccess) goBack();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.resultIconContainer,
              operationSuccess
                ? styles.successIconContainer
                : styles.errorIconContainer,
            ]}
          >
            {operationSuccess ? (
              <AntDesign
                name="checkcircle"
                size={40}
                color="#FFFFFF"
              />
            ) : (
              <MaterialIcons
                name="error"
                size={40}
                color="#FFFFFF"
              />
            )}
          </View>

          <Text
            style={[
              styles.resultTitle,
              operationSuccess ? styles.successTitle : styles.errorTitle,
            ]}
          >
            {operationSuccess ? t('Thành công') : t('Lỗi')}
          </Text>

          <Text style={styles.modalMessage}>{resultMessage}</Text>

          <TouchableOpacity
            style={[
              styles.modalButton,
              operationSuccess ? styles.successButton : styles.errorButton,
            ]}
            onPress={() => {
              setResultModalVisible(false);
              if (operationSuccess) goBack();
            }}
          >
            <Text style={styles.buttonText}>{t('Đóng')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return <Loading />;
  }

  const renderBasicInfo = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('Tên phòng trọ')} *</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.viewIcon}>
          <House_Icon />
        </View>
      </View>

      {/* House Number */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('Số nhà')} *</Text>
        <TextInput
          style={styles.textInput}
          value={houseNumber}
          onChangeText={setHouseNumber}
          keyboardType="numeric"
        />
      </View>

      {/* Price */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('price')} *</Text>
        <TextInput
          style={styles.textInput}
          value={price.toString()}
          keyboardType="numeric"
          onChangeText={(value) => {
            if (value === '') {
              setPrice(0);
            } else {
              const parsedValue = parseFloat(value);
              setPrice(isNaN(parsedValue) ? 0 : parsedValue);
            }
          }}
        />
        <View style={styles.dollarIcon}>
          {/* <FontAwesome
            name="dollar"
            color={'#252B5C'}
            size={16}
          /> */}
          <Text style={styles.propertyTitle}>{t('VND')}</Text>
        </View>
      </View>

      <View style={styles.propertyView}>
        <Text style={styles.propertyTitle}>{t('property')}</Text>

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
    </>
  );

  const renderLocationSection = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('Tìm kiếm địa chỉ mới')}</Text>
        <TextInput
          style={styles.textInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('enter_location')}
        />
        <View style={styles.searchIcon}>
          <Feather
            name="search"
            size={20}
            color={'#252B5C'}
          />
        </View>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#8BC83F"
          />
        </View>
      )}

      {showSearchResults && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.searchResultsTitle}>{t('search_results')}</Text>
          <ScrollView style={{maxHeight: 200}}>
            {searchResults.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.searchResultItem}
                onPress={() => handleSelectLocation(item)}
              >
                <Octicons
                  name="location"
                  color={'#53587A'}
                  size={14}
                />
                <Text
                  style={styles.searchResultText}
                  numberOfLines={2}
                >
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
          >
            <Marker
              coordinate={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
              }}
            >
              <View style={{top: 9, position: 'absolute'}}>
                <Pin_Location />
              </View>
            </Marker>
          </MapView>
        </View>
      )}

      {road && city && (
        <View style={styles.locationDetailsContainer}>
          <Text style={styles.locationDetailsTitle}>
            {t('Vị trí hiện tại')}
          </Text>
          <View style={styles.locationDetailsContent}>
            <Text style={styles.locationDetailsSubtitle}>{t('Đường')}:</Text>
            <Text style={styles.locationDetailsText}>{road}</Text>
          </View>
          <View style={styles.locationDetailsContent}>
            <Text style={styles.locationDetailsSubtitle}>{t('Khu phố')}:</Text>
            <Text style={styles.locationDetailsText}>{quarter}</Text>
          </View>
          <View style={styles.locationDetailsContent}>
            <Text style={styles.locationDetailsSubtitle}>
              {t('Thành phố')}:
            </Text>
            <Text style={styles.locationDetailsText}>{city}</Text>
          </View>
          <View style={styles.locationDetailsContent}>
            <Text style={styles.locationDetailsSubtitle}>{t('Đất nước')}:</Text>
            <Text style={styles.locationDetailsText}>{country}</Text>
          </View>
          <View style={styles.locationDetailsContent}>
            <Text style={styles.locationDetailsSubtitle}>{t('Vĩ độ')}:</Text>
            <Text style={styles.locationDetailsText}>{lat}</Text>
          </View>
          <View style={styles.locationDetailsContent}>
            <Text style={styles.locationDetailsSubtitle}>{t('Kinh độ')}:</Text>
            <Text style={styles.locationDetailsText}>{lng}</Text>
          </View>
        </View>
      )}
    </>
  );

  const renderImagesSection = () => (
    <>
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.imagesTitle}>{t('Ảnh hiện tại')}</Text>
          <View style={styles.imagesGrid}>
            {existingImages.map((image, index) => (
              <View
                key={index}
                style={styles.imageContainer}
              >
                <TouchableOpacity
                  style={styles.deleteImageButton}
                  onPress={() => removeExistingImage(index)}
                >
                  <AntDesign
                    name="close"
                    color="#FFFFFF"
                    size={12}
                  />
                </TouchableOpacity>
                <Image
                  source={{uri: image}}
                  style={styles.imagePreview}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* New Images */}
      <View style={styles.imagesSection}>
        <Text style={styles.imagesTitle}>{t('Thêm ảnh mới')}</Text>
        <View style={styles.imagesGrid}>
          {newImages.map((image: string, index: number) => (
            <View
              key={index}
              style={styles.imageContainer}
            >
              <TouchableOpacity
                style={styles.deleteImageButton}
                onPress={() => removeNewImage(index)}
              >
                <AntDesign
                  name="close"
                  color="#FFFFFF"
                  size={12}
                />
              </TouchableOpacity>
              <Image
                source={{uri: image}}
                style={styles.imagePreview}
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={selectImages}
          >
            <Feather
              name="plus"
              color={'#252B5C'}
              size={25}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.component}>
      {updating && <Loading />}
      <View style={{zIndex: updating ? 0 : 1}}>
        <BackButton />
      </View>
      <ScrollView>
        <View style={styles.pageTitle}>
          <Text style={styles.editList}>{t('edit_listing')}</Text>
        </View>

        <View style={styles.titleView}>
          <Text style={styles.titleHighlight}>{t('Cập nhật')}</Text>
          <Text style={styles.titleNormal}>{t('phòng trọ')}</Text>
        </View>

        {/* Section Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === 'basic' && styles.activeTab,
            ]}
            onPress={() => setActiveSection('basic')}
          >
            <Text
              style={[
                styles.tabText,
                activeSection === 'basic' && styles.activeTabText,
              ]}
            >
              {t('Thông tin')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === 'location' && styles.activeTab,
            ]}
            onPress={() => setActiveSection('location')}
          >
            <Text
              style={[
                styles.tabText,
                activeSection === 'location' && styles.activeTabText,
              ]}
            >
              {t('location')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === 'images' && styles.activeTab,
            ]}
            onPress={() => setActiveSection('images')}
          >
            <Text
              style={[
                styles.tabText,
                activeSection === 'images' && styles.activeTabText,
              ]}
            >
              {t('Ảnh')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active section */}
        {activeSection === 'basic' && renderBasicInfo()}
        {activeSection === 'location' && renderLocationSection()}
        {activeSection === 'images' && renderImagesSection()}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.btnUpdate}
          onPress={handleUpdateEstate}
        >
          <Text style={styles.updateText}>{t('Cập nhật')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal />
    </View>
  );
};

export default EditListing;

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageTitle: {
    alignItems: 'center',
  },
  editList: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
  },
  titleView: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  titleNormal: {
    fontFamily: 'Lato-Medium',
    color: '#000000',
    fontSize: 25,
    marginLeft: 5,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 25,
  },
  tabNavigation: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#F5F4F8',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#8BC83F',
  },
  tabText: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#252B5C',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 24,
  },
  textInput: {
    width: screenWidth - 48,
    height: 70,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    borderRadius: 25,
    color: '#252B5C',
    fontSize: 15,
    paddingHorizontal: 16,
  },
  viewIcon: {
    position: 'absolute',
    top: 38,
    right: 36,
  },
  searchIcon: {
    position: 'absolute',
    top: 45,
    right: 36,
  },
  dollarIcon: {
    position: 'absolute',
    top: 45,
    right: 36,
  },
  propertyView: {
    marginTop: 20,
    marginBottom: 20,
  },
  propertyTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginBottom: 16,
    marginLeft: 24,
  },
  propertyFrom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  proTxtView: {
    flex: 1,
  },
  propertyText: {
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
    fontSize: 16,
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnQty: {
    width: 35,
    height: 35,
    backgroundColor: '#8bc83f',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBedroom: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  searchResultsContainer: {
    marginHorizontal: 24,
    backgroundColor: '#F5F4F8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 16,
  },
  searchResultsTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginBottom: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
  },
  searchResultText: {
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
    fontSize: 14,
    marginLeft: 10,
    width: '90%',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 24,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationDetailsContainer: {
    marginHorizontal: 24,
    backgroundColor: '#F5F4F8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 16,
  },
  locationDetailsTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginBottom: 10,
  },
  locationDetailsContent: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  locationDetailsSubtitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    width: 70,
  },
  locationDetailsText: {
    color: '#252B5C',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    flex: 1,
  },
  imagesSection: {
    marginBottom: 20,
  },
  imagesTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 24,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 24,
  },
  imageContainer: {
    width: screenWidth / 3 - 24,
    height: screenWidth / 3 - 24,
    borderRadius: 15,
    backgroundColor: '#F5F4F8',
    margin: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  deleteImageButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    zIndex: 10,
    backgroundColor: 'rgba(139, 200, 63, 0.8)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: screenWidth / 3 - 24,
    height: screenWidth / 3 - 24,
    borderRadius: 15,
    backgroundColor: '#F5F4F8',
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#8BC83F',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
  },
  uploadedImagesContainer: {
    marginHorizontal: 24,
    backgroundColor: '#F5F4F8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  uploadedImagesCount: {
    color: '#252B5C',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
  },
  btnUpdate: {
    width: screenWidth - 48,
    height: 54,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 24,
    marginBottom: 40,
  },
  updateText: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth - 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successIconContainer: {
    backgroundColor: '#8BC83F',
  },
  errorIconContainer: {
    backgroundColor: '#FF3B30',
  },
  resultTitle: {
    fontFamily: 'Lato-Bold',
    fontSize: 22,
    marginBottom: 10,
  },
  successTitle: {
    color: '#8BC83F',
  },
  errorTitle: {
    color: '#FF3B30',
  },
  modalMessage: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#53587A',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#8BC83F',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
