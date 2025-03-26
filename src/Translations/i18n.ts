import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as resources from './Resources';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: {translation: resources.en},
    vi: {translation: resources.vi},
  },
  fallbackLng: 'vi',
  lng: 'vi',
});

export default i18n;
