import {StyleSheet, TouchableOpacity} from 'react-native';
import React, {memo} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {goBack} from '@/navigation/NavigationUtils';

const BackButton = () => {
  return (
    <TouchableOpacity
      onPress={() => goBack()}
      style={styles.back}
    >
      <Feather
        name="chevron-left"
        size={18}
        color={'#252B5C'}
      />
    </TouchableOpacity>
  );
};

export default memo(BackButton);

const styles = StyleSheet.create({
  back: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    position: 'absolute',
    top: 24,
    left: 24,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    zIndex: 1,
  },
});
