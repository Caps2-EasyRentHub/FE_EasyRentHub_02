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
import React, {useState} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenWidth} from '@/themes/Responsive';
import {House_Icon} from '@/assets/Svg';
import {push} from '@/navigation/NavigationUtils';
import {useSubscription} from '@/context/SubscriptionContext';
import {useFocusEffect} from '@react-navigation/native';
import {PlanType} from '@/types/subscription';

const CreateEstate = () => {
  const {t} = useTranslation();
  const {subscription, refreshSubscription, canCreatePost, postsRemaining} = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handlePress = () => {
    Keyboard.dismiss();
  };
  
  const [nameEstates, setNameEstates] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');

  const handleNext = () => {
    if (!canCreatePost()) {
      Alert.alert(
        t('subscription_limit'),
        subscription?.planType === 'FREE'
          ? t('free_plan_limit_reached')
          : t('weekly_plan_limit_reached'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('upgrade_now'),
            onPress: () => push({name: 'UpgradeSubscription'}),
          },
        ]
      );
      return;
    }

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

  const renderSubscriptionBanner = () => {
    if (!subscription) return null;

    let remainingPosts = postsRemaining;
    
    const isActive = subscription.status === 'ACTIVE';
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
              {t('posts_available')}
            </Text>
          </View>
        </View>
        
        {(!isActive || remainingPosts < 2) && (
          <Text style={styles.upgradeTipText}>
            {t('tap_to_upgrade')}
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
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => setNameEstates(text)}
              placeholder={t('enter_estate_name')}
            />
            <View style={styles.viewIcon}>
              <House_Icon />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('house_number')}</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => setHouseNumber(text)}
              placeholder={t('enter_house_number')}
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
    bottom: 26,
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
});

export default CreateEstate;
