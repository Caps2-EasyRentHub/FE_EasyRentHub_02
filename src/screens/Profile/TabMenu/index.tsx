import {Text} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Transaction from './Transaction';
import Listing from './Listing';
import {screenWidth} from '@/themes/Responsive';
import Confirm from './Confirm';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import MaintenanceList from './Maintenance/MaintenanceList';

const Tab = createMaterialTopTabNavigator();

const TabMenu = () => {
  const {userToken, idUser} = useContext(AuthContext);
  const [isLandlord, setIsLandlord] = useState(false);

  useEffect(() => {
    const checkIfLandlord = async () => {
      try {
        const response = await fetch(`${Config.API_URL}/api/user/${idUser}`, {
          method: 'GET',
          headers: {Authorization: userToken},
        });
        const data = await response.json();
        const landLord = data?.user?.role === 'Landlord';
        setIsLandlord(landLord);
      } catch (error) {
        console.error('Error checking landlord status:', error);
        setIsLandlord(false);
      }
    };

    checkIfLandlord();
  }, [idUser, userToken]);

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
          width: screenWidth / (isLandlord ? 3 : 2) - 24 - 8,
          left: 8,
        },
        swipeEnabled: false,
        tabBarLabel: ({focused}) => {
          return focused ? (
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
          );
        },
      })}
    >
      {!isLandlord && (
        <Tab.Screen
          name="Trạng thái"
          component={Transaction}
        />
      )}
      {!isLandlord && (
        <Tab.Screen
          name="Bảo trì"
          component={MaintenanceList}
        />
      )}

      {isLandlord && (
        <Tab.Screen
          name="Danh sách"
          component={Listing}
        />
      )}
      {isLandlord && (
        <Tab.Screen
          name="Xác nhận"
          component={Confirm}
        />
      )}
    </Tab.Navigator>
  );
};

export default TabMenu;
