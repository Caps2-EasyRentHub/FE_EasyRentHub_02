import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import React, {useCallback, useState} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';
import {push} from '@/navigation/NavigationUtils';
import Loading from '@/components/Loading';
import {GestureHandlerRefContext} from '@react-navigation/stack';

const AddEstateImages = ({route}: any) => {
  const {data} = route.params;
  const {t} = useTranslation();
  const [images, setImages] = useState<any>([]);
  const [img, setImg] = useState<any>([]);
  const uploadedImages: string[] = [];

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
  const handleDeleteImages = (index: any) => {
    const newArray = [...images];
    newArray.splice(index, 1);
    setImages(newArray);
  };
  const HandleNext = () => {
    console.log(img);
    if (img) {
      push({
        name: 'AddEstateInfo',
        params: {
          data: {
            name: data.name,
            listType: data.listType,
            address: {
              road: data.address.road,
              quarter: data.address.quarter,
              city: data.address.city,
              country: data.address.country,
              lat: data.address.lat,
              lng: data.address.lng,
            },
            images: img,
          },
        },
      });
    }
  };
  return (
    <View style={styles.component}>
      <BackButton />
      <View style={styles.pageTitle}>
        <Text style={styles.addList}>{t('add_listing')}</Text>
      </View>
      <View style={styles.titleView}>
        <Text style={styles.titleHighlight}>{t('add_photos')}</Text>
        <Text style={styles.titleNormal}>{t('to_list')}</Text>
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
        style={styles.btnNext}
        activeOpacity={0.8}
        onPress={HandleNext}
      >
        <Text style={styles.txtNext}>{t('next')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddEstateImages;

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  pageTitle: {
    alignItems: 'center',
  },
  addList: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
  },

  titleView: {
    flexDirection: 'row',
    marginTop: 35,
    marginBottom: 20,
    marginHorizontal: 24,
    flexWrap: 'wrap',
  },
  titleNormal: {
    fontFamily: 'Lato-Medium',
    color: '#000000',
    fontSize: 30,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
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
  btnNext: {
    width: screenWidth - 140,
    height: 54,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 26,
    position: 'absolute',
    left: 70,
  },
  txtNext: {
    fontFamily: 'Lato-Bold',
    color: '#FFF',
    fontSize: 16,
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
});
