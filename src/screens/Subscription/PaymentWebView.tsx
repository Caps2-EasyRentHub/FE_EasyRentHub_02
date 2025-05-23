import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSubscription } from '@/context/SubscriptionContext';
import { BackButton } from '@/components';
import { useTranslation } from 'react-i18next';

interface PaymentWebViewParams {
  paymentUrl: string;
  paymentId: string;
  amount: number;
}

export const PaymentWebView = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  console.log('route.params', route.params);
  
  const { paymentUrl, paymentId, amount } = route.params as PaymentWebViewParams;

  
  const handleNavigationChange = (navState: any) => {
    console.log("Navigation URL:", navState.url);
    
    const { paymentId, amount } = route.params as PaymentWebViewParams;
    
    console.log('paymentUrl web view', paymentUrl);
  console.log('paymentId web view', paymentId);
  console.log('amount web view', amount);
    if (navState.url.includes('/success')) {
      navigation.replace('PaymentSuccess', {
        paymentId: paymentId,
        amount: amount
      });
    } else if (navState.url.includes('/cancel')) {
      navigation.replace('PaymentCancel');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('payment')}</Text>
      </View>
      
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webView}
        onNavigationStateChange={handleNavigationChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      
      {(loading || processingPayment) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>
            {processingPayment ? t('processing_payment') : t('loading')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 16,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 12,
    color: '#1F2937',
    fontSize: 16,
  },
});