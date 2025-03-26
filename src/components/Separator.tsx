import {Dimensions, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {screenWidth} from '@/themes/Responsive';

const Separator = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
      }}
    >
      <View
        style={{
          width: screenWidth / 2 - 44,
          height: 1.3,
          backgroundColor: '#ECEDF3',
        }}
      ></View>
      <Text
        style={{
          color: '#A1A5C1',
          fontSize: 10,
          fontFamily: 'Lato-Bold',
          paddingHorizontal: 10,
        }}
      >
        OR
      </Text>
      <View
        style={{
          width: screenWidth / 2 - 44,
          height: 1.3,
          backgroundColor: '#ECEDF3',
        }}
      ></View>
    </View>
  );
};

export default Separator;

const styles = StyleSheet.create({});
