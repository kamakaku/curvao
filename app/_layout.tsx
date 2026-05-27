import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/providers/AuthProvider'; // Import AuthProvider

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000' }, // Ensure new screens have a solid background
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="(tabs)/matches/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'card',
              contentStyle: { backgroundColor: '#000' }
            }} 
          />
        </Stack>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
