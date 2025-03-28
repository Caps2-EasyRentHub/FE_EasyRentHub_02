import OptionLogin from '@/screens/OptionLogin';
import Onboarding from '@/screens/Onboarding';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import Login from '@/screens/Login';
import {RootStackParams} from '@/utils/type';
import Register from '@/screens/Register';
import Location from '@/screens/AccountSetup/Location';
import Stories from '@/screens/Stories';
import TabNavigator from './TabNavigator';
import {observer} from 'mobx-react-lite';
import EstateDetail from '@/screens/EstateDetail';
import ReviewDetails from '@/screens/Reviews/ReviewDetails';
import AllReview from '@/screens/Profile/AllReview';
import TabMenu from '@/screens/Profile/TabMenu';
import TransactionDetail from '@/screens/Profile/TabMenu/Transaction/TransactionDetail';
import AddReview from '@/screens/Reviews/AddReview';
import CreateEstate from '@/screens/CreateEstate';
import AddEstateLocation from '@/screens/CreateEstate/AddEstateLocation';
import AddEstateImages from '@/screens/CreateEstate/AddEstateImages';
import AddEstateInfo from '@/screens/CreateEstate/AddEstateInfo';
import Transaction from '@/screens/Transaction';
import SearchResult from '@/screens/Search/SearchResult';
import Notification from '@/screens/Home/Header/Notification';
import Message from '@/screens/Home/Header/Message';
import MessagesDetail from '@/screens/Home/Header/MessagesDetail';
import TransactionSummary from '@/screens/TransactionSummary';
import Setting from '@/screens/Profile/Setting';
import ConfirmDetail from '@/screens/Profile/TabMenu/Confirm/ConfirmDetail';
import EditListing from '@/screens/Profile/TabMenu/Listing/EditListing';

const AppStack = ({name}: any) => {
  const Stack = createStackNavigator<RootStackParams>();

  return (
    <Stack.Navigator
      initialRouteName={name}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="OnBoarding"
        component={Onboarding}
      />
      <Stack.Screen
        name="OptionLogin"
        component={OptionLogin}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="HomeScreen"
        component={TabNavigator}
      />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Location"
        component={Location}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <Stack.Screen
        name="Stories"
        component={Stories}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      <Stack.Screen
        name="EstateDetail"
        component={EstateDetail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ReviewDetails"
        component={ReviewDetails}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="AllReview"
        component={AllReview}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="TabMenu"
        component={TabMenu}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="AddReview"
        component={AddReview}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="CreateEstate"
        component={CreateEstate}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="AddEstateLocation"
        component={AddEstateLocation}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="AddEstateImages"
        component={AddEstateImages}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="AddEstateInfo"
        component={AddEstateInfo}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Transaction"
        component={Transaction}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="SearchResult"
        component={SearchResult}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Message"
        component={Message}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="MessagesDetail"
        component={MessagesDetail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="TransactionSummary"
        component={TransactionSummary}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Setting"
        component={Setting}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ConfirmDetail"
        component={ConfirmDetail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="EditListing"
        component={EditListing}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};

export default observer(AppStack);
