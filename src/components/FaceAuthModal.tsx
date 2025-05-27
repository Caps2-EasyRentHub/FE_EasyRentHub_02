import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {screenWidth, screenHeight} from '@/themes/Responsive';
import {useTranslation} from 'react-i18next';
import {faceAuthService} from '@/services/faceAuthService';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';

interface FaceAuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRegisterSuccess: () => void;
}

const FaceAuthModal: React.FC<FaceAuthModalProps> = ({
  isVisible,
  onClose,
  onRegisterSuccess,
}) => {
  const {t} = useTranslation();
  const [step, setStep] = useState<'intro' | 'capture' | 'validation' | 'success'>('intro');
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = () => {
    setStep('intro');
    setCapturedImage(null);
    setErrorMessage(null);
    setLoading(false);
  };

  const handleStartCapture = async () => {
    try {
      setLoading(true);
      setStep('capture');
      setErrorMessage(null);
      
      const imagePath = await faceAuthService.captureFace();
      
      if (!imagePath) {
        setErrorMessage('Không thể chụp được ảnh khuôn mặt');
        setStep('intro');
        setLoading(false);
        return;
      }
      
      console.log('Image captured at:', imagePath);
      setCapturedImage(imagePath);
      setStep('validation');
      
      const validationResult = await faceAuthService.validateFace(imagePath);
      console.log('Validation result:', validationResult);
      
      if (!validationResult.success) {
        setErrorMessage(validationResult.message || 'Xác thực khuôn mặt thất bại');
        setStep('intro');
        Toast.show({
          type: 'error',
          text1: t('Face Validation Failed'),
          text2: validationResult.message,
        });
        return;
      }
      
      const registrationResult = await faceAuthService.registerFace(imagePath);
      console.log('Registration result:', registrationResult);
      
      if (registrationResult.success) {
        setStep('success');
        Toast.show({
          type: 'success',
          text1: t('Registration Successful'),
          text2: t('Your face has been registered successfully'),
        });
        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      } else {
        setErrorMessage(registrationResult.message || 'Đăng ký khuôn mặt thất bại');
        setStep('intro');
        Toast.show({
          type: 'error',
          text1: t('Registration Failed'),
          text2: registrationResult.message,
        });
      }
    } catch (error) {
      console.error('Error in face capture/registration:', error);
      setStep('intro');
      const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
      setErrorMessage(errorMsg);
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Toast.show({
      type: 'info',
      text1: t('Face Registration Skipped'),
      text2: t('You can register your face later in settings'),
    });
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <>
            <Text style={styles.title}>{t('Face Registration')}</Text>
            <Text style={styles.subtitle}>
              {t('We need to register your face for future verification when posting or renting')}
            </Text>
            
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartCapture}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('Start Face Registration')}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>{t('Skip for Now')}</Text>
            </TouchableOpacity>
            
            <Text style={styles.infoText}>
              {t('Note: Face registration is required for posting properties and renting rooms')}
            </Text>
          </>
        );
        
      case 'capture':
        return (
          <>
            <Text style={styles.title}>{t('Capturing Face')}</Text>
            <Text style={styles.subtitle}>{t('Please look directly at the camera')}</Text>
            
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>{t('Opening camera...')}</Text>
            </View>
          </>
        );
        
      case 'validation':
        return (
          <>
            <Text style={styles.title}>{t('Processing')}</Text>
            <Text style={styles.subtitle}>{t('Validating and registering your face')}</Text>
            
            {capturedImage && (
              <Image 
                source={{uri: capturedImage}} 
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>{t('Please wait...')}</Text>
            </View>
          </>
        );
        
      case 'success':
        return (
          <>
            <Feather name="check-circle" size={60} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.title}>{t('Registration Successful')}</Text>
            <Text style={styles.subtitle}>
              {t('Your face has been registered successfully')}
            </Text>
            <Text style={styles.loadingText}>{t('Redirecting...')}</Text>
          </>
        );
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        if (!loading && step !== 'validation') {
          resetState();
          onClose();
        }
      }}>
      <View style={styles.container}>
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: screenWidth * 0.85,
    maxHeight: screenHeight * 0.7,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#1F4C6B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
  },
  skipButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  skipButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontFamily: 'Lato-Medium',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#53587A',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#FF3B30',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  successIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  }
});

export default FaceAuthModal; 