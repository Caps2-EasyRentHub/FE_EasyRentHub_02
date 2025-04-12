import React, {useEffect} from 'react';
import AppNavigation from './navigation/AppNavigation';
import './Translations/i18n';
import {languageStore} from './stores';
import {AuthProvider} from './context/AuthContext';
import {PaperProvider} from 'react-native-paper';
import {ChatProvider} from './context/ChatContext';

const App = () => {
  useEffect(() => {
    languageStore.getLanguage();
  }, []);

  return (
    <AuthProvider>
      <PaperProvider>
        <ChatProvider>
          <AppNavigation />
        </ChatProvider>
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;
