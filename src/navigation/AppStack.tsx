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
    </Stack.Navigator>
  );
};

export default observer(AppStack);
