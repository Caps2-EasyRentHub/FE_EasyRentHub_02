import {StyleSheet, View, ActivityIndicator} from 'react-native';
import React from 'react';

const Splash = () => {
  return (
    <View style={styles.loading}>
      <ActivityIndicator
        size="large"
        color="#8BC83F"
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
