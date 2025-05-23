import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AuthContext} from '@/context/AuthContext';
import {BackButton} from '@/components';
import {paymentService} from '@/services/paymentService';
import {formatCurrency, formatDate} from '@/utils/format';
import {Payment, PaymentStatus} from '@/types/subscription.ts';

export const PaymentHistoryScreen = () => {
  const {t} = useTranslation();
  const {userToken} = useContext(AuthContext);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        if (userToken) {
          const history = await paymentService.getPaymentHistory(userToken);
          setPayments(history);
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [userToken]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return '#059669';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#DC2626';
      default:
        return '#4B5563';
    }
  };

  const renderPaymentItem = ({item}: {item: Payment}) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.planTitle}>{t(item.planType.toLowerCase() + '_plan')}</Text>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
          <Text style={styles.statusText}>{t(item.status.toLowerCase())}</Text>
        </View>
      </View>
      
      <View style={styles.paymentInfo}>
        <Text style={styles.infoLabel}>{t('amount')}:</Text>
        <Text style={styles.infoValue}>{formatCurrency(item.amount)}</Text>
      </View>
      
      <View style={styles.paymentInfo}>
        <Text style={styles.infoLabel}>{t('payment_method')}:</Text>
        <Text style={styles.infoValue}>{item.paymentMethod}</Text>
      </View>
      
      <View style={styles.paymentInfo}>
        <Text style={styles.infoLabel}>{t('transaction_id')}:</Text>
        <Text style={styles.infoValue}>
          {item.transactionId || t('not_available')}
        </Text>
      </View>
      
      <View style={styles.paymentInfo}>
        <Text style={styles.infoLabel}>{t('date')}:</Text>
        <Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>{t('payment_history')}</Text>
      
      {payments.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('no_payment_history')}</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id || item.createdAt.toString()}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  list: {
    paddingBottom: 24,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  paymentInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: '40%',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
});