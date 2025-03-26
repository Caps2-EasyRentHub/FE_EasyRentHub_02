import {StyleSheet, View, ActivityIndicator} from 'react-native';
import React from 'react';

const Loading = () => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator
        size="large"
        color="#8BC83F"
      />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({});
