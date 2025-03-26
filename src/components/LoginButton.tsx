import {StyleSheet, Text, View} from 'react-native';
import React, {memo} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {screenWidth} from '@/themes/Responsive';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '@/utils/type';
import {useTranslation} from 'react-i18next';
import {navigate} from '@/navigation/NavigationUtils';

const LoginButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const {t} = useTranslation();
  return (
    <View style={{alignItems: 'center'}}>
      <TouchableOpacity
        onPress={() => navigate({name: 'HomeScreen'})}
        style={{
          flexDirection: 'row',
          width: screenWidth - 96,
          height: 63,
          backgroundColor: '#8BC83F',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontFamily: 'Lato-Bold',
            padding: 6,
          }}
        >
          {t('login')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(LoginButton);

const styles = StyleSheet.create({});
