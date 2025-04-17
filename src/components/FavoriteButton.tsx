import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useContext, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {screenWidth} from '@/themes/Responsive';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {observer} from 'mobx-react-lite';
import notificationStore from '@/stores/NotificationStore';

const FavoriteButton = (item: any) => {
  const {userToken} = useContext(AuthContext);
  const [status, setStatus] = useState(item.favorite);

  const handleLike = async (status: boolean) => {
    if (status === false) {
      await fetch(`${Config.API_URL}/api/estate/${item.id}/like`, {
        method: 'PATCH',
        headers: {Authorization: userToken},
      });
      // Kiểm tra trạng thái phòng khi yêu thích
      await notificationStore.checkEstateStatus(item.id, userToken);
    } else {
      await fetch(`${Config.API_URL}/api/estate/${item.id}/unlike`, {
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

export default observer(FavoriteButton);

const styles = StyleSheet.create({
  viewButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    zIndex: 1,
  },
});
