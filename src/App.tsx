import * as Device from 'expo-device';

import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import { AuthProvider, useAuthContext } from './providers/AuthProvider';
import { DeviceProvider, useDeviceContext } from './providers/DeviceProvider';
import React, { ReactElement, useEffect } from 'react';
import { ThemeProvider, ThemeType } from '@dooboo-ui/native-theme';
import { dark, light } from './theme';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AsyncStorage from '@react-native-community/async-storage';
import { QUERY_ME } from './graphql/queries';
import RootNavigator from './components/navigation/RootStackNavigator';
import SplashScreen from 'react-native-splash-screen';
import { User } from './types';
import client from './apollo/Client';
import { initializeEThree } from './utils/virgil';

let timer: number;

function AppWithTheme(): ReactElement {
  const { setUser } = useAuthContext();
  const { setDeviceType } = useDeviceContext();

  const { loading, data } = useQuery<{ me: User}, {}>(QUERY_ME);

  const setDevice = async (): Promise<void> => {
    const deviceType = await Device.getDeviceTypeAsync();
    setDeviceType(deviceType);
  };

  useEffect(() => {
    return (): void => {
      if (timer) { clearTimeout(timer); }
    };
  }, []);

  useEffect(() => {
    if (data && data.me) {
      initializeEThree(data.me.id);
      setUser(data.me);
    } else if (data) {
      AsyncStorage.removeItem('token');
    }
    setDevice();

    timer = setTimeout(() => SplashScreen.hide(), 1000);
  }, [loading]);

  return <RootNavigator />;
}

function App(): ReactElement {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      customTheme={{ light, dark }}
      initialThemeType={
        colorScheme === 'dark' ? ThemeType.DARK : ThemeType.LIGHT
      }
    >
      <AppWithTheme/>
    </ThemeProvider>
  );
}

function ProviderWrapper(): ReactElement {
  return (
    <AppearanceProvider>
      <DeviceProvider>
        <AuthProvider>
          <ApolloProvider client={client}>
            <ActionSheetProvider>
              <App />
            </ActionSheetProvider>
          </ApolloProvider>
        </AuthProvider>
      </DeviceProvider>
    </AppearanceProvider>
  );
}

export default ProviderWrapper;
