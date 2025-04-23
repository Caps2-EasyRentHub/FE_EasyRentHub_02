import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {getImages} from '@/assets/Images';
import {Email_Icon} from '@/assets/Svg';
import Feather from 'react-native-vector-icons/Feather';
import Separator from '@/components/Separator';
import GoogleButton from '@/components/GoogleButton';
import FacebookButton from '@/components/FacebookButton';
import {screenWidth} from '@/themes/Responsive';
import BackButton from '@/components/BackButton';
import {useTranslation} from 'react-i18next';
import {navigate} from '@/navigation/NavigationUtils';
import {AuthContext} from '@/context/AuthContext';
import Loading from '@/components/Loading';

const Login = () => {
  const {login} = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('please_fill_all_fields'));
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      Alert.alert(t('success'), t('login_successful'));
    } catch (error) {
      Alert.alert(
        t('error'),
        error instanceof Error ? error.message : t('login_failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loading />}
      <View style={{zIndex: isLoading ? 0 : 1}}>
        <BackButton />
      </View>

      <Image
        source={getImages().city}
        style={styles.headerImage}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
          marginLeft: 29,
        }}
      >
        <Text
          style={{color: '#252B5C', fontFamily: 'Lato-Medium', fontSize: 25}}
        >
          {t('let')}{' '}
        </Text>
        <Text style={{color: '#1F4C6B', fontFamily: 'Lato-Bold', fontSize: 25}}>
          {t('sign_in')}
        </Text>
      </View>
      <View style={{marginTop: 74}}>
        <View style={styles.icon}>
          <Email_Icon color="#252B5C" />
        </View>
        <TextInput
          placeholder="Email"
          style={[
            styles.input,
            {fontFamily: email ? 'Lato-Bold' : 'Lato-Regular'},
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => setEmail(text)}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View style={{marginTop: 15}}>
        <View style={styles.icon}>
          <Feather
            name="lock"
            size={20}
            color={'#252B5C'}
          />
        </View>
        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry={showPassword}
          style={[
            styles.input,
            {fontFamily: password ? 'Lato-Bold' : 'Lato-Regular'},
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => setPassword(text)}
          value={password}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          marginHorizontal: 24,
          marginTop: 10,
        }}
      >
        <TouchableOpacity>
          <Text style={styles.text}>{t('forgot_password')}?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.6}
        >
          <Text style={styles.text}>
            {showPassword ? t('show_password') : t('hide_password')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{marginTop: 50}}>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.btnLogin}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.txtLogin}>{t('login')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={{marginTop: 10}}>
        <Separator />
      </View>
      <View style={{flexDirection: 'row'}}>
        <GoogleButton />
        <FacebookButton />
      </View>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 35,
          marginBottom: 50,
        }}
        activeOpacity={0.5}
        onPress={() => navigate({name: 'Register'})}
      >
        <Text
          style={{fontSize: 14, color: '#53587A', fontFamily: 'Lato-Regular'}}
        >
          {t('no_account')}?{' '}
        </Text>
        <Text style={{fontSize: 14, color: '#1F4C6B', fontFamily: 'Lato-Bold'}}>
          {t('register')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  indicator: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    height: 175,
    zIndex: -1,
  },
  input: {
    color: '#252B5C',
    fontSize: 15,
    height: 70,
    marginHorizontal: 24,
    paddingHorizontal: 46,
    borderRadius: 10,
    backgroundColor: '#F5F4F8',
    zIndex: -1,
  },
  icon: {
    position: 'absolute',
    alignItems: 'center',
    flex: 1,
    top: 25,
    left: 40,
  },
  btnLogin: {
    flexDirection: 'row',
    width: screenWidth - 96,
    height: 63,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtLogin: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    padding: 6,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Lato-Black',
    color: '#234F68',
  },
});
