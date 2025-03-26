import * as resources from './Resources';
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'vi';
    resources: {
      vi: typeof resources.vi;
      en: typeof resources.en;
    };
  }
}
