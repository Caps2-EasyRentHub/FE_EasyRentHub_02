import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo, useEffect} from 'react';
import Modal from 'react-native-modal';
import Entypo from 'react-native-vector-icons/Entypo';
import {languageStore} from '@/stores';
import {screenWidth} from '@/themes/Responsive';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

export const LanguageBottomSheet = memo(
  observer(() => {
    const {t} = useTranslation();

    return (
      <Modal
        swipeDirection={'down'}
        isVisible={languageStore.showLanguageSheet}
        onBackdropPress={() => languageStore.setShowLanguageSheet(false)}
        onSwipeComplete={() => languageStore.setShowLanguageSheet(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                width: 30,
                height: 3,
                borderRadius: 30,
                backgroundColor: 'black',
                justifyContent: 'center',
                marginLeft: screenWidth / 2 - 40,
              }}
            ></View>
            <Text
              style={{color: 'black', fontFamily: 'Lato-Bold', fontSize: 20}}
            >
              {t('choose_language')}
            </Text>
            {languageStore.languages.map((item: any, index: number) => {
              return (
                <TouchableOpacity
                  style={styles.language}
                  key={index}
                  onPress={() => languageStore.setLanguage(item.code)}
                >
                  <Image
                    source={item.flag}
                    style={styles.flagModal}
                  />
                  <Text style={styles.textLanguage}>{item.name}</Text>
                  <Entypo
                    name="check"
                    size={15}
                    color={
                      item.code === languageStore.currentLanguage?.code
                        ? '#8BC83F'
                        : '#A1A5C1'
                    }
                    style={{position: 'absolute', right: 20}}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    );
  }),
);

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: -20,
    width: screenWidth,
    flexDirection: 'column',
  },
  language: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderColor: '#ECEDF3',
    width: screenWidth,
    marginLeft: -20,
  },
  textLanguage: {
    color: '#252B5C',
    textAlign: 'center',
    fontFamily: 'Lato-Bold',
  },
  flagModal: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginRight: 15,
  },
  flag: {
    width: 28,
    height: 22,
    marginRight: 4,
  },
});
