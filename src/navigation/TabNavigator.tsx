import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '@/screens/Home';
import Search from '@/screens/Search';
import Favorite from '@/screens/Favorite';

import {
  House_Icon,
  House_Active,
  Search_Active,
  Search_Icon,
  Profile_Active,
  Profile_Icon,
  Heart_Active,
  Heart_Icon,
} from '@/assets/Svg';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: 90,
          borderColor: '#ffffff',
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({focused}) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? <House_Active /> : <House_Icon />;
          } else if (route.name === 'Search') {
            iconName = focused ? <Search_Active /> : <Search_Icon />;
          } else if (route.name === 'Profile') {
            iconName = focused ? <Profile_Active /> : <Profile_Icon />;
          } else if (route.name === 'Favorite') {
            iconName = focused ? <Heart_Active /> : <Heart_Icon />;
          }

          return iconName;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
      />
      <Tab.Screen
        name="Search"
        component={Search}
      />
      <Tab.Screen
        name="Favorite"
        component={Favorite}
        options={{unmountOnBlur: true}}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{unmountOnBlur: true}}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({});
