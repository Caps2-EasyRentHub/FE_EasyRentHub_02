import React, {useEffect} from 'react';
import AppNavigation from './navigation/AppNavigation';
import './Translations/i18n';
import {languageStore} from './stores';
import {AuthProvider} from './context/AuthContext';
import {PaperProvider} from 'react-native-paper';

const App = () => {
  useEffect(() => {
    languageStore.getLanguage();
  }, []);

  return (
    <AuthProvider>
      <PaperProvider>
        <AppNavigation />
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;
