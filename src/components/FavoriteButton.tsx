import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {screenWidth} from '@/themes/Responsive';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';

const FavoriteButton = (item: any) => {
  const {userToken} = useContext(AuthContext);
  const [status, setStatus] = useState(item.favorite);

  const handleLike = (status: boolean) => {
    if (status === false) {
      fetch(`${Config.API_URL}/api/estate/${item.id}/like`, {
        method: 'PATCH',
        headers: {Authorization: userToken},
      });
    } else {
      fetch(`${Config.API_URL}/api/estate/${item.id}/unlike`, {
        method: 'PATCH',
        headers: {Authorization: userToken},
      });
    }
    setStatus(!status);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.viewButton,
          {
            backgroundColor: status ? '#8BC83F' : '#F5F4F8',
            width: item.size ? 50 : 25,
            height: item.size ? 50 : 25,
            top: item.size ? 24 : 8,
            left: item.size ? screenWidth - 74 : 7,
          },
        ]}
        onPress={() => handleLike(status)}
        activeOpacity={0.5}
      >
        {status ? (
          <AntDesign
            name="heart"
            size={item.size ? 22 : 8}
            color={'#FFFFFF'}
          />
        ) : (
          <AntDesign
            name="hearto"
            size={item.size ? 22 : 8}
            color={'#FD5F4A'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FavoriteButton;

const styles = StyleSheet.create({
  viewButton: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
});
