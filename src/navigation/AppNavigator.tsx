import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NotificationComponent from '@/components/Notification';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Notification" component={NotificationComponent} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 