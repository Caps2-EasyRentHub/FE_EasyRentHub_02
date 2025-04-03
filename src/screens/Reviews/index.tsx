import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {getImages} from '@/assets/Images';
import {ReviewItems, ReviewProps} from '@/utils/interface';
import {screenWidth} from '@/themes/Responsive';
import StarRating from '@/components/StarRating';
import {push} from '@/navigation/NavigationUtils';

const Reviews: React.FC<ReviewProps> = ({estate}) => {
  const {t} = useTranslation();

  return (
    estate.reviews.length > 0 && (
      <View>
        <Text style={styles.reviewTitle}>{t('reviews')}</Text>
        {estate.reviews.slice(0, 2).map((item: ReviewItems, index: number) => {
          return (
            <View
              key={index}
              style={styles.reviewView}
            >
              <View style={styles.reviewContent}>
                <View style={styles.outsideAvatar}>
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
        })}
        <TouchableOpacity
          style={styles.allReviewButton}
          onPress={() =>
            push({
              name: 'ReviewDetails',
              params: {estate, reviews: estate.reviews},
            })
          }
        >
          <Text style={styles.allReviewText}>{t('view_all_reviews')}</Text>
        </TouchableOpacity>
      </View>
    )
  );
};

export default Reviews;

const styles = StyleSheet.create({
  reviewTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    // marginTop: 35,
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
  star: {
    flexDirection: 'row',
    // paddingRight: 2.5,
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
  allReviewButton: {
    backgroundColor: '#F5F4F8',
    marginHorizontal: 24,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 35,
  },
  allReviewText: {
    color: '#1F4C6B',
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    marginVertical: 20,
  },
});
