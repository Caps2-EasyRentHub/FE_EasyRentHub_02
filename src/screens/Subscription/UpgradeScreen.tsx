import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useContext} from 'react';
import {AuthContext} from '@/context/AuthContext';
import {useSubscription} from '@/context/SubscriptionContext';
import {formatCurrency} from '@/utils/format';
import {BackButton} from '@/components';

export const UpgradeScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {userToken} = useContext(AuthContext);
  const {createPayment, subscription, refreshSubscription} = useSubscription();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshSubscription();
  }, []);

  const canActivateFreePlan = () => {
    if (!subscription) return true;

    if (subscription.planType === 'FREE') {
      const startDate = new Date(subscription.startDate);
      const currentDate = new Date();
      const oneMonthFromStart = new Date(startDate);
      oneMonthFromStart.setMonth(oneMonthFromStart.getMonth() + 1);

      if (currentDate < oneMonthFromStart && subscription.postsRemaining === 0) {
        return false;
      }
      
      if (currentDate < oneMonthFromStart) {
        return false;
      }
    }

    return true;
  };

  const handleUpgradeFree = async () => {
    try {
      if (!canActivateFreePlan()) {
        Alert.alert(
          t('not_eligible'),
          t('free_plan_monthly_limit'),
          [{ text: 'OK' }]
        );
        return;
      }

      setLoading(true);
      const payment = await createPayment('FREE');
      
      if (payment) {
        await refreshSubscription();
        Alert.alert(
          t('success'),
          t('free_plan_activated'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Free plan activation failed:', error);
      Alert.alert(
        t('error'),
        t('free_plan_activation_failed'),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeWeekly = async () => {
    try {
      setLoading(true);
      const payment = await createPayment('WEEKLY');
      
      console.log('Payment response upgrade weekly:', payment);
      
      if (payment?.paymentUrl) {
        navigation.navigate('PaymentWebView', {
          paymentUrl: payment.paymentUrl,
          paymentId: payment.paymentId,
          amount: payment.amount || 19000
        });
      } else {
        Alert.alert(
          t('error'),
          t('payment_url_missing'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      Alert.alert(
        t('error'),
        t('payment_creation_failed'),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const isFreePlanActive = subscription?.planType === 'FREE' && subscription?.status === 'ACTIVE' && subscription?.postsRemaining > 0;
  const isWeeklyPlanActive = subscription?.planType === 'WEEKLY' && subscription?.status === 'ACTIVE';

  const isFreePlanLocked = subscription?.planType === 'FREE' && !canActivateFreePlan();

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <Text style={styles.title}>{t('choose_subscription_plan')}</Text>
      
      <View style={[styles.planCard, isFreePlanActive ? styles.activePlanCard : styles.freePlan]}>
        {isFreePlanActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{t('active')}</Text>
          </View>
        )}
        
        {isFreePlanLocked && (
          <View style={[styles.activeBadge, styles.lockedBadge]}>
            <Text style={styles.activeBadgeText}>{t('Giới hạn')}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{t('free_plan')}</Text>
          <Text style={styles.planPrice}>{t('free')}</Text>
        </View>

        <View style={styles.benefitsList}>
          <Text style={styles.benefitsTitle}>{t('plan_benefits')}:</Text>
          <Text style={styles.benefitItem}>• {t('limited_posts', {count: 5})}</Text>
          <Text style={styles.benefitItem}>• {t('standard_features')}</Text>
          <Text style={styles.benefitItem}>• {t('no_expiry')}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.planButton, 
            {
              backgroundColor: isFreePlanActive || isFreePlanLocked 
                ? '#6B7280' 
                : '#4B5563'
            }
          ]}
          onPress={handleUpgradeFree}
          disabled={loading || isFreePlanActive || isFreePlanLocked}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.planButtonText}>
              {isFreePlanActive 
                ? t('current_plan')
                : isFreePlanLocked
                  ? t('Miễn phí')
                  : t('choose_plan')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.planCard, isWeeklyPlanActive ? styles.activePlanCard : styles.weeklyPlan]}>
        {isWeeklyPlanActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{t('active')}</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{t('weekly_plan')}</Text>
          <Text style={styles.planPrice}>{formatCurrency(19000)}</Text>
          <Text style={styles.planPeriod}>{t('Một tuần')}</Text>
        </View>

        <View style={styles.benefitsList}>
          <Text style={styles.benefitsTitle}>{t('plan_benefits')}:</Text>
          <Text style={styles.benefitItem}>• {t('unlimited_posts_first_days', {count: 4})}</Text>
          <Text style={styles.benefitItem}>• {t('max_5_posts_per_day_later')}</Text>
          <Text style={styles.benefitItem}>• {t('valid_7_days')}</Text>
          <Text style={styles.benefitItem}>• {t('premium_features')}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.planButton, 
            {backgroundColor: isWeeklyPlanActive ? '#10B981' : '#059669'}
          ]}
          onPress={handleUpgradeWeekly}
          disabled={loading || isWeeklyPlanActive}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.planButtonText}>
              {isWeeklyPlanActive 
                ? t('current_plan') 
                : t('upgrade_now')}
            </Text>
          )}
        </TouchableOpacity>
        
        {isWeeklyPlanActive && (
          <View>
            <Text style={styles.postsRemainingText}>
              {t('posts_remaining_today_count', {count: 5 - subscription.postsUsedToday})}
            </Text>
            <Text style={styles.expiryText}>
              {t('expires_on', {date: new Date(subscription.endDate).toLocaleDateString()})}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    marginTop: 12,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
    position: 'relative',
  },
  activePlanCard: {
    borderWidth: 2,
    borderColor: '#059669',
  },
  freePlan: {
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  weeklyPlan: {
    borderColor: '#059669',
    borderWidth: 1,
  },
  activeBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
  },
  planPeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  planButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  planButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postsRemainingText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#059669',
    fontWeight: '600',
  },
  expiryText: {
    textAlign: 'center',
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
  },
  lockedBadge: {
    backgroundColor: '#DC2626',
  },
  lockMessage: {
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  }
});