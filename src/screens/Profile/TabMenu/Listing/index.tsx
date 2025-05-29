import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {EstateItems} from '@/utils/interface';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import {navigate, push} from '@/navigation/NavigationUtils';
import {getImages} from '@/assets/Images';
import {Pencil_Icon} from '@/assets/Svg';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';

const Listing = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedEstateId, setSelectedEstateId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const loadPosts = useCallback(async () => {
    if (!idUser || !userToken) {
      console.log('Missing user ID or token');
      return;
    }

    if (!refreshing) {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `${Config.API_URL}/api/user_estates/${idUser}?limit=100`,
        {
          method: 'GET',
          headers: {Authorization: userToken},
        },
      );
      const res = await response.json();

      if (res.estates && Array.isArray(res.estates)) {
        setData(res.estates);
      } else {
        console.log('Invalid estates data format:', res);
      }
    } catch (error) {
      console.error('Error loading estates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [idUser, userToken, refreshing]);

  useEffect(() => {
    if (idUser && userToken) {
      loadPosts();
    }
  }, [idUser, userToken, loadPosts]);

  useEffect(() => {
    if (!idUser || !userToken) return;

    const intervalId = setInterval(() => {
      setRefreshing(false);
      loadPosts();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [idUser, userToken, loadPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts();
  }, [loadPosts]);

  const initiateDeleteListing = (estateId: string) => {
    setSelectedEstateId(estateId);
    setConfirmModalVisible(true);
  };

  const handleDeleteListing = async () => {
    setConfirmModalVisible(false);

    setIsDeleting(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Authorization', userToken);

      const requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow',
      };

      const response = await fetch(
        `${Config.API_URL}/api/estate/${selectedEstateId}`,
        requestOptions,
      );

      if (response.ok) {
        setData(data.filter((item) => item._id !== selectedEstateId));
        setOperationSuccess(true);
        setResultMessage(t('Xóa phòng trọ thành công'));
      } else {
        const errorData = await response.json();
        setOperationSuccess(false);
        setResultMessage(errorData.message || t('Không thể xóa phòng trọ'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      setOperationSuccess(false);
      setResultMessage(t('Đã xảy ra lỗi khi xóa phòng trọ'));
    } finally {
      setIsDeleting(false);
      setResultModalVisible(true);
    }
  };

  const ConfirmDeleteModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={confirmModalVisible}
      onRequestClose={() => setConfirmModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('Xác nhận xóa')}</Text>
          </View>

          <Text style={styles.modalMessage}>
            {t('Bạn có chắc chắn muốn xóa phòng trọ này?')}
          </Text>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setConfirmModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('Hủy')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleDeleteListing}
            >
              <Text style={styles.confirmButtonText}>{t('Xóa')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const ResultModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={resultModalVisible}
      onRequestClose={() => setResultModalVisible(false)}
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
            onPress={() => setResultModalVisible(false)}
          >
            <Text style={styles.confirmButtonText}>{t('Đóng')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ProcessingModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isDeleting}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.processingContainer}>
          <ActivityIndicator
            size="large"
            color="#8BC83F"
          />
          <Text style={styles.processingText}>{t('Đang xử lý...')}</Text>
        </View>
      </View>
    </Modal>
  );

  const RenderItems = ({item}: {item: EstateItems}) => {
    return (
      <View style={styles.cardItem}>
        <View style={[styles.statusView, {backgroundColor: '#fdd43f'}]}>
          <View style={styles.priceContent}>
            <Text
              style={{
                color: '#F5F4F8',
                fontSize: 12,
                fontFamily: 'Lato-Bold',
                marginLeft: 2,
              }}
            >
              Wait
            </Text>
          </View>
        </View>

        <View style={styles.priceView}>
          <View style={styles.priceContent}>
            <Text style={styles.price}>$ </Text>
            <Text style={styles.price}>{item.price.toLocaleString()}</Text>
            <Text style={styles.stay}> /</Text>
            <Text style={styles.stay}>tháng</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            push({name: 'EditListing', params: {estateId: item._id}})
          }
        >
          <Pencil_Icon
            width={16}
            height={16}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => initiateDeleteListing(item._id)}
        >
          <AntDesign
            name="delete"
            size={16}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Image
          source={{
            uri: item.images && item.images.length > 0 ? item.images[0] : null,
          }}
          style={styles.images}
        />

        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            push({name: 'EstateDetail', params: {id: item._id, nearby: false}})
          }
        >
          <Text style={styles.cardName}>{item.name || 'No Name'}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.ratingView}>
              <Entypo
                name="star"
                color={'#FFC42D'}
                size={10}
              />
              <Text style={styles.rating}>{item.rating_star || 0}</Text>
            </View>
            <View style={styles.locationView}>
              <FontAwesome6
                name="location-dot"
                color={'#234F68'}
                size={9}
              />
              <Text
                style={styles.location}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {' '}
                {item.address && item.address.road
                  ? item.address.road
                  : 'No Address'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingHorizontal: 10,
        paddingBottom: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#8BC83F']}
          tintColor="#8BC83F"
        />
      }
    >
      <View>
        <View style={styles.viewTitle}>
          <Text style={styles.textTitle}>
            {data.length} {t('listings')}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigate({name: 'CreateEstate'})}
          >
            <AntDesign
              name="plus"
              color={'#FFFFFF'}
              size={16}
            />
          </TouchableOpacity>
        </View>
        {loading && !refreshing ? (
          <View style={{alignItems: 'center', marginTop: 20}}>
            <ActivityIndicator
              size="large"
              color="#8BC83F"
            />
            <Text style={{textAlign: 'center', marginTop: 10}}>
              Đang tải...
            </Text>
          </View>
        ) : data.length === 0 ? (
          <Text style={{textAlign: 'center', marginTop: 20}}>
            Không tìm thấy phòng trọ nào
          </Text>
        ) : (
          <View style={styles.viewRender}>
            {data.map((item: EstateItems, index: number) => {
              return (
                <RenderItems
                  item={item}
                  key={item._id || index}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Render các modal */}
      <ConfirmDeleteModal />
      <ResultModal />
      <ProcessingModal />
    </ScrollView>
  );
};

export default Listing;

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    backgroundColor: '#FFFFFF',
  },
  textTitle: {
    textTransform: 'lowercase',
    color: '#252B5C',
    fontFamily: 'Lato-Medium',
    fontSize: 18,
  },
  viewRender: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 0,
  },
  btnFavorite: {
    position: 'absolute',
    right: 48,
    top: 8,
  },

  cardItem: {
    width: screenWidth / 2 - 30,
    marginHorizontal: 5,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    marginTop: 20,
    padding: 8,
    marginRight: 5,
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
  viewButton: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  viewTitle: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: screenWidth - 48,
  },
  addButton: {
    backgroundColor: '#234F68',
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusView: {
    top: 154,
    left: 16,
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(35,79,104,0.69)',
    borderRadius: 8,
  },
  editButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    backgroundColor: 'rgba(139, 200, 63, 0.7)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: 16,
    top: 56,
    zIndex: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.7)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    color: '#252B5C',
  },
  modalMessage: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#53587A',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F4F8',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    color: '#252B5C',
  },
  confirmButtonText: {
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  processingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#252B5C',
    marginTop: 10,
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
  successButton: {
    backgroundColor: '#8BC83F',
    width: '100%',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
    width: '100%',
  },
});
