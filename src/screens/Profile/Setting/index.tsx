import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {BackButton} from '@/components';
import {AuthContext} from '@/context/AuthContext';
import {navigate, replace} from '@/navigation/NavigationUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {screenWidth} from '@/themes/Responsive';
import {languageStore} from '@/stores';
import {LanguageBottomSheet} from '@/components/LanguageBottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Setting = () => {
  const {t} = useTranslation();
  const {logout} = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <BackButton />
      <LanguageBottomSheet />

      <Text style={styles.settingTitle}>{t('setting')}</Text>
      <View style={styles.profileContent}>
        <TouchableOpacity
          onPress={() => {
            languageStore.setShowLanguageSheet(true);
          }}
        >
          <View style={styles.viewLanguage}>
            <View style={styles.viewLogout}>
              <View style={styles.viewIcon}>
                <Ionicons
                  name="language"
                  size={12}
                  color={'#FFFFFF'}
                />
              </View>
              <Text style={styles.logoutText}>{t('language')}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.viewLine}></View>
        <TouchableOpacity
          onPress={() => {
            logout();
          }}
        >
          <View style={styles.viewLogout}>
            <View style={styles.viewIcon}>
              <Feather
                name="log-out"
                size={12}
                color={'#FFFFFF'}
              />
            </View>
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
  languageText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#252B5C',
  },
  logoutText: {
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    color: '#252B5C',
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
  viewLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  viewLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  viewLine: {
    width: screenWidth - 48,
    height: 1.3,
    backgroundColor: '#ECEDF3',
  },
});
