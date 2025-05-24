import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeStorage } from '@/storage/mmkvStorage';
import { initializeNotifications } from '@/utils/notificationUtils';
import { useAuthStore } from '@/store/authStore';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();
GoogleSignin.configure({
  webClientId:
    '659835497018-lsrpqqc1svaps1rq2dufvtgg15lfj6m6.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  iosClientId:
    '659835497018-cneqs0bne6ua5u5jnk45eghbmfn3ata9.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  offlineAccess: true, // If you need to access Google API on behalf of the user FROM YOUR SERVER
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, ensure fresh tokens are returned
});

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const { initialized } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize app dependencies
        await initializeStorage();
        await initializeNotifications();
      } catch (e) {
        console.warn('Error initializing app:', e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);


  // Hide splash screen once fonts are loaded and app is initialized
  useEffect(() => {
    if ((fontsLoaded || fontError) && appReady && initialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, appReady, initialized]);

  // Return null to keep splash screen visible while fonts/app load
  if (!fontsLoaded && !fontError && !appReady && !initialized) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="date-time-picker"
          options={{
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: true,
            animationTypeForReplace: 'push',
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
