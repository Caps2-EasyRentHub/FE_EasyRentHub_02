import React, {useEffect} from 'react';
import AppNavigation from './navigation/AppNavigation';
import './Translations/i18n';
import {languageStore} from './stores';
import {AuthProvider} from './context/AuthContext';
import {PaperProvider} from 'react-native-paper';
import socketService from './services/socketService';
import Toast from 'react-native-toast-message';
import {SubscriptionProvider} from './context/SubscriptionContext';
// import {ChatProvider} from './context/ChatContext';

const App = () => {
  useEffect(() => {
    languageStore.getLanguage();

    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <PaperProvider>
          {/* <ChatProvider> */}
          <AppNavigation />
          <Toast />

          {/* </ChatProvider> */}
        </PaperProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export default App;
