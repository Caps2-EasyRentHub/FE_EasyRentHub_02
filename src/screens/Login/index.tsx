import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {getImages} from '@/assets/Images';
import {Email_Icon} from '@/assets/Svg';
import Feather from 'react-native-vector-icons/Feather';
import Separator from '@/components/Separator';
import GoogleButton from '@/components/GoogleButton';
import FacebookButton from '@/components/FacebookButton';
import {screenWidth} from '@/themes/Responsive';
import {useTranslation} from 'react-i18next';
import {navigate} from '@/navigation/NavigationUtils';
import Loading from '@/components/Loading';
import {useAuth} from '@/hooks/useAuth';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Snackbar} from 'react-native-paper';
import axios from 'axios';

type RootStackParamList = {
  Login: undefined;
  OptionLogin: undefined;
  Home: undefined;
  Register: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Login = () => {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  // State cho validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // State cho Snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError(t('Vui lòng nhập Email'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('Email không hợp lệ'));
      isValid = false;
    }

    if (!password) {
      setPasswordError(t('Vui lòng nhập Mật khẩu'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('Mật khẩu phải ít nhất 6 ký tự'));
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const response = await login(email, password);
      if (response.access_token) {
        showSnackbar('Đăng nhập thành công', 'success');
        navigation.navigate('HomeScreen');
        navigation.navigate('Home');
      }
    } catch (error) {
      showSnackbar('Email hoặc mật khẩu không đúng', 'error');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loading />}
      <View style={{zIndex: isLoading ? 0 : 1}}>
        {/* Không hiển thị nút Back */}
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
        }}>
        <Text
          style={{color: '#252B5C', fontFamily: 'Lato-Medium', fontSize: 25}}>
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
            emailError ? styles.inputError : null,
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>
      <View style={{marginTop: 15}}>
        <View style={styles.icon}>
          <Feather name="lock" size={20} color={'#252B5C'} />
        </View>
        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry={showPassword}
          style={[
            styles.input,
            {fontFamily: password ? 'Lato-Bold' : 'Lato-Regular'},
            passwordError ? styles.inputError : null,
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
          }}
          value={password}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
      </View>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          marginHorizontal: 24,
          marginTop: 10,
        }}>
        <TouchableOpacity>
          <Text style={styles.text}>{t('forgot_password')}?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.6}>
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
            disabled={isLoading}>
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
        onPress={() => navigate({name: 'Register'})}>
        <Text
          style={{fontSize: 14, color: '#53587A', fontFamily: 'Lato-Regular'}}>
          {t('no_account')}?{' '}
        </Text>
        <Text style={{fontSize: 14, color: '#1F4C6B', fontFamily: 'Lato-Bold'}}>
          {t('register')}
        </Text>
      </TouchableOpacity>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarType === 'success' ? '#4CAF50' : '#F44336',
        }}
        action={{
          label: 'Đóng',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
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
  inputError: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginLeft: 24,
    marginTop: 4,
    fontFamily: 'Lato-Regular',
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
