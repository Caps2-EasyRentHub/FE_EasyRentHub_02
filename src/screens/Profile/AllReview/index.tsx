import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {BackButton} from '@/components';
import {ReviewDetail, ReviewItems} from '@/utils/interface';
import {useTranslation} from 'react-i18next';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {screenWidth} from '@/themes/Responsive';
import StarRating from '@/components/StarRating';
import {getImages} from '@/assets/Images';

const AllReview = () => {
  const {t} = useTranslation();
  const review = [
    {
      id: 1,
      name: 'Hung',
      avatar: getImages().picture_1,
      address: 'Việt Nam',
      phone: '123456789',
      email: 'admin@gmail.com',
      reviews: {
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        images: [
          getImages().picture_4,
          getImages().picture_5,
          getImages().picture_3,
          getImages().picture_4,
          getImages().picture_5,
          getImages().picture_3,
        ],
        star_rating: 5,
      },
    },
    {
      id: 2,
      name: 'Tony',
      avatar: getImages().picture_2,
      address: 'Việt Nam',
      phone: '123456789',
      email: 'admin@gmail.com',
      reviews: {
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        images: [getImages().picture_4, getImages().picture_5],
        star_rating: 2,
      },
    },
  ];
  const estate = [
    {
      id: 1,
      name: 'Hung',
      avatar: getImages().picture_1,
      address: 'Việt Nam',
      phone: '123456789',
      email: 'admin@gmail.com',
      assets: {
        images: [
          getImages().picture_1,
          getImages().picture_2,
          getImages().picture_3,
          getImages().picture_4,
          getImages().picture_5,
        ],
        name: 'Sky Dandelions Apartment',
        location: 'K814 Tran Cao Van,TP.Đà Nẵng, Việt Nam',
        star_rating: 4.5,
        price: 290,
        bathroom: 2,
        bedroom: 2,
        floors: 2,
        time: 'month',
        favorite: true,
      },
    },
    {
      id: 2,
      name: 'Tony',
      avatar: getImages().picture_2,
      address: 'Việt Nam',
      phone: '123456789',
      email: 'admin@gmail.com',
      assets: {
        images: [
          getImages().picture_4,
          getImages().picture_5,
          getImages().picture_3,
        ],
        name: 'Sky Dandelions Apartment',
        location: 'K814 Tran Cao Van,TP.Đà Nẵng, Việt Nam',
        star_rating: 4.7,
        price: 160,
        bathroom: 2,
        bedroom: 3,
        floors: 2,
        time: 'month',
        favorite: false,
      },
    },
  ];
  const star = [1, 2, 3, 4, 5, 6];
  const [pressStar, setPressStar] = useState(0);

  const Agency = () => {
    return (
      <View style={styles.agencyView}>
        <View style={styles.agencyContent}>
          <Image
            source={getImages().picture_1}
            style={styles.avatar}
          />
          <View style={styles.cardAgencyContent}>
            <Text style={styles.cardName}>UserName</Text>

            <View style={styles.ratingView}>
              <Text style={styles.name}>name</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const Reviews = ({item, index}: {item: ReviewItems; index: number}) => {
    return (
      <View
        key={index}
        style={styles.reviewView}
      >
        <View style={styles.estateView}>
          <View style={styles.estateContent}>
            <Image
              source={getImages().picture_1}
              style={styles.estateImage}
            />
            <View style={styles.cardEstateContent}>
              <Text style={styles.cardName}>Fairview Apartment</Text>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.ratingView}>
                  <Entypo
                    name="star"
                    color={'#234F68'}
                    size={10}
                  />
                  <Text style={styles.rating}>4.5</Text>
                </View>
                <View style={styles.ratingView}>
                  <FontAwesome6
                    name="location-dot"
                    color={'#234F68'}
                    size={9}
                    style={{marginLeft: 6}}
                  />
                  <Text style={styles.location}>
                    K814 Tran Cao Van,TP.Đà Nẵng, Việt Nam
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.reviewContent}>
          <View style={styles.outsideAvatar}>
            <Image
              source={item.avatar}
              style={styles.reviewAvatar}
            />
          </View>

          <View
            style={{
              width: screenWidth - 128,
              marginHorizontal: 10,
            }}
          >
            <View style={styles.reviewStar}>
              <Text style={styles.reviewName}>{item.name}</Text>
              <View style={styles.star}>
                <StarRating star={item.reviews.star_rating} />
              </View>
            </View>
            <Text style={styles.reviewText}>{item.reviews.content}</Text>
            <View style={styles.reviewImagesView}>
              {item.reviews.images.map((image: any, index: number) => {
                return (
                  <Image
                    key={index}
                    source={image}
                    style={styles.reviewImages}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.component}>
      <BackButton />
      <View style={styles.titleView}>
        <Text style={styles.titleText}>{t('all_reviews')}</Text>
      </View>
      <Agency />
      <View style={styles.starView}>
        <ScrollView horizontal>
          {star.map((_, index: number) => {
            return (
              <TouchableOpacity
                key={index}
                style={
                  pressStar === index
                    ? styles.starContentActive
                    : styles.starContent
                }
                onPress={() => setPressStar(index)}
              >
                <View style={styles.star}>
                  <Text>⭐ </Text>
                  <Text
                    style={
                      pressStar === index
                        ? styles.starTextActive
                        : styles.starText
                    }
                  >
                    {index === 0 ? t('all') : index}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView>
        <Text style={styles.reviewTitle}>{t('user_reviews')}</Text>
        {review.map((item: ReviewItems, index: number) => {
          return pressStar === 0 ? (
            <Reviews
              item={item}
              index={index}
              key={index}
            />
          ) : pressStar === item.reviews.star_rating ? (
            <Reviews
              item={item}
              index={index}
              key={index}
            />
          ) : null;
        })}
      </ScrollView>
    </View>
  );
};

export default AllReview;

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  titleView: {
    alignItems: 'center',
  },
  titleText: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 40,
  },
  agencyView: {
    marginHorizontal: 24,
    marginTop: 35,
    borderRadius: 20,
    backgroundColor: '#F5F4F8',
  },
  estateContent: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 17,
    flexDirection: 'row',
  },
  estateView: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDF3',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  cardEstateContent: {
    marginLeft: 10,
  },
  estateImage: {
    height: 36,
    width: 74,
    borderRadius: 8,
  },
  location: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 2,
    width: screenWidth / 2 + 10,
    height: 12,
    fontSize: 12,
  },
  agencyContent: {
    marginTop: 14,
    marginBottom: 18,
    marginLeft: 14,
    flexDirection: 'row',
  },
  avatar: {
    height: 53,
    width: 53,
    borderRadius: 53,
  },
  cardAgencyContent: {
    width: screenWidth / 2 - 68,
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
    marginTop: 1,
  },
  rating: {
    color: '#53587A',
    fontSize: 11,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  name: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 2,
  },
  starView: {
    marginLeft: 24,
    marginBottom: 35,
  },
  starContent: {
    width: 75,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#F5F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginRight: 10,
  },
  starContentActive: {
    width: 75,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#1F4C6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginRight: 10,
  },

  star: {
    flexDirection: 'row',
  },
  starText: {
    color: '#252B5C',
  },
  starTextActive: {
    color: '#F5F4F8',
  },
  reviewTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginLeft: 24,
    marginBottom: 20,
  },
  reviewView: {
    backgroundColor: '#F5F4F8',
    marginHorizontal: 24,
    marginBottom: 10,
    borderRadius: 25,
  },
  reviewContent: {
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: 'row',
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 25,
  },
  outsideAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewName: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 15,
  },
  reviewText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  reviewStar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewImages: {
    width: 60,
    height: 60,
    borderRadius: 18,
    marginRight: 5,
  },
  reviewImagesView: {
    flexDirection: 'row',
    marginTop: 5,
    flexWrap: 'wrap',
  },
});
