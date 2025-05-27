import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenWidth} from '@/themes/Responsive';
import {House_Icon} from '@/assets/Svg';
import {push} from '@/navigation/NavigationUtils';
import {useSubscription} from '@/context/SubscriptionContext';
import {useFocusEffect} from '@react-navigation/native';
import {PlanType} from '@/types/subscription';
import FaceCapture from '@/components/FaceCapture';
import {useFaceAuth, FaceAuthPurpose} from '@/hooks/useFaceAuth';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateEstate = () => {
  const {t} = useTranslation();
  const {subscription, refreshSubscription, canCreatePost, postsRemaining} = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nameEstates, setNameEstates] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [faceVerified, setFaceVerified] = useState<boolean>(false);
  
  useEffect(() => {
    const checkFaceVerification = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          setFaceVerified(false);
          return;
        }
        
        const lastVerified = await AsyncStorage.getItem('face_verified_timestamp');
        const verificationPeriod = 5 * 60 * 1000;
        
        if (lastVerified && (Date.now() - parseInt(lastVerified)) < verificationPeriod) {
          setFaceVerified(true);
        } else {
          setFaceVerified(false);
        }
      } catch (error) {
        console.error('Error checking face verification status:', error);
        setFaceVerified(false);
      }
    };
    
    checkFaceVerification();
  }, []);
  
  const {
    isModalVisible,
    showFaceAuthModal,
    hideFaceAuthModal,
    handleFaceCapture,
    handleFaceCaptureError,
  } = useFaceAuth({
    onSuccess: (response) => {
      console.log('CreateEstate: Face auth success callback, response:', response);
      setFaceVerified(true);
      
      try {
        AsyncStorage.setItem('face_verified_timestamp', Date.now().toString());
        console.log('CreateEstate: Saved verification timestamp to AsyncStorage');
      } catch (error) {
        console.error('CreateEstate: Error saving verification status:', error);
      }
      
      Toast.show({
        type: 'success',
        text1: t('Xác thực thành công'),
        text2: t('Bạn có thể tiếp tục đăng bài'),
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      console.log('CreateEstate: Setting timeout to proceed with post creation');
      setTimeout(() => {
        proceedWithPostCreation();
      }, 1500);
    },
    onError: (error) => {
      console.log('CreateEstate: Face auth error callback:', error);
      setFaceVerified(false);
      Toast.show({
        type: 'error',
        text1: t('Xác thực thất bại'),
        text2: error,
        position: 'bottom',
        visibilityTime: 3000,
      });
    },
  });
  
  const handlePress = () => {
    Keyboard.dismiss();
  };

  const proceedWithPostCreation = () => {
    console.log('CreateEstate: Proceeding with post creation');
    push({
      name: 'AddEstateLocation',
      params: {
        data: {
          name: nameEstates,
          house_number: parseInt(houseNumber),
        },
      },
    });
  };
  
  const handleNext = () => {
    console.log('CreateEstate: handleNext called');
    if (!canCreatePost()) {
      console.log('CreateEstate: Cannot create post due to subscription limits');
      return;
    }
    
    console.log('CreateEstate: Checking if already verified:', faceVerified);
    if (faceVerified) {
      console.log('CreateEstate: Already verified, proceeding directly');
      proceedWithPostCreation();
    } else {
      console.log('CreateEstate: Not verified yet, showing face auth modal');
      showFaceAuthModal(FaceAuthPurpose.VERIFY);
    }
  };

  const renderSubscriptionBanner = () => {
    if (!subscription) return null;
    
    let remainingPosts = postsRemaining;
    
    const isActive = remainingPosts > 0;
    
    const bgColor = isActive ? '#E6F7FF' : '#FFEBEB';
    const textColor = isActive ? '#0077B6' : '#DC2626';
    const borderColor = isActive ? '#BDE0FE' : '#FECACA';
    
    return (
      <TouchableOpacity 
        style={[styles.subscriptionBanner, {backgroundColor: bgColor, borderColor: borderColor}]}
        onPress={() => push({name: 'UpgradeSubscription'})}
      >
        <View style={styles.bannerContent}>
          <View>
            <Text style={[styles.planTypeText, {color: textColor}]}>
              {subscription.planType === PlanType.FREE ? t('free_plan') : t('weekly_plan')}
            </Text>
            <Text style={styles.statusText}>
              {isActive ? t('active') : t('expired')}
            </Text>
            
            {subscription.planType === PlanType.WEEKLY && subscription.endDate && (
              <Text style={styles.expiryDateText}>
                {t('expires_on', {date: new Date(subscription.endDate).toLocaleDateString()})}
              </Text>
            )}
          </View>
          
          <View style={styles.postsCountContainer}>
            <Text style={[styles.postsCount, {color: textColor}]}>
              {remainingPosts}
            </Text>
            <Text style={styles.postsLabel}>
              {t('bài viết còn lại')}
            </Text>
          </View>
        </View>
        
        {(!isActive || remainingPosts < 2) && (
          <Text style={styles.upgradeTipText}>
            {t('nâng_cấp')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.component}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View>
          <View style={styles.pageTitle}>
            <Text style={styles.addList}>{t('add_listing')}</Text>
          </View>
          <BackButton />

          {renderSubscriptionBanner()}

          <View style={styles.titleView}>
            <Text style={styles.titleNormal}>{t('fill_details')}</Text>
            <Text style={styles.titleHighlight}>{t('real_estate')}</Text>
          </View>

          <View>
            <Text style={styles.inputLabel}>{t('Tên phòng')}</Text>
            <View>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => setNameEstates(text)}
                placeholder={t('Nhập tên phòng')}
              />
              <View style={styles.viewIcon}>
                <House_Icon />
              </View>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('Số nhà')}</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => setHouseNumber(text)}
              placeholder={t('Nhập số nhà')}
              keyboardType="numeric"
            />
          </View>
          {nameEstates && houseNumber ? (
            <TouchableOpacity
              style={styles.btnNext}
              onPress={handleNext}
            >
              <Text style={[styles.txtSell, {color: '#FFFFFF', fontSize: 20}]}>
                {t('next')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.btnNext, {backgroundColor: '#F5F4F8'}]}
              activeOpacity={1}
            >
              <Text style={[styles.txtSell, {fontSize: 20}]}>{t('next')}</Text>
            </TouchableOpacity>
          )}
          
          <FaceCapture
            isVisible={isModalVisible}
            onClose={hideFaceAuthModal}
            onSuccess={handleFaceCapture}
            onError={handleFaceCaptureError}
            title={t('Face Verification')}
            subtitle={t('Please verify your identity to post a rental property')}
          />
          
          {faceVerified && (
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationText}>
                {t('Xác thực khuôn mặt thành công')}
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageTitle: {alignItems: 'center'},
  addList: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
  },
  titleView: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  titleNormal: {
    fontFamily: 'Lato-Medium',
    color: '#000000',
    fontSize: 30,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 30,
  },
  subscriptionBanner: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#E6F7FF',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#4B5563',
  },
  postsCountContainer: {
    alignItems: 'center',
  },
  postsCount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  postsLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  upgradeTipText: {
    fontSize: 13,
    color: '#F97316',
    marginTop: 8,
    textAlign: 'center',
  },
  expiryDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  textInput: {
    width: screenWidth - 48,
    height: 70,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    borderRadius: 25,
    color: '#252B5C',
    fontSize: 15,
    paddingHorizontal: 16,
  },
  viewIcon: {
    position: 'absolute',
    top: 25,
    right: 36,
  },
  titleList: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  viewList: {
    flexDirection: 'row',
  },
  btnRent: {
    backgroundColor: '#F5F4F8',
    borderRadius: 20,
    paddingVertical: 17.5,
    paddingHorizontal: 24,
    marginLeft: 24,
  },
  txtRent: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
  },
  btnSell: {
    backgroundColor: '#F5F4F8',
    borderRadius: 20,
    paddingVertical: 17.5,
    paddingHorizontal: 24,
    marginLeft: 10,
  },
  txtSell: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
  },
  btnNext: {
    width: screenWidth - 140,
    height: 54,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    position: 'absolute',
    left: 70,
  },
  inputLabel: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 24,
  },
  inputContainer: {
    marginTop: 20,
  },
  verificationBadge: {
    backgroundColor: '#E6F7F0',
    padding: 10,
    borderRadius: 8,
    borderColor: '#8BC83F',
    borderWidth: 1,
    margin: 16,
    marginBottom: 100,
    alignItems: 'center',
  },
  verificationText: {
    color: '#8BC83F',
    fontWeight: 'bold',
  }
});

export default CreateEstate;
