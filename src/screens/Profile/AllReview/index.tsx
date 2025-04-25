import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {BackButton} from '@/components';
import {ReviewDetail, ReviewItems} from '@/utils/interface';
import {useTranslation} from 'react-i18next';
import FavoriteButton from '@/components/FavoriteButton';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {screenWidth} from '@/themes/Responsive';
import StarRating from '@/components/StarRating';
import {getImages} from '@/assets/Images';
import Splash from '@/components/Splash';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';

const AllReview = () => {
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [review, setReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const star = [1, 2, 3, 4, 5, 6];
  const [pressStar, setPressStar] = useState(0);

  useEffect(() => {
    fetchUserReviews();
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', userToken);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(`${Config.API_URL}/api/user/${idUser}`, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        if (result.user) {
          setUserData(result.user);
        }
      })
      .catch((error) => console.error('Error fetching user data: ', error));
  };

  const fetchUserReviews = () => {
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append('Authorization', userToken);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(`${Config.API_URL}/api/user-reviews/${idUser}`, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        const formattedReviews = (result.reviews || []).map((review) => {

          return {
            ...review,
            estateId: review.estateId || {},
            user: review.user || {},
          };
        });

        setReview(formattedReviews);
      })
      .catch((error) => console.error('Error fetching reviews: ', error))
      .finally(() => setLoading(false));
  };

  const Agency = () => {
    return (
      <View style={styles.agencyView}>
        {userData ? (
          <View style={styles.agencyContent}>
            <Image
              source={{uri: userData.avatar || ''}}
              style={styles.avatar}
            />
            <View style={styles.cardAgencyContent}>
              <Text style={styles.cardName}>
                {userData.full_name || 'User'}
              </Text>

              <View style={styles.ratingView}>
                <Text style={styles.name}>{userData.email || ''}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.agencyContent}>
            <View style={[styles.avatar, {backgroundColor: '#F5F4F8'}]} />
            <View style={styles.cardAgencyContent}>
              <Text style={styles.cardName}>Loading...</Text>
              <View style={styles.ratingView}>
                <Text style={styles.name}>Please wait</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const getUserName = (item) => {
    try {
      if (item.user && item.user.full_name) {
        return item.user.full_name;
      }
      return 'Unknown User';
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Unknown User';
    }
  };

  const Reviews = ({item, index}: {item: ReviewItems; index: number}) => {
    const estate = item.estateId || {};
    const userName = getUserName(item);

    return (
      <View
        key={index}
        style={styles.reviewView}
      >
        <View style={styles.estateView}>
          <View style={styles.estateContent}>
            <Image
              source={{
                uri: estate.images && estate.images[0] ? estate.images[0] : '',
              }}
              style={styles.estateImage}
            />
            <View style={styles.cardEstateContent}>
              <Text style={styles.cardName}>
                {estate.name || 'Unknown Estate'}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.ratingView}>
                  <Entypo
                    name="star"
                    color={'#234F68'}
                    size={10}
                  />
                  <Text style={styles.rating}>{item.star || 0}</Text>
                </View>
                <View style={styles.ratingView}>
                  <FontAwesome6
                    name="location-dot"
                    color={'#234F68'}
                    size={9}
                    style={{marginLeft: 6}}
                  />
                  <Text style={styles.location}>
                    {item.estate?.address?.road}, {item.estate?.address?.city},{' '}
                    {item.estate?.address?.country}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.reviewContent}>
          <View style={styles.outsideAvatar}>
            <Image
              source={{uri: item.user?.avatar || ''}}
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
              <Text style={styles.reviewName}>
                {item.user.full_name || 'Unknown User'}
              </Text>
              <View style={styles.star}>
                <StarRating star={item.star || 0} />
              </View>
            </View>
            <Text style={styles.reviewText}>{item.content}</Text>
            <View style={styles.reviewImagesView}>
              {(item.images || []).map((image: string, imgIndex: number) => {
                return (
                  <Image
                    key={imgIndex}
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
        {loading ? (
          <Splash />
        ) : (
          review.map((item: any, index: number) => {
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
          })
        )}
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
    width: 300,
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
    width: 300,
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
