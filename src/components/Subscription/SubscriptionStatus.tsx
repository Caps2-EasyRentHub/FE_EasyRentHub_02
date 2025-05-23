import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {PlanType} from '@/types/subscription.ts';
import {formatCurrency, formatDate} from '@/utils/format';

interface SubscriptionStatusProps {
  subscription: {
    planType: PlanType;
    postsRemaining: number;
    postsUsedToday: number;
    endDate: Date;
    status: string;
  };
  onUpgrade: () => void;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  onUpgrade,
}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('subscription_status')}</Text>
      <View style={styles.card}>
        <View style={styles.planInfo}>
          <View style={styles.planHeader}>
            <Text style={styles.planType}>
              {subscription.planType === PlanType.FREE
                ? t('free_plan')
                : t('weekly_plan')}
            </Text>
            {subscription.status === 'EXPIRED' && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredText}>{t('expired')}</Text>
              </View>
            )}
          </View>
          
          {subscription.planType === PlanType.FREE ? (
            <View style={styles.postsInfo}>
              <View style={styles.postsCountContainer}>
                <Text style={styles.postsCount}>{subscription.postsRemaining}</Text>
                <Text style={styles.postsText}>{t('posts_remaining')}</Text>
              </View>
              
              {(subscription.postsRemaining === 0 || subscription.status === 'EXPIRED') && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={onUpgrade}>
                  <Text style={styles.upgradeButtonText}>
                    {t('upgrade_plan', {
                      price: formatCurrency(19000),
                    })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.postsInfo}>
              <View style={styles.postsCountContainer}>
                <Text style={styles.postsCount}>{5 - subscription.postsUsedToday}</Text>
                <Text style={styles.postsText}>{t('posts_remaining_today')}</Text>
              </View>
              <Text style={styles.expiryDate}>
                {t('plan_expires', {
                  date: formatDate(subscription.endDate),
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planInfo: {
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  postsInfo: {
    marginTop: 12,
  },
  postsCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  postsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginRight: 8,
  },
  postsText: {
    fontSize: 14,
    color: '#4B5563',
  },
  expiryDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  upgradeButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expiredBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expiredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});