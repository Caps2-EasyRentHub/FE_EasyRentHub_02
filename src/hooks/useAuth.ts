import {useContext} from 'react';
import {AuthContext} from '@/context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  OptionLogin: undefined;
  // ... other screens
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp>();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const logout = () => {
    context.logout();
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const {userToken: token, idUser: id, ...rest} = context;

  return {
    user: {
      id,
      token,
    },
    ...rest,
    logout,
  };
}; 