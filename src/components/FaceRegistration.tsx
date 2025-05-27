import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {screenWidth, screenHeight} from '@/themes/Responsive';
import {useTranslation} from 'react-i18next';
import FaceCapture from './FaceCapture';

interface FaceRegistrationProps {
  isVisible: boolean;
  onClose: () => void;
  onRegister: (imagePath: string) => void;
  isLoading?: boolean;
}

const FaceRegistration: React.FC<FaceRegistrationProps> = ({
  isVisible,
  onClose,
  onRegister,
  isLoading = false,
}) => {
  const {t} = useTranslation();
  const [showCapture, setShowCapture] = useState(false);

  const handleStartCapture = () => {
    setShowCapture(true);
  };

  const handleCaptureSuccess = (imagePath: string) => {
    setShowCapture(false);
    onRegister(imagePath);
  };

  const handleCaptureError = (error: string) => {
    setShowCapture(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('Face Registration')}</Text>
          <Text style={styles.subtitle}>
            {t('We need to register your face for future verification when posting or renting')}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleStartCapture}
            >
              <Text style={styles.captureButtonText}>{t('Capture Face')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>{t('Skip (Not Recommended)')}</Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            {t('Note: Face registration is required for posting properties and renting rooms')}
          </Text>

          <FaceCapture
            isVisible={showCapture}
            onClose={() => setShowCapture(false)}
            onSuccess={handleCaptureSuccess}
            onError={handleCaptureError}
            title={t('Register Your Face')}
            subtitle={t('Please look directly at the camera')}
          />
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
    width: screenWidth * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#252B5C',
  },
  subtitle: {
    fontSize: 16,
    color: '#53587A',
    textAlign: 'center',
    marginBottom: 30,
  },
  captureButton: {
    backgroundColor: '#8BC83F',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 15,
    marginBottom: 20,
  },
  skipButtonText: {
    color: '#53587A',
    fontSize: 14,
  },
  infoText: {
    fontSize: 12,
    color: '#F97316',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default FaceRegistration; 