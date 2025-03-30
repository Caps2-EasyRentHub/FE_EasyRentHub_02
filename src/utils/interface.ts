import {RouteProp} from '@react-navigation/native';
import {RootStackParams} from './type';
import {StackNavigationProp} from '@react-navigation/stack';

export interface StoryBarProps {
  navigation: any;
}
export interface HomeProps {
  navigation: any;
}
export interface ProfileProps {
  navigation: any;
}
export interface OnboardingProps {
  navigation: any;
}
export interface StoriesProps {
  route: any;
  navigation: any;
}
export interface FeaturedProps {
  navigation: StackNavigationProp<RootStackParams, 'HomeScreen'>;
}
export interface Featured {
  route: RouteProp<RootStackParams, 'EstateDetail'>;
  navigation: StackNavigationProp<RootStackParams, 'EstateDetail'>;
}

export interface ReviewProps {
  estate: EstateDetailProps;
}
export interface ReviewDetail {
  route: RouteProp<RootStackParams, 'ReviewDetails'>;
}

export interface RouteTransaction {
  route: RouteProp<RootStackParams, 'TransactionDetail'>;
}

export interface RouteConfirm {
  route: RouteProp<RootStackParams, 'ConfirmDetail'>;
}

export interface Users {
  avatar: string;
  _id: string;
  full_name: string;
  address: Address;
}
export interface EstateItems {
  _id: string;
  name: string;
  likes: Array<Likes> | Array<string>;
  address: Address;
  email: string;
  price: {
    rent: number;
    buy: number;
  };
  rating_star: number;
  images: Array<string>;
  user: string;
  status: number;
}

export interface ReviewItems {
  _id: string;
  images: Array<string>;
  user: Users;

  content: string;
  star: number;
  estateUserId: string;
  estateId: string;
}

export interface UserData {
  _id: string;
  avatar: string;
  email: string;
  full_name: string;
  mobile: number;
  address: object;
  lengthEstates?: number;
}

export interface Likes {
  _id: string;
  avatar: string;
  full_name: string;
}

export interface Address {
  house_number: number;
  road: string;
  quarter: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface EstateDetailProps {
  address: Address;
  price: {
    rent: number;
  };
  likes: Array<Likes> | Array<string>;
  property: {
    bedroom: number;
    bathroom: number;
  };
  images: Array<string>;
  _id: string;
  name: string;
  reviews: Array<ReviewItems>;
  user: Users;
  status: number;
}
export interface TranSactionProps {
  _id: string;
  type: string;
  checkIn: string;
  checkOut: string;
  discount: number;
  paymentMethod: string;
  price: number;
  note: string;
  status: string;
  user: Users;
  estateId: string;
  estateUserId: string;
}
