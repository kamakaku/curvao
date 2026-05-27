import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { AuthScreenShell } from '@/src/components/auth/AuthScreenShell';
import { AuthTextInput } from '@/src/components/auth/AuthTextInput';
import { AuthButton } from '@/src/components/auth/AuthButton';
import { getCurrentUser, loginWithEmail } from '@/src/services/authService';
import { clearOnboardingDraft, getOnboardingDraft } from '@/src/services/onboardingDraftService';
import { completeOnboardingForUser } from '@/src/services/onboardingService';
import { mapAuthError } from '@/src/utils/authErrors';
import { curvao } from '@/src/theme/curvaoTheme';

export default function LoginScreen() {
  const router = useRouter();
  const { fromOnboarding } = useLocalSearchParams<{ fromOnboarding?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Bitte fülle alle Felder aus.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginWithEmail(email.trim().toLowerCase(), password);
      const user = await getCurrentUser();
      const draft = await getOnboardingDraft();

      if (fromOnboarding) {
        if (user.onboardingCompleted === true) {
          await clearOnboardingDraft();
          router.replace('/(tabs)');
          return;
        }

        await completeOnboardingForUser({
          userId: user.id,
          draft: draft ?? { preferredEarnMethods: [], createdAt: new Date().toISOString() },
        });
        router.replace('/onboarding/starter-pack');
        return;
      }

      if (user.onboardingCompleted === true) {
        router.replace('/(tabs)');
        return;
      }

      router.replace('/onboarding/starter-pack');
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell 
      title="Willkommen zurück" 
      subtitle="Melde dich an und sammle weiter."
    >
      <AuthTextInput
        label="E-MAIL"
        placeholder="deine@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
      />

      <AuthTextInput
        label="PASSWORT"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <AuthButton 
          label="ANMELDEN" 
          onPress={handleLogin} 
          loading={loading}
        />
        
        <Link href="/(auth)/forgot-password" asChild>
          <AuthButton label="Passwort vergessen?" onPress={() => {}} variant="text" />
        </Link>

        <View style={styles.divider} />

        <Link href="/(auth)/register" asChild>
          <AuthButton label="Noch keinen Account? Registrieren" onPress={() => {}} variant="secondary" />
        </Link>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 16,
    gap: 8,
  },
  errorBox: {
    backgroundColor: 'rgba(184,87,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184,87,77,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: curvao.colors.danger,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 16,
  },
});
