import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppStack from './AppStack';
import {navigationRef} from './NavigationUtils';
import {AuthContext} from '@/context/AuthContext';
import Login from '@/screens/Login';
import Splash from '@/components/Splash';
import TabNavigator from './TabNavigator';
import Location from '@/screens/AccountSetup/Location';

const AppNavigation = () => {
  const {isLoading, userToken, lat, lng} = useContext(AuthContext);

  return (
    <NavigationContainer ref={navigationRef}>
      {
        isLoading ? (
          <Splash />
        ) : userToken === null ? (
          <Login />
        ) : (
          // lat && lng ? (
          <View style={styles.container}>
            <AppStack name={userToken ? 'HomeScreen' : undefined} />
          </View>
        )
        // ) : (
        //   <Location />
        // )
      }
    </NavigationContainer>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
