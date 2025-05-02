import OptionLogin from '@/screens/OptionLogin';
import Onboarding from '@/screens/Onboarding';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {observer} from 'mobx-react-lite';
import {RootStackParams} from '@/utils/type';
import Login from '@/screens/Login';
import Register from '@/screens/Register';
import TabNavigator from './TabNavigator';
import Location from '@/screens/AccountSetup/Location';
import CreateEstate from '@/screens/CreateEstate';
import AddEstateLocation from '@/screens/CreateEstate/AddEstateLocation';
import AddEstateImages from '@/screens/CreateEstate/AddEstateImages';
import AddEstateInfo from '@/screens/CreateEstate/AddEstateInfo';
import EstateDetail from '@/screens/EstateDetail';
import AddReview from '@/screens/Reviews/AddReview';
import ReviewDetails from '@/screens/Reviews/ReviewDetails';
import AllReview from '@/screens/Profile/AllReview';
import TabMenu from '@/screens/Profile/TabMenu';
import TransactionDetail from '@/screens/Profile/TabMenu/Transaction/TransactionDetail';
import BookingHistory from '@/screens/Profile/BookingHistory';
import Booking from '@/screens/Booking';
import SearchResult from '@/screens/Search/SearchResult';
import Setting from '@/screens/Profile/Setting';
import Chat from '@/screens/Chat/Chat';
import AllEstates from '@/screens/AllEstates';
import ConfirmDetail from '@/screens/Profile/TabMenu/Confirm/ConfirmDetail';
import Notification from '@/components/Notification';

const Stack = createStackNavigator<RootStackParams>();

const AppStack = observer(({name}: {name: string | undefined}) => {
  return (
    <Stack.Navigator
      initialRouteName={name ? name : 'OnBoarding'}
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen
        name="OnBoarding"
        component={Onboarding}
      />
      <Stack.Screen
        name="OptionLogin"
        component={OptionLogin}
      />
      <Stack.Screen
        name="Login"
        component={Login}
      />
      <Stack.Screen
        name="Register"
        component={Register}
      />
      <Stack.Screen
        name="HomeScreen"
        component={TabNavigator}
      />
      <Stack.Screen
        name="Location"
        component={Location}
      />
      <Stack.Screen
        name="CreateEstate"
        component={CreateEstate}
      />
      <Stack.Screen
        name="AddEstateLocation"
        component={AddEstateLocation}
      />
      <Stack.Screen
        name="AddEstateImages"
        component={AddEstateImages}
      />
      <Stack.Screen
        name="AddEstateInfo"
        component={AddEstateInfo}
      />
      <Stack.Screen
        name="EstateDetail"
        component={EstateDetail}
      />
      <Stack.Screen
        name="AddReview"
        component={AddReview}
      />
      <Stack.Screen
        name="ReviewDetails"
        component={ReviewDetails}
      />
      <Stack.Screen
        name="AllReview"
        component={AllReview}
      />
      <Stack.Screen
        name="TabMenu"
        component={TabMenu}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetail}
      />
      <Stack.Screen
        name="BookingHistory"
        component={BookingHistory}
      />
      <Stack.Screen
        name="Booking"
        component={Booking}
      />
      <Stack.Screen
        name="SearchResult"
        component={SearchResult}
      />
      <Stack.Screen
        name="Setting"
        component={Setting}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
      />
      <Stack.Screen
        name="AllEstates"
        component={AllEstates}
      />
      <Stack.Screen
        name="ConfirmDetail"
        component={ConfirmDetail}
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
    </Stack.Navigator>
  );
});

export default AppStack;
