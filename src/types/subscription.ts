export enum PlanType {
    FREE = "FREE",
    WEEKLY = "WEEKLY"
  }
  
  export enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
  }
  
  export interface Subscription {
    _id?: string;
    userId: string;
    planType: PlanType;
    startDate: Date;
    endDate: Date;
    postsRemaining: number;
    postsUsedToday: number;
    lastPostDate?: Date;
    status?: string;
    postCountResetDate?: Date;
  }
  
  export interface Payment {
    _id?: string;
    userId: string;
    amount: number;
    planType: PlanType;
    paymentMethod: "PAYOS";
    status: PaymentStatus;
    transactionId?: string;
    orderCode?: string;
    orderInfo?: string;
    paymentUrl?: string;
    paymentResponse?: any;
    createdAt: Date;
  }

  export interface SubscriptionResponse {
    canPost: boolean;
    dailyPostLimit: number;
    postsRemaining: number;
    subscription: Subscription;
  }