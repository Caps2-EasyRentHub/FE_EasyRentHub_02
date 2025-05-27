import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {faceAuthService} from '@/services/faceAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {screenWidth} from '@/themes/Responsive';
import Feather from 'react-native-vector-icons/Feather';

type RootStackParamList = {
  HomeScreen: undefined;
  Login: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const FaceAuthScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState<'intro' | 'capture' | 'processing' | 'validate' | 'register' | 'success' | 'error'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCapture = async () => {
    try {
      setIsLoading(true);
      setStep('capture');
      
      const imagePath = await faceAuthService.captureFace();
      console.log('Captured image path:', imagePath);
      
      setCapturedImage(imagePath);
      setStep('validate');
      
      console.log('Validating face image...');
      const validationResult = await faceAuthService.validateFace(imagePath);
      console.log('Validation result:', validationResult);
      
      if (!validationResult.success) {
        setStep('error');
        setErrorMessage(validationResult.message || 'Không nhận diện được khuôn mặt rõ ràng');
        return;
      }
      
      setStep('register');
      console.log('Registering face...');
      const registrationResult = await faceAuthService.registerFace(imagePath);
      console.log('Registration result:', registrationResult);
      
      if (registrationResult.success) {
        await AsyncStorage.setItem('hasFaceRegistered', 'true');
        await AsyncStorage.setItem('firstLogin', 'false');
        
        setStep('success');
        setTimeout(() => {
          navigation.navigate('HomeScreen');
        }, 1500);
      } else {
        setStep('error');
        setErrorMessage(registrationResult.message || 'Đăng ký khuôn mặt thất bại');
      }
    } catch (error) {
      console.error('Error in face capture/registration:', error);
      setStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    startCapture();
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('firstLogin', 'false');
    Toast.show({
      type: 'info',
      text1: 'Bỏ qua đăng ký khuôn mặt',
      text2: 'Bạn cần đăng ký khuôn mặt để đăng bài và thuê phòng',
    });
    navigation.navigate('HomeScreen');
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <View style={styles.centerContent}>
            <Feather name="user" size={80} color="#1F4C6B" style={styles.introIcon} />
            <Text style={styles.introTitle}>Đăng ký khuôn mặt</Text>
            <Text style={styles.introText}>
              Bạn cần đăng ký khuôn mặt để có thể đăng bài cho thuê hoặc thuê trọ. 
              Ảnh khuôn mặt được lưu trữ an toàn và chỉ dùng để xác thực danh tính.
            </Text>
            
            <TouchableOpacity style={styles.startButton} onPress={startCapture}>
              <Text style={styles.startButtonText}>Bắt đầu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Bỏ qua (có thể đăng ký sau)</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'capture':
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#1F4C6B" />
            <Text style={styles.loadingText}>Đang mở camera...</Text>
          </View>
        );

      case 'validate':
      case 'register':
      case 'processing':
        return (
          <View style={styles.centerContent}>
            {capturedImage && (
              <Image 
                source={{uri: capturedImage}} 
                style={styles.previewImage} 
                resizeMode="cover"
              />
            )}
            <ActivityIndicator size="large" color="#1F4C6B" style={styles.loader} />
            <Text style={styles.loadingText}>
              {step === 'validate' ? 'Đang kiểm tra ảnh...' : 
               step === 'register' ? 'Đang đăng ký khuôn mặt...' : 'Đang xử lý...'}
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.centerContent}>
            <Feather name="check-circle" size={80} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.successTitle}>Đăng ký thành công</Text>
            <Text style={styles.successText}>Khuôn mặt của bạn đã được đăng ký</Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContent}>
            <Feather name="alert-circle" size={80} color="#FF3B30" style={styles.errorIcon} />
            <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Bỏ qua</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đăng ký khuôn mặt</Text>
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  introIcon: {
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    marginBottom: 15,
  },
  introText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#1F4C6B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    width: screenWidth - 80,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    textAlign: 'center',
  },
  previewImage: {
    width: 300,
    height: 400,
    borderRadius: 15,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    textAlign: 'center',
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#1F4C6B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  skipButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
  },
});

export default FaceAuthScreen;