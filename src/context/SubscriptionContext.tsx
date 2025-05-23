import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subscription, PlanType } from '../types/subscription';
import { paymentService } from '../services/paymentService';
import { AuthContext } from '@/context/AuthContext';

interface SubscriptionResponse {
  canPost: boolean;
  dailyPostLimit: number;
  postsRemaining: number;
  subscription: Subscription;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canCreatePost: () => boolean;
  createPayment: (planType: string) => Promise<any>;
  recordUsage: () => Promise<void>;
  postsRemaining: number;
  dailyPostLimit: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const DEFAULT_DAILY_LIMIT = 5;
const DEFAULT_POSTS_REMAINING = 0;

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [postsRemaining, setPostsRemaining] = useState<number>(DEFAULT_POSTS_REMAINING);
  const [dailyPostLimit, setDailyPostLimit] = useState<number>(DEFAULT_DAILY_LIMIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canPostApi, setCanPostApi] = useState<boolean>(false);

  const refreshSubscription = useCallback(async () => {
    if (!auth.userToken) return;
    
    try {
      setLoading(true);
      const response = await paymentService.getSubscription(auth.userToken);
      
      if (__DEV__) {
        console.log('Subscription status:', response);
      }
      
      if (response) {
        if (response.subscription) {
          setSubscription(response.subscription);
        }
        
        setPostsRemaining(response.postsRemaining ?? DEFAULT_POSTS_REMAINING);
        setDailyPostLimit(response.dailyPostLimit ?? DEFAULT_DAILY_LIMIT);
        setCanPostApi(response.canPost ?? false);
        
        setError(null);
      } else {
        setSubscription(null);
        setPostsRemaining(DEFAULT_POSTS_REMAINING);
        setDailyPostLimit(DEFAULT_DAILY_LIMIT);
        setCanPostApi(false);
      }
    } catch (err) {
      console.error('Error refreshing subscription:', err);
      setError('Failed to fetch subscription status');
      
      setSubscription(null);
      setPostsRemaining(DEFAULT_POSTS_REMAINING);
      setDailyPostLimit(DEFAULT_DAILY_LIMIT);
      setCanPostApi(false);
    } finally {
      setLoading(false);
    }
  }, [auth.userToken]);

  const canCreatePost = useCallback((): boolean => {
    if (typeof canPostApi === 'boolean') {
      return canPostApi;
    }
    
    if (!subscription) return false;
    
    if (subscription.status !== 'ACTIVE') return false;
    
    if (subscription.planType === PlanType.FREE) {
      return (postsRemaining || DEFAULT_POSTS_REMAINING) > 0;
    }
    
    if (subscription.planType === PlanType.WEEKLY) {
      const limit = dailyPostLimit || DEFAULT_DAILY_LIMIT;
      return (subscription.postsUsedToday || 0) < limit;
    }
    
    return false;
  }, [subscription, postsRemaining, dailyPostLimit, canPostApi]);

  const createPayment = useCallback(async (planType: string) => {
    if (!auth.userToken) return null;
    
    try {
      const payment = await paymentService.createPayment(auth.userToken, planType);
      
      if (planType === 'FREE' && !payment.paymentUrl) {
        await refreshSubscription();
      }
      
      return payment;
    } catch (err) {
      console.error('Error creating payment:', err);
      setError('Failed to create payment');
      throw err;
    }
  }, [auth.userToken, refreshSubscription]);

  const recordUsage = useCallback(async () => {
    if (!auth.userToken) return;
    
    try {
      const updatedSubscription = await paymentService.recordUsage(auth.userToken);
      setSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err) {
      console.error('Error recording usage:', err);
      throw err;
    }
  }, [auth.userToken]);

  useEffect(() => {
    if (auth.userToken) {
      refreshSubscription();
    }
  }, [auth.userToken, refreshSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        refreshSubscription,
        canCreatePost,
        createPayment,
        recordUsage,
        postsRemaining,
        dailyPostLimit
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};