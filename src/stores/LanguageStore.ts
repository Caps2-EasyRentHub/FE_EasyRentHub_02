import i18n from '@/Translations/i18n';
import {getImages} from '@/assets/Images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {makeAutoObservable} from 'mobx';

export default class AppState {
  languages = [
    {
      name: 'English',
      code: 'en',
      flag: getImages().en_flag,
      isSelected: i18n.language === 'en',
    },
    {
      name: 'Tiếng Việt',
      code: 'vi',
      flag: getImages().vn_flag,
      isSelected: i18n.language === 'vi',
    },
  ];
  showLanguageSheet = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLanguage(code: string) {
    AsyncStorage.setItem('language', code);
    i18n.changeLanguage(code);
    this.languages.forEach((lang) => {
      lang.isSelected = lang?.code === code;
    });
  }
  async getLanguage() {
    try {
      const language = await AsyncStorage.getItem('language');
      if (language) {
        i18n.changeLanguage(language);
        this.languages.forEach((lang) => {
          lang.isSelected = lang?.code === language;
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  setShowLanguageSheet(value: boolean) {
    this.showLanguageSheet = value;
  }

  get currentLanguage() {
    return this.languages.find((lang) => lang.isSelected);
  }
}
