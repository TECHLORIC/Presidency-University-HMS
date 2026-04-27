import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, View, Image, Text } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useAppStore } from '../lib/store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const { initializeAuth } = useAppStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isHandlingAuth } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isHandlingAuth) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inTabsGroup && segments[0] !== 'login') {
      router.replace('/login');
    } else if (!isAuthenticated && inTabsGroup) {
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHandlingAuth, segments]);

  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ 
        headerStyle: { 
          backgroundColor: isDark ? '#050a14' : '#f8f9fa',
        },
        headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
        headerTitleStyle: { 
          fontWeight: '900', 
          textTransform: 'uppercase', 
          fontSize: 11, 
          letterSpacing: 2,
        },
        headerShadowVisible: false,
        headerLeft: () => (
          <View className="flex-row items-center gap-2 ml-4">
             <View className="h-7 w-7 rounded-lg bg-white items-center justify-center p-0.5 shadow-sm">
                <Image 
                  source={{ uri: 'https://presidencyuniversity.in/assets/images/overview-logo.webp' }} 
                  className="h-full w-full" 
                  resizeMode="contain" 
                />
             </View>
          </View>
        ),
      }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="announcements" options={{ title: 'Broadcasts' }} />
        <Stack.Screen name="mess" options={{ title: 'Mess Menu' }} />
        <Stack.Screen name="security" options={{ title: 'Security' }} />
        <Stack.Screen name="users" options={{ title: 'Users' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
