import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Transaction from './Transaction';
import Listing from './Listing';
import {screenWidth} from '@/themes/Responsive';
import Confirm from './Confirm';

const Tab = createMaterialTopTabNavigator();

const TabMenu = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarStyle: {
          backgroundColor: '#F5F4F8',
          borderRadius: 100,
          height: 50,
        },
        tabBarIndicatorStyle: {
          height: 32,
          borderRadius: 100,
          top: 9,
          backgroundColor: '#FFFFFF',
          width: screenWidth / 3 - 24 - 8,
          left: 8,
        },
        swipeEnabled: false,
        tabBarLabel: ({focused}) => {
          let label;
          return (label = focused ? (
            <Text
              style={{
                color: '#252B5C',
                fontFamily: 'Lato-Bold',
                fontSize: 12,
              }}
            >
              {route.name}
            </Text>
          ) : (
            <Text
              style={{color: '#A1A5C1', fontFamily: 'Lato-Bold', fontSize: 12}}
            >
              {route.name}
            </Text>
          ));
        },
      })}
    >
      <Tab.Screen
        name="Transaction"
        component={Transaction}
      />
      <Tab.Screen
        name="Listing"
        component={Listing}
      />
      <Tab.Screen
        name="Confirm"
        component={Confirm}
      />
    </Tab.Navigator>
  );
};

export default TabMenu;

const styles = StyleSheet.create({});
