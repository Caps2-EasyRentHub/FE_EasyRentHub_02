import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';

const StarRating = ({star}: {star: number}) => {
  const totalStars = 5;
  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    let color = 'rgba(253,181,74,.5)';
    if (i <= star) {
      color = 'rgba(253,181,74,1)';
    }
    stars.push(
      <AntDesign
        name="star"
        color={color}
        style={{marginLeft: 2.5}}
        key={i}
      />,
    );
  }
  return stars;
};

export default StarRating;

const styles = StyleSheet.create({});
