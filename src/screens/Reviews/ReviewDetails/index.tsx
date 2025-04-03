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

const ReviewDetails: React.FC<ReviewDetail> = ({route}) => {
  const {t} = useTranslation();
  const {estate, reviews} = route.params;
  const star = [1, 2, 3, 4, 5, 6];
  const [pressStar, setPressStar] = useState(0);

  const EstateView = () => {
    return (
      <View style={styles.estateView}>
        <View style={styles.estateContent}>
          {/* <FavoriteButton favorite={estate.assets.favorite} /> */}
          <Image
            source={{uri: estate.images[0]}}
            style={styles.estateImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{estate.name}</Text>

            <View style={styles.ratingView}>
              <Entypo
                name="star"
                color={'#FFC42D'}
                size={10}
              />
              <Text style={styles.rating}>{estate.rating_star}</Text>
            </View>
            <View style={styles.ratingView}>
              <FontAwesome6
                name="location-dot"
                color={'#234F68'}
                size={9}
              />
              <Text style={styles.location}>
                {estate.address.road}, {estate.address.city}
              </Text>
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
        <View style={styles.reviewContent}>
          <View style={styles.ountsideAvatar}>
            <Image
              source={{uri: item.user.avatar}}
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
              <Text style={styles.reviewName}>{item.user.full_name}</Text>
              <View style={styles.star}>
                <StarRating star={item.star} />
              </View>
            </View>
            <Text style={styles.reviewText}>{item.content}</Text>
            <View style={styles.reviewImagesView}>
              {item.images.map((image: string, index: number) => {
                return (
                  <Image
                    key={index}
                    source={{uri: image}}
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
        <Text style={styles.titleText}>{t('reviews')}</Text>
      </View>
      <EstateView />
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
        {reviews.map((item: ReviewItems, index: number) => {
          return pressStar === 0 ? (
            <Reviews
              item={item}
              index={index}
              key={index}
            />
          ) : pressStar === item.star ? (
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

export default ReviewDetails;

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
  estateView: {
    marginHorizontal: 24,
    marginTop: 35,
    borderRadius: 20,
    backgroundColor: '#F5F4F8',
  },
  estateContent: {
    marginVertical: 8,
    marginLeft: 8,
    flexDirection: 'row',
  },
  estateImage: {
    height: 125,
    width: screenWidth / 2 - 24,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cardContent: {
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
    marginTop: 8,
  },
  rating: {
    color: '#53587A',
    fontSize: 11,
    fontFamily: 'Lato-Bold',
    marginLeft: 2,
  },
  location: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 2,
    fontSize: 12,
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
  ountsideAvatar: {
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
