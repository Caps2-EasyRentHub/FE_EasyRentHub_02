import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackButton} from '@/components';
import {House_Icon} from '@/assets/Svg';
import {screenWidth} from '@/themes/Responsive';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import {EstateDetailProps} from '@/utils/interface';
import Splash from '@/components/Splash';

const EditListing = ({route}: any) => {
  const {id} = route.params;
  const {t} = useTranslation();
  const {userToken, idUser} = useContext(AuthContext);
  const [nameEstates, setNameEstates] = useState<string>('');
  const [data, setData] = useState<EstateDetailProps | null>(null);
  const [load, setLoad] = useState(true);
  useEffect(() => {
    setLoad(true);
    fetch(`${Config.API_URL}/api/estate/${id}`, {
      method: 'GET',
      headers: {Authorization: userToken},
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.estate);
        setNameEstates(res.estate.name);
      })
      .finally(() => setLoad(false));
  }, []);
  return load ? (
    <Splash />
  ) : (
    <View style={styles.container}>
      <View style={styles.pageTitle}>
        <Text style={styles.addList}>{t('edit_listing')}</Text>
      </View>
      <BackButton />
      <Text style={styles.titleList}>{t('listing_name')}</Text>
      <View>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => setNameEstates(text)}
          value={nameEstates}
        />
        <View style={styles.viewIcon}>
          <House_Icon />
        </View>
      </View>
    </View>
  );
};

export default EditListing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageTitle: {alignItems: 'center'},
  addList: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
  },
  titleView: {
    flexDirection: 'row',
    marginTop: 35,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  titleNormal: {
    fontFamily: 'Lato-Medium',
    color: '#000000',
    fontSize: 30,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 30,
  },
  textInput: {
    width: screenWidth - 48,
    height: 70,
    backgroundColor: '#F5F4F8',
    marginLeft: 24,
    borderRadius: 25,
    color: '#252B5C',
    fontSize: 15,
    paddingHorizontal: 16,
  },
  viewIcon: {
    position: 'absolute',
    top: 25,
    right: 36,
  },
  titleList: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 35,
    marginBottom: 20,
    marginHorizontal: 24,
  },
});
