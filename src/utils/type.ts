import {
  EstateDetailProps,
  EstateItems,
  ReviewItems,
  TranSactionProps,
} from './interface';

export type RootStackParams = {
  Login: any;
  HomeScreen: any;
  OnBoarding: any;
  OptionLogin: any;
  Register: any;
  Location: any;
  Stories: any;
  EstateDetail: {id: EstateDetailProps; nearby: boolean};
  ReviewDetails: {estate: EstateItems; reviews: [ReviewItems]};
  AllReview: any;
  TabMenu: any;
  TransactionDetail: {transaction: TranSactionProps; estate: EstateDetailProps};
  ConfirmDetail: {transaction: TranSactionProps; estate: EstateDetailProps};
  AddReview: any;
  CreateEstate: any;
  AddEstateLocation: any;
  AddEstateImages: any;
  AddEstateInfo: any;
  Transaction: any;
  SearchResult: any;
  Message: any;
  Notification: any;
  MessagesDetail: any;
  TransactionSummary: any;
  Setting: any;
  EditListing: () => void;
};
