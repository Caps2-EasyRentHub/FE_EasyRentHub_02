import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {BackButton} from '@/components';

const Notification = () => {
  return <View style={styles.component}></View>;
};

export default Notification;

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  btnDelete: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    position: 'absolute',
    top: 24,
    right: 24,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    zIndex: 1,
  },
});
