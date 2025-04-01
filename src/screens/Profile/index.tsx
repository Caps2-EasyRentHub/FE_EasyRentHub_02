import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pencil_Icon, Setting_Icon} from '@/assets/Svg';
import {getImages} from '@/assets/Images';
import {screenWidth} from '@/themes/Responsive';
import {ProfileProps, UserData} from '@/utils/interface';
import TabMenu from './TabMenu';
import {navigate} from '@/navigation/NavigationUtils';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import Splash from '@/components/Splash';

const Profile: React.FC<ProfileProps> = () => {
  const {userToken, idUser, logout} = useContext(AuthContext);
  const {t} = useTranslation();
  const [data, setData] = useState<UserData | null>(null);
  const [lengthEstates, setLengthEstates] = useState();
  const getProFile = async () => {
    await fetch(`${Config.API_URL}/api/user/${idUser}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.user);
        setLengthEstates(res.lengthEstates);
      });
  };

  useEffect(() => {
    getProFile();
  }, []);

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };
  return (
    <View style={styles.component}>
      <Text style={styles.profileTitle}>{t('profile')}</Text>
      <TouchableOpacity
        style={styles.btnSetting}
        onPress={() => navigate({name: 'Setting'})}
      >
        <Setting_Icon />
      </TouchableOpacity>
      {!data ? (
        <Splash />
      ) : (
        <>
          <View>
            <Image
              style={styles.avatar}
              source={{uri: data.avatar}}
            />
            <View style={styles.btnEdit}>
              <Pencil_Icon />
            </View>
          </View>
          <Text style={styles.username}>{data.full_name}</Text>
          <Text
            style={styles.email}
            onPress={() => handleEmailPress(data.email)}
          >
            {data.email}
          </Text>
          <View style={styles.information}>
            <TouchableOpacity style={styles.btnListing}>
              <Text style={styles.username}>{lengthEstates}</Text>
              <Text style={styles.listingText}>{t('listings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnListing}>
              <Text style={styles.username}>0</Text>
              <Text style={styles.listingText}>{t('confirm')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnListing}
              onPress={() => navigate({name: 'AllReview'})}
            >
              <Text style={styles.username}>0</Text>
              <Text style={styles.listingText}>{t('reviews')}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              height: '100%',
              width: screenWidth - 48,
              marginTop: 20,
            }}
          >
            <TabMenu />
          </View>
        </>
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  profileTitle: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
  },
  btnSetting: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    position: 'absolute',
    top: 24,
    right: 24,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    zIndex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  btnEdit: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 25,
    backgroundColor: '#234F68',
    zIndex: 1,
  },
  username: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    marginTop: 12,
  },
  email: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  information: {
    flexDirection: 'row',
    marginLeft: -10,
  },
  listingText: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginTop: 7,
  },
  btnListing: {
    marginTop: 20,
    width: screenWidth / 3 - 24,
    height: 70,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEDF3',
    marginLeft: 10,
  },
});
