import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Config } from '@/config';
import { useSubscription } from '@/context/SubscriptionContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/types/subscription';

interface PaymentSuccessParams {
  paymentId?: string;
  amount?: number;
}

export const PaymentSuccessScreen = () => {
  const { userToken } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webhookSuccess, setWebhookSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<Payment | null>(null);

  const params = route.params as PaymentSuccessParams || {};
  const paymentId = params.paymentId || '';
  const amount = params.amount || 19000;

  console.log('paymentId success screen', paymentId);
  console.log('amount success screen', amount);

  useEffect(() => {
    const fetchPaymentHistoryAndSendWebhook = async () => {
      try {
        if (!paymentId || !userToken) {
          setLoading(false);
          return;
        }

        let payment = null;
        try {
          const response = await paymentService.getPaymentHistory(userToken);
          console.log('Payment history:', response);
          
          const payments = response?.payments || [];
          
          if (Array.isArray(payments)) {
            payment = payments.find(p => p._id === paymentId);
            console.log('Found payment:', payment);
          }
        } catch (historyError) {
          console.error('Error getting payment history:', historyError);
        }
        
        const orderCode = payment?.transactionId || payment?.orderCode || paymentId;
        setPaymentInfo(payment);
        
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${userToken}`);

        const raw = JSON.stringify({
          "data": {
            "orderCode": orderCode,
            "status": "PAID",
            "amount": amount,
            "description": "Payment for WEEKLY plan",
            "transactionId": `PAYOS_${new Date().toISOString().split('T')[0]}`
          }
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow"
        };

        console.log('Sending webhook with data:', raw);
        
        const response = await fetch(`${Config.API_URL}/api/payment/webhook-payment`, requestOptions);
        const result = await response.text();
        console.log('Webhook response:', result);
        
        setWebhookSuccess(true);
        
        await refreshSubscription();
        
      } catch (error) {
        console.error('Error sending webhook:', error);
        setError('Failed to process payment confirmation');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistoryAndSendWebhook();
  }, [paymentId, userToken, amount, refreshSubscription]);

  const handleContinue = () => {
    navigation.navigate('CreateEstate');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>{t('processing_payment')}</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {webhookSuccess ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#059669" />
              </View>
              <Text style={styles.title}>{t('payment_successful')}</Text>
              <Text style={styles.subtitle}>{t('subscription_upgraded')}</Text>
              <Text style={styles.orderDetails}>
                {t('order_code')}: {paymentInfo?.transactionId || paymentInfo?.orderCode || paymentId}
              </Text>
              <Text style={styles.orderDetails}>
                {t('amount')}: {amount.toLocaleString()} VND
              </Text>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={80} color="#F59E0B" />
              </View>
              <Text style={styles.title}>{t('payment_processing')}</Text>
              <Text style={styles.subtitle}>{t('subscription_will_be_updated_soon')}</Text>
              <Text style={styles.errorText}>{error}</Text>
            </>
          )}
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>{t('continue_to_app')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  orderDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 24,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});