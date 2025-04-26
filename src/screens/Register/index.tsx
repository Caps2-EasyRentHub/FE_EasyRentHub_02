import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import BackButton from '@/components/BackButton';
import {Email_Icon} from '@/assets/Svg';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {screenWidth} from '@/themes/Responsive';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '@/utils/type';
import {navigate} from '@/navigation/NavigationUtils';
import {authService} from '@/services/authService';
import {Snackbar} from 'react-native-paper';

const Register = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  // Thêm state cho Snackbar
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setVisible(true);
  };

  const onDismissSnackBar = () => setVisible(false);

  // Thêm state cho validation
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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
    return Object.values(newErrors).every(error => error === '');
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
        'Tenant'
      );
      showSnackbar('Đăng ký thành công!', 'success');
      setTimeout(() => {
        navigate({name: 'Login'});
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.message === 'This user name already exits' 
        ? 'Người dùng đã tồn tại' 
        : error.message || 'Đăng ký thất bại';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 124,
          marginLeft: 24,
        }}
      >
        <Text
          style={{color: '#252B5C', fontFamily: 'Lato-Medium', fontSize: 25}}
        >
          Tạo{' '}
        </Text>
        <Text style={{color: '#1F4C6B', fontFamily: 'Lato-Bold', fontSize: 25}}>
          tài khoản của bạn
        </Text>
      </View>
      <View style={{marginTop: 74}}>
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
      <View style={{marginTop: 25}}>
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
      <View style={{marginTop: 25}}>
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
      <View style={{marginTop: 25}}>
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
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          marginHorizontal: 24,
          marginTop: 10,
        }}
      >
        <TouchableOpacity>
          <Text style={styles.text}>Điều khoản dịch vụ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.6}
        >
          <Text style={styles.text}>
            {showPassword ? 'Hiện ' : 'Ẩn '}mật khẩu
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center', marginTop: 24}}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            width: screenWidth - 96,
            height: 63,
            backgroundColor: '#8BC83F',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
          }}
          activeOpacity={0.7}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Lato-Bold',
              padding: 6,
            }}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Text>
        </TouchableOpacity>

        <View style={{marginTop: 20, flexDirection: 'row'}}>
          <Text style={[styles.text, {fontSize: 14, color: '#53587A', fontFamily: 'Lato-Regular'}]}>
            Đã có tài khoản?{' '}
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigate({name: 'Login'})}>
            <Text style={[styles.text, {fontSize: 14, color: '#1F4C6B', fontFamily: 'Lato-Bold'}]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={3000}
        style={{
          backgroundColor: snackbarMessage === 'This user name already exits' 
            ? '#F5F4F8' 
            : snackbarType === 'success' 
              ? '#4CAF50' 
              : '#FF3B30',
        }}
        action={{
          label: 'Đóng',
          onPress: onDismissSnackBar,
        }}>
        <Text style={{ 
          color: snackbarMessage === 'This user name already exits' 
            ? '#252B5C' 
            : '#FFFFFF' 
        }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    top: 25,
    left: 40,
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
    fontFamily: 'Lato-Regular',
  },
});
