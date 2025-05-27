import {useState, useCallback} from 'react';
import {faceAuthService, FaceAuthResponse} from '@/services/faceAuthService';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum FaceAuthPurpose {
  REGISTER = 'register',
  VERIFY = 'verify',
}

interface UseFaceAuthProps {
  onSuccess?: (response: FaceAuthResponse) => void;
  onError?: (error: string) => void;
}

export const useFaceAuth = ({onSuccess, onError}: UseFaceAuthProps = {}) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [authPurpose, setAuthPurpose] = useState<FaceAuthPurpose>(
    FaceAuthPurpose.VERIFY,
  );

  const showFaceAuthModal = useCallback(
    (purpose: FaceAuthPurpose = FaceAuthPurpose.VERIFY) => {
      setAuthPurpose(purpose);
      setIsModalVisible(true);
    },
    [],
  );

  const hideFaceAuthModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleFaceCapture = useCallback(
    async (imagePath: string) => {
      try {
        console.log('useFaceAuth: handleFaceCapture called with image path');
        console.log('useFaceAuth: Current authPurpose is', authPurpose);
        setLoading(true);
        
        let response: FaceAuthResponse;
        
        if (authPurpose === FaceAuthPurpose.REGISTER) {
          console.log('useFaceAuth: Calling registerFace API');
          response = await faceAuthService.registerFace(imagePath);
        } else {
          console.log('useFaceAuth: Calling verifyFace API');
          response = await faceAuthService.verifyFace(imagePath);
        }
        
        console.log('useFaceAuth: API response:', response);
        setLoading(false);
        hideFaceAuthModal();
        
        if (response.success) {
          console.log('useFaceAuth: Authentication successful');
          Toast.show({
            type: 'success',
            text1: authPurpose === FaceAuthPurpose.REGISTER
              ? t('Face registered successfully')
              : t('Face verification successful'),
            text2: response.message,
            position: 'bottom',
            visibilityTime: 3000,
          });
          
          if (onSuccess) {
            console.log('useFaceAuth: Calling onSuccess callback');
            onSuccess(response);
          }
          
          return true;
        } else {
          console.log('useFaceAuth: Authentication failed:', response.message);
          Toast.show({
            type: 'error',
            text1: authPurpose === FaceAuthPurpose.REGISTER
              ? t('Face registration failed')
              : t('Face verification failed'),
            text2: response.message,
            position: 'bottom',
            visibilityTime: 3000,
          });
          
          if (onError) {
            onError(response.message);
          }
          
          return false;
        }
      } catch (error) {
        console.error('useFaceAuth: Error in handleFaceCapture:', error);
        setLoading(false);
        hideFaceAuthModal();
        
        const errorMessage = 
          error instanceof Error ? error.message : t('Authentication failed');
        
        console.log('useFaceAuth: Error message:', errorMessage);
        
        Toast.show({
          type: 'error',
          text1: authPurpose === FaceAuthPurpose.REGISTER
            ? t('Face registration failed')
            : t('Face verification failed'),
          text2: errorMessage,
          position: 'bottom',
          visibilityTime: 3000,
        });
        
        if (onError) {
          onError(errorMessage);
        }
        
        return false;
      }
    },
    [authPurpose, onSuccess, onError, t],
  );

  const handleFaceCaptureError = useCallback(
    (error: string) => {
      console.log('useFaceAuth: handleFaceCaptureError called with:', error);
      hideFaceAuthModal();
      Toast.show({
        type: 'error',
        text1: t('Face capture failed'),
        text2: error,
      });
      
      if (onError) {
        onError(error);
      }
    },
    [onError, t],
  );

  const checkVerificationStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        console.log('useFaceAuth: No valid token, requiring verification');
        return false;
      }
      
      const lastVerified = await AsyncStorage.getItem('face_verified_timestamp');
      const verificationPeriod = 5 * 60 * 1000;
      
      if (lastVerified && (Date.now() - parseInt(lastVerified)) < verificationPeriod) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  }, []);

  return {
    loading,
    isModalVisible,
    authPurpose,
    showFaceAuthModal,
    hideFaceAuthModal,
    handleFaceCapture,
    handleFaceCaptureError,
    checkVerificationStatus,
  };
}; 