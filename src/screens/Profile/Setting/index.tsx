import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  SafeAreaView,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackButton} from '@/components';
import {AuthContext} from '@/context/AuthContext';
import {replace, navigate} from '@/navigation/NavigationUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {screenWidth} from '@/themes/Responsive';
import {languageStore} from '@/stores';
import {LanguageBottomSheet} from '@/components/LanguageBottomSheet';
import {Config} from '@/config';
import axios from 'axios';

const Setting = () => {
  const {t} = useTranslation();
  const {logout, userToken} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${Config.API_URL}/api/logout`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        // Clear user data and navigate to login
        logout();
        replace({name: 'Login'});
      } else {
        Alert.alert(t('error'), t('logout_failed'));
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        Alert.alert(
          t('error'),
          error.response.data?.message || t('something_went_wrong')
        );
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert(t('error'), t('network_error'));
      } else {
        // Something happened in setting up the request that triggered an Error
        Alert.alert(t('error'), error.message || t('something_went_wrong'));
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'language',
      icon: 'language',
      iconType: 'Ionicons',
      text: t('language'),
      onPress: () => languageStore.setShowLanguageSheet(true),
    },
    {
      id: 'notification',
      icon: 'bell',
      iconType: 'Feather',
      text: t('notifications'),
      onPress: () => navigate({name: 'NotificationSettings'}),
    },
    {
      id: 'privacy',
      icon: 'shield-lock',
      iconType: 'MaterialCommunityIcons',
      text: t('privacy'),
      onPress: () => navigate({name: 'PrivacySettings'}),
    },
    {
      id: 'help',
      icon: 'question-circle',
      iconType: 'FontAwesome',
      text: t('help'),
      onPress: () => navigate({name: 'HelpCenter'}),
    },
    {
      id: 'about',
      icon: 'info',
      iconType: 'Feather',
      text: t('about'),
      onPress: () => navigate({name: 'About'}),
    },
  ];

  const renderIcon = (iconType: string, iconName: string) => {
    switch (iconType) {
      case 'Ionicons':
        return (
          <Ionicons
            name={iconName}
            size={12}
            color={'#FFFFFF'}
          />
        );
      case 'Feather':
        return (
          <Feather
            name={iconName}
            size={12}
            color={'#FFFFFF'}
          />
        );
      case 'MaterialCommunityIcons':
        return (
          <MaterialCommunityIcons
            name={iconName}
            size={12}
            color={'#FFFFFF'}
          />
        );
      case 'FontAwesome':
        return (
          <FontAwesome
            name={iconName}
            size={12}
            color={'#FFFFFF'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <LanguageBottomSheet />

      <Text style={styles.settingTitle}>{t('setting')}</Text>
      <View style={styles.profileContent}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <TouchableOpacity onPress={item.onPress}>
              <View style={styles.menuItem}>
                <View style={styles.viewIcon}>
                  {renderIcon(item.iconType, item.icon)}
                </View>
                <Text style={styles.menuText}>{item.text}</Text>
                <View style={styles.arrowContainer}>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color="#A1A5C1"
                  />
                </View>
              </View>
            </TouchableOpacity>
            {index < menuItems.length - 1 && <View style={styles.viewLine} />}
          </React.Fragment>
        ))}
        
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            style={styles.logoutButton}
          >
            <View style={styles.viewIcon}>
              <Feather
                name="log-out"
                size={12}
                color={'#FFFFFF'}
              />
            </View>
            <Text style={styles.logoutText}>
              {loading ? t('logging_out') : t('logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  settingTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
    textAlign: 'center',
  },
  profileContent: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#252B5C',
    flex: 1,
  },
  viewIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#1F4C6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginRight: 10,
  },
  viewLine: {
    width: screenWidth - 48,
    height: 1,
    backgroundColor: '#ECEDF3',
  },
  arrowContainer: {
    marginLeft: 10,
  },
  logoutContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#ECEDF3',
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#FC4B6C',
  },
});
