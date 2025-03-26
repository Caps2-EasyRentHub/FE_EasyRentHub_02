import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo, useEffect} from 'react';
import {Facebook_Icon} from '@/assets/Svg';
import {screenWidth} from '@/themes/Responsive';
import {Settings, LoginManager, AccessToken} from 'react-native-fbsdk-next';

Settings.setAppID('625209123157341');
Settings.initializeSDK();
const FacebookButton = () => {
  // useEffect(() => {
  //   AccessToken.getCurrentAccessToken().then((data) => {
  //     if (data) {
  //       console.log(data?.accessToken.toString());
  //     }
  //   });
  // }, []);

  const handleLogin = () => {
    LoginManager.logInWithPermissions(['public_profile']).then(
      (result) => {
        if (result.isCancelled) {
          console.log('Đăng nhập bị hủy bỏ');
        } else {
          console.log('Đăng nhập thành công');
          AccessToken.getCurrentAccessToken().then((data) => {
            console.log(data?.accessToken.toString());
          });
        }
      },
      (error) => {
        console.log('Đăng nhập thất bại', error);
      },
    );
  };
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
          marginLeft: 10,
          marginTop: 20,
        }}
        activeOpacity={0.3}
        onPress={handleLogin}
      >
        <Facebook_Icon />
      </TouchableOpacity>
    </View>
  );
};

export default memo(FacebookButton);

const styles = StyleSheet.create({});
