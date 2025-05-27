import axios from 'axios';
import {Config} from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import {Alert, Platform, PermissionsAndroid, Linking} from 'react-native';
import Toast from 'react-native-toast-message';

export interface FaceAuthResponse {
  success: boolean;
  message: string;
  score?: number;
}

interface RegistrationStatusResponse {
  isRegistered: boolean;
  faceCount: number;
}

class FaceAuthService {
  private static instance: FaceAuthService;
  
  private constructor() {}

  public static getInstance(): FaceAuthService {
    if (!FaceAuthService.instance) {
      FaceAuthService.instance = new FaceAuthService();
    }
    return FaceAuthService.instance;
  }

  /**
   * Request camera permission on Android
   */
  private async requestAndroidCameraPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "EasyRentHub needs access to your camera to verify your identity",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error("Error requesting camera permission:", err);
      return false;
    }
  }

  /**
   * Show alert to guide user to app settings when permission is denied
   */
  private showPermissionAlert(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Camera Permission Required",
        "EasyRentHub needs camera access to verify your identity. Please enable camera permission in app settings.",
        [
          { 
            text: "Cancel", 
            onPress: () => resolve(false), 
            style: "cancel" 
          },
          { 
            text: "Open Settings", 
            onPress: () => {
              Linking.openSettings();
              resolve(false);
            }
          }
        ],
        { cancelable: false }
      );
    });
  }

  public async captureFace(): Promise<string> {
    try {
      console.log('faceAuthService: Starting face capture');
      
      if (Platform.OS === 'android') {
        const hasPermission = await this.requestAndroidCameraPermission();
        if (!hasPermission) {
          await this.showPermissionAlert();
          throw new Error('Không có quyền truy cập camera');
        }
      }
      
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        useFrontCamera: true,
        includeBase64: false,
        mediaType: 'photo',
      });
      
      if (!image || !image.path) {
        throw new Error('Không thể chụp ảnh');
      }
      
      console.log('Image captured:', image.path);
      return image.path;
    } catch (error) {
      console.error('Error capturing face:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('cancelled') || error.message.includes('cancel')) {
          throw new Error('Bạn đã hủy chụp ảnh');
        }
        
        if (error.message.includes('permission')) {
          throw new Error('Vui lòng cấp quyền truy cập camera trong cài đặt thiết bị');
        }
      }
      
      throw new Error('Không thể chụp ảnh khuôn mặt. Vui lòng thử lại.');
    }
  }

  public async validateFaceWithoutAuth(imagePath: string): Promise<FaceAuthResponse> {
    try {
      console.log('faceAuthService: Starting validateFaceWithoutAuth with path', imagePath);

      const formData = new FormData();
      formData.append('image', {
        uri: imagePath,
        type: 'image/jpeg',
        name: 'face_image.jpg',
      });

      const response = await axios.post(
        `${Config.API_URL}/api/face-auth/validate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('validateFaceWithoutAuth response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: response.data.isValid === true, 
        message: response.data.message || '',
        score: response.data.faceDetails?.Confidence 
      };
    } catch (error) {
      console.error('faceAuthService: Error in validateFaceWithoutAuth:', error);
      if (axios.isAxiosError(error)) {
        console.log('API error response:', error.response?.data);
        if (error.response?.status === 400) {
          throw new Error(
            error.response.data.message || 'No valid face detected in the image.',
          );
        }
      }
      throw new Error('Failed to validate face. Please try again.');
    }
  }

  public async registerFace(imagePath: string): Promise<FaceAuthResponse> {
    try {
      console.log('faceAuthService: Starting registerFace with path', imagePath);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'android' ? imagePath : `file://${imagePath}`,
        type: 'image/jpeg',
        name: 'face_image.jpg',
      });

      console.log('Sending face registration request to:', `${Config.API_URL}/api/face-auth/register`);
      console.log('Form data:', JSON.stringify(formData));

      const response = await axios.post(
        `${Config.API_URL}/api/face-auth/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('registerFace response:', JSON.stringify(response.data, null, 2));
      
      await AsyncStorage.setItem('hasFaceRegistered', 'true');

      const isSuccessful = response.data.message && 
        response.data.message.toLowerCase().includes('success');
        
      return {
        success: isSuccessful,
        message: response.data.message || '',
        score: undefined
      };
    } catch (error) {
      console.error('faceAuthService: Error in registerFace:', error);
      if (axios.isAxiosError(error)) {
        console.log('API error response:', error.response?.data);
        const errorMessage = error.response?.data?.message || 'Failed to register face.';
        if (error.response?.status === 400) {
          throw new Error(errorMessage || 'Failed to register face. No face detected.');
        } else if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
      }
      throw new Error('Failed to register face. Please try again.');
    }
  }

  /**
   * Validate if an image contains a valid face
   * @param imagePath Path to the captured face image
   * @returns Promise with validation response
   */
  public async validateFace(imagePath: string): Promise<FaceAuthResponse> {
    try {
      console.log('faceAuthService: Starting validateFace with path', imagePath);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'android' ? imagePath : `file://${imagePath}`,
        type: 'image/jpeg',
        name: 'face_image.jpg',
      });

      const response = await axios.post(
        `${Config.API_URL}/api/face-auth/validate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('validateFace response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: response.data.isValid === true,
        message: response.data.message || '',
        score: response.data.faceDetails?.Confidence
      };
    } catch (error) {
      console.error('faceAuthService: Error in validateFace:', error);
      if (axios.isAxiosError(error)) {
        console.log('API error response:', error.response?.data);
        if (error.response?.status === 400) {
          throw new Error(
            error.response.data.message || 'No valid face detected in the image.',
          );
        }
      }
      throw new Error('Failed to validate face. Please try again.');
    }
  }

  public async verifyFace(imagePath: string): Promise<FaceAuthResponse> {
    try {
      console.log('faceAuthService: Starting verifyFace with path', imagePath);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'android' ? imagePath : `file://${imagePath}`,
        type: 'image/jpeg',
        name: 'face_image.jpg',
      });

      const response = await axios.post(
        `${Config.API_URL}/api/face-auth/verify`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('verifyFace response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: response.data.verified === true,
        message: response.data.message || '',
        score: response.data.similarity
      };
    } catch (error) {
      console.error('faceAuthService: Error in verifyFace:', error);
      if (axios.isAxiosError(error)) {
        console.log('API error response:', error.response?.data);
        if (error.response?.status === 400) {
          throw new Error(
            error.response.data.message || 'Face verification failed. Please try again.',
          );
        } else if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.response?.status === 404) {
          throw new Error('No registered face found. Please register your face first.');
        }
      }
      throw new Error('Face verification failed. Please try again.');
    }
  }

  public async hasFaceRegistered(): Promise<boolean> {
    try {
      console.log('faceAuthService: Checking if user has registered face');
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        console.log('No token found, user not logged in');
        return false;
      }

      const hasRegisteredLocal = await AsyncStorage.getItem('hasFaceRegistered');
      if (hasRegisteredLocal === 'true') {
        console.log('Face registration found in local storage');
        return true;
      }

      try {
        const response = await axios.get(
          `${Config.API_URL}/api/face-auth/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const isRegistered = response.data.hasRegistered === true;
        
        if (isRegistered) {
          await AsyncStorage.setItem('hasFaceRegistered', 'true');
        }
        
        return isRegistered;
      } catch (error) {
        console.log('Error checking face status, falling back to local value:', error);
        return false;
      }
    } catch (error) {
      console.error('faceAuthService: Error checking face registration status:', error);
      return false;
    }
  }

  public async checkRegistrationStatus(): Promise<RegistrationStatusResponse> {
    try {
      console.log('faceAuthService: Checking face registration status');
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(
        `${Config.API_URL}/api/face-auth/registration-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Registration status response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.isRegistered) {
        await AsyncStorage.setItem('hasFaceRegistered', 'true');
      } else {
        await AsyncStorage.setItem('hasFaceRegistered', 'false');
      }
      
      return {
        isRegistered: response.data.isRegistered,
        faceCount: response.data.faceCount || 0
      };
    } catch (error) {
      console.error('faceAuthService: Error checking registration status:', error);
      return {
        isRegistered: false,
        faceCount: 0
      };
    }
  }
}

export const faceAuthService = FaceAuthService.getInstance(); 