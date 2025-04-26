import {
  EstateDetailProps,
  EstateItems,
  ReviewItems,
  TranSactionProps,
} from './interface';

export type RootStackParams = {
  Login: undefined;
  HomeScreen: undefined;
  OnBoarding: undefined;
  OptionLogin: undefined;
  Register: undefined;
  Location: undefined;
  Stories: any;
  EstateDetail: {
    id: string;
    nearby?: boolean;
  };
  ReviewDetails: {estate: EstateItems; reviews: [ReviewItems]};
  AllReview: any;
  TabMenu: any;
  TransactionDetail: {transaction: TranSactionProps; estate: EstateDetailProps};
  ConfirmDetail: {transaction: TranSactionProps; estate: EstateDetailProps};
  AddReview: {
    estate: any;
  };
  CreateEstate: undefined;
  AddEstateLocation: undefined;
  AddEstateImages: undefined;
  AddEstateInfo: undefined;
  Transaction: {
    data: any;
  };
  SearchResult: any;
  Message: any;
  Notification: any;
  MessagesDetail: any;
  TransactionSummary: any;
  Setting: any;
  EditListing: () => void;
  BookingHistory: undefined;
  Booking: {
    estate: any;
  };
  Chat: undefined;
  AllEstates: undefined;
};
