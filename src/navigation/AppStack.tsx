import OptionLogin from '@/screens/OptionLogin';
import Onboarding from '@/screens/Onboarding';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import Login from '@/screens/Login';
import {RootStackParams} from '@/utils/type';
import Register from '@/screens/Register';
import TabNavigator from './TabNavigator';
import {observer} from 'mobx-react-lite';

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
    </Stack.Navigator>
  );
};

export default observer(AppStack);
