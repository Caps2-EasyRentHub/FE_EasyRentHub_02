import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {getImages} from '@/assets/Images';
import {Email_Icon} from '@/assets/Svg';
import Feather from 'react-native-vector-icons/Feather';
import Separator from '@/components/Separator';
import GoogleButton from '@/components/GoogleButton';
import FacebookButton from '@/components/FacebookButton';
import {screenWidth, screenHeight} from '@/themes/Responsive';
import {useTranslation} from 'react-i18next';
import {navigate} from '@/navigation/NavigationUtils';
import Loading from '@/components/Loading';
import {useAuth} from '@/hooks/useAuth';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Snackbar} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FaceAuthModal from '@/components/FaceAuthModal';
import {faceAuthService} from '@/services/faceAuthService';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  Login: undefined;
  OptionLogin: undefined;
  Home: undefined;
  Register: undefined;
  HomeScreen: undefined;
  FaceAuthScreen: undefined;
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

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const [showFaceRegistrationModal, setShowFaceRegistrationModal] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    const checkFirstLogin = async () => {
      const firstLoginFlag = await AsyncStorage.getItem('firstLogin');
      setIsFirstLogin(firstLoginFlag === 'true');
    };
    
    checkFirstLogin();
  }, []);

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

  const checkFaceRegistration = async () => {
    try {
      console.log('Checking if user has registered face');
      setIsLoading(true);
      
      const registrationStatus = await faceAuthService.checkRegistrationStatus();
      console.log('Face registration status:', registrationStatus);
      
      if (!registrationStatus.isRegistered) {
        console.log('User has not registered face, navigating to FaceAuthScreen');
        await AsyncStorage.setItem('firstLogin', 'true');
        navigation.navigate('FaceAuthScreen');
      } else {
        console.log('User has registered face, navigating to HomeScreen');
        await AsyncStorage.setItem('firstLogin', 'false');
        await AsyncStorage.setItem('hasFaceRegistered', 'true');
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      console.error('Error checking face registration:', error);
      navigation.navigate('HomeScreen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await login(email, password);
      
      if (response.access_token) {
        showSnackbar('Đăng nhập thành công', 'success');
        
        checkFaceRegistration();
      }
    } catch (error) {
      showSnackbar('Email hoặc mật khẩu không đúng', 'error');
      setIsLoading(false);
    }
  };

  const handleFaceRegistrationSuccess = () => {
    setShowFaceRegistrationModal(false);
    AsyncStorage.setItem('firstLogin', 'false');
    navigation.navigate('HomeScreen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}>
      {isLoading && <Loading />}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
      <Image
        source={getImages().city}
        style={styles.headerImage}
          resizeMode="cover"
      />
        <View style={styles.titleContainer}>
          <Text style={styles.titleMedium}>{t('let')}{' '}</Text>
          <Text style={styles.titleBold}>{t('sign_in')}</Text>
      </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
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
          
          <View style={styles.inputContainer}>
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
          
          <View style={styles.optionsContainer}>
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
          
        <Separator />
          
          <View style={styles.socialButtonsContainer}>
        <GoogleButton />
        <FacebookButton />
      </View>
          
      <TouchableOpacity
            style={styles.registerContainer}
        activeOpacity={0.5}
        onPress={() => navigate({name: 'Register'})}>
            <Text style={styles.registerText}>
          {t('no_account')}?{' '}
        </Text>
            <Text style={styles.registerBoldText}>
          {t('register')}
        </Text>
      </TouchableOpacity>
        </View>
      </ScrollView>

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

      {/* Face Registration Modal */}
      <FaceAuthModal
        isVisible={showFaceRegistrationModal}
        onClose={() => {
          setShowFaceRegistrationModal(false);
          navigation.navigate('HomeScreen');
        }}
        onRegisterSuccess={handleFaceRegistrationSuccess}
      />
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerImage: {
    height: Math.min(screenHeight * 0.25, 175),
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 29,
  },
  titleMedium: {
    color: '#252B5C', 
    fontFamily: 'Lato-Medium', 
    fontSize: 25
  },
  titleBold: {
    color: '#1F4C6B', 
    fontFamily: 'Lato-Bold', 
    fontSize: 25
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 12,
    marginTop: Math.min(screenHeight * 0.05, 30),
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    color: '#252B5C',
    fontSize: 15,
    height: Math.min(screenHeight * 0.08, 70),
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
    top: '25%',
    left: 40,
    zIndex: 1,
  },
  optionsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  btnLogin: {
    flexDirection: 'row',
    width: screenWidth - 96,
    height: Math.min(screenHeight * 0.07, 63),
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
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
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  registerText: {
    fontSize: 14,
    color: '#53587A',
    fontFamily: 'Lato-Regular'
  },
  registerBoldText: {
    fontSize: 14,
    color: '#1F4C6B', 
    fontFamily: 'Lato-Bold'
  },
});