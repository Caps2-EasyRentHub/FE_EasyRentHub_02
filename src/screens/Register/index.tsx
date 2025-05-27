import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import BackButton from '@/components/BackButton';
import {Email_Icon} from '@/assets/Svg';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {screenWidth, screenHeight} from '@/themes/Responsive';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '@/utils/type';
import {navigate} from '@/navigation/NavigationUtils';
import {authService} from '@/services/authService';
import {Snackbar} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '@/config';

const Register = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'Landlord' | 'Tenant'>('Tenant');

  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>(
    'success',
  );

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setVisible(true);
  };

  const onDismissSnackBar = () => setVisible(false);

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useFocusEffect(
    useCallback(() => {
      const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setShowPassword(true);
        setLoading(false);
        setRole('Tenant');
        setErrors({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      };

      resetForm();
    }, []),
  );

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!fullName) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await authService.register(
        fullName,
        email,
        password,
        confirmPassword,
        role,
      );

      showSnackbar('Đăng ký tài khoản thành công!', 'success');
      
      setTimeout(() => {
        navigate({name: 'Login'});
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error.message === 'This user name already exits'
          ? 'Người dùng đã tồn tại'
          : error.message || 'Đăng ký thất bại';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
      <BackButton />
        <View style={styles.headerContainer}>
          <Text style={styles.textMedium}>Tạo{' '}</Text>
          <Text style={styles.textBold}>tài khoản của bạn</Text>
      </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
        <View style={styles.icon}>
          <FontAwesome
            name="user-o"
            size={20}
            color={errors.fullName ? '#FF3B30' : '#252B5C'}
          />
        </View>
        <TextInput
          placeholder="Họ và tên"
          style={[
            styles.input,
            {fontFamily: fullName ? 'Lato-Bold' : 'Lato-Regular'},
            errors.fullName && styles.inputError,
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => {
            setFullName(text);
            setErrors({...errors, fullName: ''});
          }}
          value={fullName}
        />
        {errors.fullName ? (
          <Text style={styles.errorText}>{errors.fullName}</Text>
        ) : null}
      </View>
          
          <View style={styles.inputWrapper}>
        <View style={styles.icon}>
          <Email_Icon color={errors.email ? '#FF3B30' : '#252B5C'} />
        </View>
        <TextInput
          placeholder="Email"
          style={[
            styles.input,
            {fontFamily: email ? 'Lato-Bold' : 'Lato-Regular'},
            errors.email && styles.inputError,
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({...errors, email: ''});
          }}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}
      </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('Landlord')}
              activeOpacity={0.7}>
            <View style={styles.radioButton}>
              {role === 'Landlord' && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
            <Text style={styles.roleText}>Chủ trọ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('Tenant')}
              activeOpacity={0.7}>
            <View style={styles.radioButton}>
              {role === 'Tenant' && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.roleText}>Thuê trọ</Text>
          </TouchableOpacity>
      </View>

          <View style={styles.inputWrapper}>
        <View style={styles.icon}>
          <Feather
            name="lock"
            size={20}
            color={errors.password ? '#FF3B30' : '#252B5C'}
          />
        </View>
        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry={showPassword}
          style={[
            styles.input,
            {fontFamily: password ? 'Lato-Bold' : 'Lato-Regular'},
            errors.password && styles.inputError,
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => {
            setPassword(text);
            setErrors({...errors, password: ''});
          }}
          value={password}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
      </View>
          
          <View style={styles.inputWrapper}>
        <View style={styles.icon}>
          <Feather
            name="lock"
            size={20}
            color={errors.confirmPassword ? '#FF3B30' : '#252B5C'}
          />
        </View>
        <TextInput
          placeholder="Xác nhận mật khẩu"
          secureTextEntry={showPassword}
          style={[
            styles.input,
            {fontFamily: confirmPassword ? 'Lato-Bold' : 'Lato-Regular'},
            errors.confirmPassword && styles.inputError,
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors({...errors, confirmPassword: ''});
          }}
          value={confirmPassword}
        />
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}
      </View>
          
          <View style={styles.optionsContainer}>
        <TouchableOpacity>
          <Text style={styles.text}>Điều khoản dịch vụ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.6}>
          <Text style={styles.text}>
            {showPassword ? 'Hiện ' : 'Ẩn '}mật khẩu
          </Text>
        </TouchableOpacity>
      </View>
          
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Lưu ý: Sau khi đăng ký, bạn sẽ được yêu cầu xác thực khuôn mặt khi đăng nhập lần đầu. Xác thực khuôn mặt là bắt buộc để sử dụng các tính năng đăng bài cho thuê và đặt phòng.
            </Text>
          </View>
          
        <TouchableOpacity
            style={[styles.registerButton, loading ? styles.disabledButton : null]}
          activeOpacity={0.7}
          onPress={handleRegister}
            disabled={loading}>
            <Text style={styles.registerButtonText}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Text>
        </TouchableOpacity>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>
            Đã có tài khoản?{' '}
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
              onPress={() => navigate({name: 'Login'})}>
              <Text style={styles.loginBoldText}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={3000}
        style={{
          backgroundColor:
            snackbarType === 'success'
              ? '#4CAF50'
              : '#FF3B30',
        }}
        action={{
          label: 'Đóng',
          onPress: onDismissSnackBar,
        }}>
        <Text style={{color: '#FFFFFF'}}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Math.min(screenHeight * 0.1, 80),
    marginLeft: 24,
    marginBottom: 20,
  },
  textMedium: {
    color: '#252B5C',
    fontFamily: 'Lato-Medium', 
    fontSize: 25
  },
  textBold: {
    color: '#1F4C6B', 
    fontFamily: 'Lato-Bold', 
    fontSize: 25
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 12,
  },
  inputWrapper: {
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
    borderWidth: 1,
    borderColor: '#F5F4F8',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  icon: {
    position: 'absolute',
    alignItems: 'center',
    flex: 1,
    top: '30%',
    left: 40,
    zIndex: 1,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Lato-Black',
    color: '#234F68',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginLeft: 24,
    marginTop: 4,
    marginBottom: 5,
    fontFamily: 'Lato-Regular',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginVertical: 15,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4F8',
    padding: 15,
    borderRadius: 10,
    width: '48%',
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8BC83F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8BC83F',
  },
  roleText: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
  },
  optionsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 10,
  },
  noteContainer: {
    marginHorizontal: 24,
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#F5F8FF',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1F4C6B',
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    lineHeight: 20,
  },
  registerButton: {
    flexDirection: 'row',
    width: screenWidth - 96,
    height: Math.min(screenHeight * 0.07, 63),
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    padding: 6,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  loginText: {
    fontSize: 14,
    color: '#53587A',
    fontFamily: 'Lato-Regular',
  },
  loginBoldText: {
    fontSize: 14,
    color: '#1F4C6B',
    fontFamily: 'Lato-Bold',
  },
});
