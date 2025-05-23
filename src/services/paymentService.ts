import axios from 'axios';
import {Config} from '@/config';
import {Payment, Subscription, SubscriptionResponse} from '../types/subscription';

class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async createPayment(token: string, planType: string): Promise<Payment> {
    try {
      const response = await axios.post(
        `${Config.API_URL}/api/payment/create-payment`,
        {planType},
        {
          headers: {Authorization: token},
        },
      );
      console.log('Create payment response:', response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getSubscription(token: string): Promise<SubscriptionResponse> {
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/payment/subscription-payment`,
        {
          headers: {Authorization: token},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async recordUsage(token: string): Promise<SubscriptionResponse> {
    try {
      const response = await axios.post(
        `${Config.API_URL}/api/payment/record-usage-payment`,
        {},
        {
          headers: {Authorization: token},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getPaymentHistory(token: string): Promise<Payment[]> {
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/payment/history-payment`,
        {
          headers: {Authorization: token},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getPaymentById(token: string, paymentId: string): Promise<Payment> {
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/payment/get-payment-by-id/${paymentId}`,
        {
          headers: {Authorization: token},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const paymentService = PaymentService.getInstance();