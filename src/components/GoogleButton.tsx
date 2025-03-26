import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo} from 'react';
import {Google_Icon} from '@/assets/Svg';
import {screenWidth} from '@/themes/Responsive';

const GoogleButton = () => {
  return (
    <View>
      <TouchableOpacity
        style={{
          width: screenWidth / 2 - 29,
          height: 70,
          backgroundColor: '#F5F4F8',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 25,
          marginLeft: 24,
          marginTop: 20,
        }}
        activeOpacity={0.3}
      >
        <Google_Icon />
      </TouchableOpacity>
    </View>
  );
};

export default memo(GoogleButton);

const styles = StyleSheet.create({});
