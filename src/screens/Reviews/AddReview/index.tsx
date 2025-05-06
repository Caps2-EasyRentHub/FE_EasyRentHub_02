import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Switch,
  Platform,
} from 'react-native';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import ImagePicker from 'react-native-image-crop-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import {Error, Success} from '@/assets/Svg';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {navigate, push} from '@/navigation/NavigationUtils';
import Loading from '@/components/Loading';

const AddReview = ({route}: any) => {
  const {id} = route.params;
  const {t} = useTranslation();

  // Review states
  const [reviewImages, setReviewImages] = useState<any>([]);
  const [uploadedReviewImages, setUploadedReviewImages] = useState<string[]>(
    [],
  );
  const [content, setContent] = useState('');
  const [star, setStar] = useState(0);

  // Maintenance states
  const [needsMaintenance, setNeedsMaintenance] = useState(false);
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [maintenancePriority, setMaintenancePriority] = useState('medium');
  const [maintenanceImages, setMaintenanceImages] = useState<any>([]);
  const [uploadedMaintenanceImages, setUploadedMaintenanceImages] = useState<
    string[]
  >([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {userToken, idUser} = useContext(AuthContext);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  // Open image picker for review images
  const openReviewImagePicker = useCallback(async () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      includeBase64: true,
    }).then((images) => {
      setReviewImages((img: any) => [
        ...img.concat(
          images.map((item: any) => {
            return item.path;
          }),
        ),
      ]);

      // Upload images to cloud
      images
        .map((item: any) => item.path)
        .forEach(async (item: string) => {
          const formData = new FormData();
          const base64 = {
            uri: item,
            type: 'image/jpeg',
            name: 'image.jpg',
          };
          formData.append('file', base64);
          formData.append('upload_preset', 'zkrhoyir');
          formData.append('cloud_name', 'dw1sniewf');
          try {
            const res = await fetch(
              'https://api.cloudinary.com/v1_1/dw1sniewf/image/upload',
              {
                method: 'POST',
                body: formData,
              },
            );
            const image = await res.json();
            setUploadedReviewImages((prev) => [...prev, image.url]);
          } catch (error) {
            console.error('Error uploading review image:', error);
          }
        });
    });
  }, []);

  // Open image picker for maintenance images
  const openMaintenanceImagePicker = useCallback(async () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      includeBase64: true,
    }).then((images) => {
      setMaintenanceImages((img: any) => [
        ...img.concat(
          images.map((item: any) => {
            return item.path;
          }),
        ),
      ]);

      // Upload images to cloud
      images
        .map((item: any) => item.path)
        .forEach(async (item: string) => {
          const formData = new FormData();
          const base64 = {
            uri: item,
            type: 'image/jpeg',
            name: 'image.jpg',
          };
          formData.append('file', base64);
          formData.append('upload_preset', 'zkrhoyir');
          formData.append('cloud_name', 'dw1sniewf');
          try {
            const res = await fetch(
              'https://api.cloudinary.com/v1_1/dw1sniewf/image/upload',
              {
                method: 'POST',
                body: formData,
              },
            );
            const image = await res.json();
            setUploadedMaintenanceImages((prev) => [...prev, image.url]);
          } catch (error) {
            console.error('Error uploading maintenance image:', error);
          }
        });
    });
  }, []);

  const handleClosePress = () => bottomSheetRef.current?.close();

  const handleOpenPress = async () => {
    if (content && star) {
      setLoading(true);

      try {
        // Submit the review
        await axios.post(
          `${Config.API_URL}/api/review`,
          {
            estateId: id,
            content,
            star,
            images: uploadedReviewImages,
            estateUserId: idUser,
          },
          {
            headers: {Authorization: userToken},
          },
        );

        // If maintenance is needed, submit maintenance request
        if (needsMaintenance && maintenanceDescription) {
          await axios.post(
            `${Config.API_URL}/api/maintenance`,
            {
              estateId: id,
              description: maintenanceDescription,
              priority: maintenancePriority,
              images: uploadedMaintenanceImages,
            },
            {
              headers: {Authorization: userToken},
            },
          );
        }

        setSuccess(true);
        bottomSheetRef.current?.expand();
      } catch (e) {
        console.error(e);
        setSuccess(false);
        bottomSheetRef.current?.expand();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteReviewImage = (index: number) => {
    const newImages = [...reviewImages];
    newImages.splice(index, 1);
    setReviewImages(newImages);

    // If we have uploaded images, remove the corresponding one
    if (uploadedReviewImages.length > index) {
      const newUploadedImages = [...uploadedReviewImages];
      newUploadedImages.splice(index, 1);
      setUploadedReviewImages(newUploadedImages);
    }
  };

  const handleDeleteMaintenanceImage = (index: number) => {
    const newImages = [...maintenanceImages];
    newImages.splice(index, 1);
    setMaintenanceImages(newImages);

    // If we have uploaded images, remove the corresponding one
    if (uploadedMaintenanceImages.length > index) {
      const newUploadedImages = [...uploadedMaintenanceImages];
      newUploadedImages.splice(index, 1);
      setUploadedMaintenanceImages(newUploadedImages);
    }
  };

  const renderPriorityOption = (value: string, label: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.priorityOption,
          maintenancePriority === value && styles.priorityOptionSelected,
        ]}
        onPress={() => setMaintenancePriority(value)}
      >
        <Text
          style={[
            styles.priorityOptionText,
            maintenancePriority === value && styles.priorityOptionTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      <View style={{zIndex: loading ? 0 : 1}}>
        <BackButton />
      </View>
      <Text style={styles.txtReview}>{t('transaction_detail')}</Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.title}>
            <Text style={styles.titleNormal}>Xin chào,</Text>
            <Text style={styles.titleHighlight}> trải nghiệm</Text>
          </View>
          <Text style={[styles.titleHighlight, {marginLeft: 24, marginTop: 5}]}>
            của bạn như thế nào?
          </Text>
          <View style={styles.viewStar}>
            {[1, 2, 3, 4, 5].map((item) => (
              <AntDesign
                key={item}
                name="star"
                color={
                  star >= item
                    ? 'rgba(253,181,74,1)'
                    : 'rgba(253, 181, 74, 0.5)'
                }
                size={35}
                onPress={() => setStar(item)}
              />
            ))}

            <Text style={styles.totalStar}>{star}.0</Text>
          </View>
          <View>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="subtitles-outline"
                size={20}
                color={'#252B5C'}
              />
            </View>
            <TextInput
              placeholder="Viết trải nghiệm của bạn ở đây (tùy chọn)"
              style={[
                styles.input,
                {fontFamily: content ? 'Lato-Bold' : 'Lato-Regular'},
              ]}
              placeholderTextColor={'#A1A5C1'}
              onChangeText={(text) => setContent(text)}
              value={content}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hình ảnh trải nghiệm:</Text>
            <View style={styles.imagesContainer}>
              {reviewImages.map((item: any, index: number) => (
                <View
                  style={styles.viewImages}
                  key={index}
                >
                  <TouchableOpacity
                    style={styles.delImages}
                    onPress={() => handleDeleteReviewImage(index)}
                  >
                    <AntDesign name="close" />
                  </TouchableOpacity>
                  <Image
                    source={{uri: item}}
                    style={styles.images}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.btnAdd}
                onPress={openReviewImagePicker}
              >
                <Feather
                  name="plus"
                  color={'#252B5C'}
                  size={25}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.maintenanceToggleContainer}>
            <View style={styles.maintenanceToggleRow}>
              <View style={styles.maintenanceIconContainer}>
                <FontAwesome
                  name="wrench"
                  size={20}
                  color="#252B5C"
                />
              </View>
              <Text style={styles.maintenanceToggleText}>Yêu cầu bảo trì</Text>
              <Switch
                trackColor={{false: '#F5F4F8', true: '#8BC83F'}}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#F5F4F8"
                onValueChange={() => setNeedsMaintenance(!needsMaintenance)}
                value={needsMaintenance}
              />
            </View>
          </View>

          {needsMaintenance && (
            <View style={styles.maintenanceContainer}>
              <View>
                <View style={styles.maintenanceIcon}>
                  <MaterialCommunityIcons
                    name="tools"
                    size={20}
                    color={'#252B5C'}
                  />
                </View>
                <TextInput
                  placeholder="Mô tả vấn đề cần bảo trì"
                  style={[
                    styles.maintenanceInput,
                    {
                      fontFamily: maintenanceDescription
                        ? 'Lato-Bold'
                        : 'Lato-Regular',
                    },
                  ]}
                  placeholderTextColor={'#A1A5C1'}
                  onChangeText={(text) => setMaintenanceDescription(text)}
                  value={maintenanceDescription}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <Text style={styles.priorityLabel}>Mức độ ưu tiên:</Text>
              <View style={styles.priorityOptionsContainer}>
                {renderPriorityOption('low', 'Thấp')}
                {renderPriorityOption('medium', 'Trung bình')}
                {renderPriorityOption('high', 'Cao')}
              </View>

              <Text style={styles.imagesLabel}>Hình ảnh gặp vấn đề:</Text>
              <View style={styles.imagesContainer}>
                {maintenanceImages.map((item: any, index: number) => (
                  <View
                    style={styles.viewImages}
                    key={index}
                  >
                    <TouchableOpacity
                      style={styles.delImages}
                      onPress={() => handleDeleteMaintenanceImage(index)}
                    >
                      <AntDesign name="close" />
                    </TouchableOpacity>
                    <Image
                      source={{uri: item}}
                      style={styles.images}
                    />
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.btnAdd}
                  onPress={openMaintenanceImagePicker}
                >
                  <Feather
                    name="plus"
                    color={'#252B5C'}
                    size={25}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnFinish, {marginBottom: 100, marginTop: 30}]}
            activeOpacity={0.8}
            onPress={handleOpenPress}
          >
            <Text style={styles.txtFinish}>
              {needsMaintenance
                ? 'Đánh giá & Gửi yêu cầu bảo trì'
                : t('Đánh giá')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
            <Text style={styles.titleNormal}>
              {needsMaintenance
                ? 'Đã gửi đánh giá và yêu cầu bảo trì'
                : 'Đã gửi đánh giá của bạn'}
            </Text>
            <Text style={[styles.titleHighlight]}>Thành công</Text>
            <View style={styles.btnModalGroup}>
              <TouchableOpacity
                style={styles.btnFinishModal}
                onPress={() =>
                  push({name: 'EstateDetail', params: {id, nearby: true}})
                }
              >
                <Text style={styles.txtFinishModal}>{t('finish')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Error />
            <Text style={[styles.titleNormal, {marginTop: 24}]}>
              unsuccessful
            </Text>
            <Text style={styles.titleHighlight}>
              {needsMaintenance
                ? 'submitted your review and maintenance request'
                : 'submitted your review'}
            </Text>
            <View style={styles.btnModalGroup}>
              <TouchableOpacity
                style={styles.btnAddMoreModal}
                onPress={handleClosePress}
              >
                <Text style={styles.txtAddMoreModal}>{t('close')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnRetryModal}>
                <Text
                  style={styles.txtFinishModal}
                  onPress={handleOpenPress}
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

export default AddReview;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  txtReview: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
    textAlign: 'center',
  },
  viewStar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginTop: 90,
  },
  totalStar: {
    fontFamily: 'Lato-Bold',
    color: '#1F4C6B',
    fontSize: 32,
    marginLeft: 15,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginTop: 50,
  },
  titleNormal: {
    fontFamily: 'Lato-Regular',
    color: '#000000',
    fontSize: 30,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#204D6C',
    fontSize: 30,
  },
  sectionContainer: {
    marginHorizontal: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#252B5C',
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  btnAdd: {
    width: 78,
    height: 78,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  viewImages: {
    width: screenWidth / 2 - 34,
    height: screenWidth / 2 - 34,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  images: {
    width: screenWidth / 2 - 40,
    height: screenWidth / 2 - 40,
    borderRadius: 25,
  },
  delImages: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: '#8BC83F',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
  },
  input: {
    color: '#252B5C',
    fontSize: 15,
    height: 70,
    marginTop: 20,
    width: screenWidth - 48,
    marginHorizontal: 24,
    paddingHorizontal: 46,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    zIndex: 1,
  },
  icon: {
    position: 'absolute',
    top: 25 + 18,
    left: 40,
    zIndex: 2,
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
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
  btnRetryModal: {
    width: screenWidth / 2 - 29,
    height: 70,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnFinishModal: {
    width: screenWidth - 29,
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
  // Maintenance request styles
  maintenanceToggleContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  maintenanceToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maintenanceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  maintenanceToggleText: {
    flex: 1,
    fontFamily: 'Lato-Bold',
    fontSize: 15,
    color: '#252B5C',
  },
  maintenanceContainer: {
    marginHorizontal: 24,
    marginTop: 15,
  },
  maintenanceIcon: {
    position: 'absolute',
    top: 25,
    left: 16,
    zIndex: 2,
  },
  maintenanceInput: {
    color: '#252B5C',
    fontSize: 15,
    textAlignVertical: 'top',
    paddingTop: 20,
    paddingVertical: 15,
    height: 120,
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 46,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
  },
  priorityLabel: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#252B5C',
    marginTop: 15,
    marginBottom: 10,
  },
  priorityOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  priorityOptionSelected: {
    backgroundColor: '#8BC83F',
  },
  priorityOptionText: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    color: '#252B5C',
  },
  priorityOptionTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
  },
  imagesLabel: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#252B5C',
    marginTop: 15,
    marginBottom: 10,
  },
});
