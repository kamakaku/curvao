import { Stack } from 'expo-router';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '@/src/providers/AuthProvider';

const logo = require('@/assets/logo_word.png');

export default function AuthLayout() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator color="#D8AA4D" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#080A09' },
        animation: 'fade',
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#080A09',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    width: 150,
    height: 30,
    opacity: 0.8,
  },
});
