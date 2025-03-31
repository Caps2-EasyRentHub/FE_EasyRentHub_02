import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {BackButton} from '@/components';
import {useTranslation} from 'react-i18next';
import {screenWidth} from '@/themes/Responsive';
import {House_Icon} from '@/assets/Svg';
import {push} from '@/navigation/NavigationUtils';

const CreateEstate = () => {
  const {t} = useTranslation();
  const handlePress = () => {
    Keyboard.dismiss();
  };
  const [nameEstates, setNameEstates] = useState<string>('');
  const [btnRent, setBtnRent] = useState<boolean>(false);
  const [btnSell, setBtnSell] = useState<boolean>(false);
  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.component}>
        <View style={styles.pageTitle}>
          <Text style={styles.addList}>{t('add_listing')}</Text>
        </View>
        <BackButton />
        <View style={styles.titleView}>
          <Text style={styles.titleNormal}>{t('fill_details')}</Text>
          <Text style={styles.titleHighlight}>{t('real_estate')}</Text>
        </View>
        <View>
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => setNameEstates(text)}
          />
          <View style={styles.viewIcon}>
            <House_Icon />
          </View>
        </View>
        <Text style={styles.titleList}>{t('listing_type')}</Text>
        <View style={styles.viewList}>
          <TouchableOpacity
            style={
              !btnRent
                ? styles.btnRent
                : [styles.btnRent, {backgroundColor: '#234F68'}]
            }
            onPress={() => setBtnRent(!btnRent)}
          >
            <Text
              style={
                !btnRent ? styles.txtRent : [styles.txtRent, {color: '#FFFFFF'}]
              }
            >
              {t('rent')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              !btnSell
                ? styles.btnSell
                : [styles.btnSell, {backgroundColor: '#234F68'}]
            }
            onPress={() => setBtnSell(!btnSell)}
          >
            <Text
              style={
                !btnSell ? styles.txtSell : [styles.txtSell, {color: '#FFFFFF'}]
              }
            >
              {t('sell')}
            </Text>
          </TouchableOpacity>
        </View>
        {nameEstates && (btnRent || btnSell) ? (
          <TouchableOpacity
            style={styles.btnNext}
            onPress={() => {
              push({
                name: 'AddEstateLocation',
                params: {
                  data: {
                    name: nameEstates,
                    listType: {
                      rent: btnRent,
                      sell: btnSell,
                    },
                  },
                },
              });
            }}
          >
            <Text style={[styles.txtSell, {color: '#FFFFFF', fontSize: 20}]}>
              {t('next')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnNext, {backgroundColor: '#F5F4F8'}]}
            activeOpacity={1}
          >
            <Text style={[styles.txtSell, {fontSize: 20}]}>{t('next')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CreateEstate;

const styles = StyleSheet.create({
  component: {
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
  viewList: {
    flexDirection: 'row',
  },
  btnRent: {
    backgroundColor: '#F5F4F8',
    borderRadius: 20,
    paddingVertical: 17.5,
    paddingHorizontal: 24,
    marginLeft: 24,
  },
  txtRent: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
  },
  btnSell: {
    backgroundColor: '#F5F4F8',
    borderRadius: 20,
    paddingVertical: 17.5,
    paddingHorizontal: 24,
    marginLeft: 10,
  },
  txtSell: {
    color: '#252B5C',
    fontFamily: 'Lato-Bold',
  },
  btnNext: {
    width: screenWidth - 140,
    height: 54,
    backgroundColor: '#8BC83F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 26,
    position: 'absolute',
    left: 70,
  },
});
