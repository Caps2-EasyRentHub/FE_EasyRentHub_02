import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import ImagePicker from 'react-native-image-crop-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
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
  const [images, setImages] = useState<any>([]);
  const [img, setImg] = useState<any>([]);
  const [content, setContent] = useState('');
  const uploadedImages: string[] = [];
  const [star, setStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {userToken, idUser} = useContext(AuthContext);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const OpenLibrary = useCallback(async () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      includeBase64: true,
    }).then((images) => {
      setImages((img: any) => [
        ...img.concat(
          images.map((item: any) => {
            return item.path;
          }),
        ),
      ]);
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
          const res = await fetch(
            'https://api.cloudinary.com/v1_1/dw1sniewf/image/upload',
            {
              method: 'POST',
              body: formData,
            },
          );
          const image = await res.json();
          uploadedImages.push(image.url);
          setImg(uploadedImages);
        });
    });
  }, []);
  const handleClosePress = () => bottomSheetRef.current?.close();

  const handleOpenPress = () => {
    if (content && star) {
      setLoading(true);
      axios
        .post(
          `${Config.API_URL}/api/review`,
          {
            estateId: id,
            content,
            star,
            images,
            estateUserId: idUser,
          },
          {
            headers: {Authorization: userToken},
          },
        )
        .then((res) => {
          setSuccess(true);
          bottomSheetRef.current?.expand();
        })
        .catch((e) => {
          setSuccess(false);
          bottomSheetRef.current?.expand();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleDeleteImages = (index: any) => {
    const newArray = [...images];
    newArray.splice(index, 1);
    setImages(newArray);
  };
  return (
    <View style={styles.container}>
      {loading && <Loading />}
      <View style={{zIndex: loading ? 0 : 1}}>
        <BackButton />
      </View>
      <Text style={styles.txtReview}>{t('transaction_detail')}</Text>
      <KeyboardAvoidingView>
        <ScrollView>
          <View style={styles.title}>
            <Text style={styles.titleNormal}>Hi, how was your</Text>
            <Text style={styles.titleHighlight}> overall</Text>
          </View>
          <Text style={[styles.titleHighlight, {marginLeft: 24, marginTop: 5}]}>
            experience?
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
              placeholder="Write your experience in here (optional)"
              style={[
                styles.input,
                {fontFamily: content ? 'Lato-Bold' : 'Lato-Regular'},
              ]}
              placeholderTextColor={'#A1A5C1'}
              onChangeText={(text) => setContent(text)}
              value={content}
            />
          </View>
          <View style={styles.viewImage}>
            {images.map((item: any, index: any) => {
              return (
                <View
                  style={styles.viewImages}
                  key={index}
                >
                  <TouchableOpacity
                    style={styles.delImages}
                    onPress={() => handleDeleteImages(index)}
                  >
                    <AntDesign name="close" />
                  </TouchableOpacity>
                  <Image
                    source={{uri: item}}
                    style={styles.images}
                  />
                </View>
              );
            })}
            <TouchableOpacity
              style={styles.btnAdd}
              onPress={OpenLibrary}
            >
              <Feather
                name="plus"
                color={'#252B5C'}
                size={25}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.btnFinish, {marginBottom: 100}]}
            activeOpacity={0.8}
            onPress={handleOpenPress}
          >
            <Text style={styles.txtFinish}>{t('submit')}</Text>
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
            <Text style={[styles.titleNormal, {marginTop: 24}]}>
              Successfully
            </Text>
            <Text style={styles.titleHighlight}>submitted your review</Text>
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
            <Text style={styles.titleHighlight}>submitted your review</Text>
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
  btnAdd: {
    width: 78,
    height: 78,
    backgroundColor: '#F5F4F8',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 10,
  },
  viewImage: {
    flexDirection: 'row',
    marginLeft: 14,
    flexWrap: 'wrap',
  },
  viewImages: {
    width: screenWidth / 2 - 34,
    height: screenWidth / 2 - 34,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 10,
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
});
