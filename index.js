/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {configure} from 'mobx';
import './src/Translations/i18n';
AppRegistry.registerComponent(appName, () => App);
configure({
  useProxies: 'always',
  enforceActions: 'never',
});
