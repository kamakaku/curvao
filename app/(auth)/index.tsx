import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/src/components/auth/AuthButton';
import { CurvaoScreen } from '@/src/components/CurvaoScreen';
import { curvao } from '@/src/theme/curvaoTheme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <CurvaoScreen padded={false}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>CURVAO</Text>
          <Text style={styles.subtitle}>EARNED. NOT BOUGHT.</Text>
        </View>

        <View style={styles.actions}>
          <AuthButton 
            label="ANMELDEN" 
            onPress={() => router.push('/(auth)/login')} 
          />
          <AuthButton 
            label="ICH BIN NEU HIER" 
            onPress={() => router.push('/onboarding')} 
            variant="secondary"
          />
        </View>
      </View>
    </CurvaoScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  title: {
    color: curvao.colors.text,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
  },
  subtitle: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
  },
  actions: {
    gap: 10,
    width: '100%',
  },
});
