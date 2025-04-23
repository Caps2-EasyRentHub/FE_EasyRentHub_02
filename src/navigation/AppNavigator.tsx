import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NotificationComponent from '@/components/Notification';
import Setting from '@/screens/Profile/Setting';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Notification" component={NotificationComponent} />
      <Stack.Screen name="Setting" component={Setting} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 