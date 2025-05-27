import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {faceAuthService} from '@/services/faceAuthService';
import {screenWidth, screenHeight} from '@/themes/Responsive';
import {useTranslation} from 'react-i18next';

interface FaceCaptureProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (imagePath: string) => void;
  onError: (error: string) => void;
  title?: string;
  subtitle?: string;
  isRegisterFlow?: boolean;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({
  isVisible,
  onClose,
  onSuccess,
  onError,
  title,
  subtitle,
  isRegisterFlow = false,
}) => {
  const {t} = useTranslation();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible && !capturedImage && !permissionError) {
      handleCaptureFace();
    }
  }, [isVisible]);

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleCaptureFace = async () => {
    try {
      setLoading(true);
      const imagePath = await faceAuthService.captureFace();
      console.log('FaceCapture: Image captured successfully:', imagePath);
      setCapturedImage(imagePath);
      setLoading(false);
      
      setValidating(true);
      console.log('FaceCapture: Validating image with API...');
      
      let validationResult;
      if (isRegisterFlow) {
        validationResult = await faceAuthService.validateFaceWithoutAuth(imagePath);
      } else {
        validationResult = await faceAuthService.validateFace(imagePath);
      }
      
      console.log('FaceCapture: Validation result:', validationResult);
      setValidating(false);
      
      if (validationResult.success) {
        console.log('FaceCapture: Validation successful, calling onSuccess with image path');
        onSuccess(imagePath);
      } else {
        console.log('FaceCapture: Validation failed, showing error');
        setCapturedImage(null);
        onError(validationResult.message || t('Face detection failed'));
      }
    } catch (error) {
      console.error('FaceCapture: Error during capture process:', error);
      setLoading(false);
      setValidating(false);
      
      setCapturedImage(null);
      
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError(t('Failed to capture face. Please try again.'));
      }
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    handleCaptureFace();
  };

  const handleCancel = () => {
    setCapturedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
            <Ionicons name="close" size={30} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.title}>{title || t('Face Authentication')}</Text>
          <Text style={styles.subtitle}>
            {subtitle || t('Please look at the camera and keep your face visible')}
          </Text>
          
          <View style={styles.imageContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>{t('Opening camera...')}</Text>
              </View>
            ) : validating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>{t('Validating face...')}</Text>
              </View>
            ) : permissionError ? (
              <View style={styles.permissionErrorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
                <Text style={styles.permissionErrorText}>
                  {t('Camera permission required')}
                </Text>
                <TouchableOpacity 
                  style={styles.settingsButton}
                  onPress={handleOpenSettings}
                >
                  <Text style={styles.settingsButtonText}>
                    {t('Open Settings')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={handleCaptureFace}
                >
                  <Text style={styles.retryButtonText}>
                    {t('Try Again')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : capturedImage ? (
              <Image source={{uri: capturedImage}} style={styles.image} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="person-circle-outline" size={100} color="#CCC" />
                <Text style={styles.placeholderText}>{t('No image captured')}</Text>
              </View>
            )}
          </View>
          
          {capturedImage && !validating && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetakePhoto}
              >
                <Ionicons name="camera-reverse" size={20} color="#FFF" />
                <Text style={styles.buttonText}>{t('Retake')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#999',
  },
  permissionErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionErrorText: {
    marginTop: 10,
    marginBottom: 20,
    color: '#FF3B30',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  retryButton: {
    padding: 10,
  },
  retryButtonText: {
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  retakeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default FaceCapture; 