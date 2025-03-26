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

const Register = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(true);
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
            color={'#252B5C'}
          />
        </View>
        <TextInput
          placeholder="Họ và tên"
          style={[
            styles.input,
            {fontFamily: fullName ? 'Lato-Bold' : 'Lato-Regular'},
          ]}
          placeholderTextColor={'#A1A5C1'}
          onChangeText={(text) => setFullName(text)}
          value={fullName}
        />
      </View>
      <View style={{marginTop: 25}}>
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
        />
      </View>
      <View style={{marginTop: 25}}>
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
          }}
          activeOpacity={0.7}
          onPress={() => navigate({name: 'Location'})}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Lato-Bold',
              padding: 6,
            }}
          >
            Đăng ký
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
});
