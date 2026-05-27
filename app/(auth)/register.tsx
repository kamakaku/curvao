import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreenShell } from '@/src/components/auth/AuthScreenShell';
import { AuthTextInput } from '@/src/components/auth/AuthTextInput';
import { AuthButton } from '@/src/components/auth/AuthButton';
import { getCurrentUser, registerWithEmail, loginWithEmail } from '@/src/services/authService';
import { getOnboardingDraft } from '@/src/services/onboardingDraftService';
import { completeOnboardingForUser } from '@/src/services/onboardingService';
import { mapAuthError } from '@/src/utils/authErrors';
import { curvao } from '@/src/theme/curvaoTheme';

export default function RegisterScreen() {
  const router = useRouter();
  const { fromOnboarding } = useLocalSearchParams<{ fromOnboarding?: string }>();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirm) {
      setError('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (!acceptedTerms) {
      setError('Bitte akzeptiere die Nutzungsbedingungen und Datenschutzhinweise.');
      return;
    }

    setLoading(true);
    setError(null);

    const safeEmail = email.trim().toLowerCase();

    try {
      await registerWithEmail({
        email: safeEmail,
        password,
        passwordConfirm,
        name: name.trim(),
        username: username.trim() || undefined,
      });

      // Auto login after successful registration
      await loginWithEmail(safeEmail, password);
      const user = await getCurrentUser();
      const draft = await getOnboardingDraft();
      if (fromOnboarding) {
        await completeOnboardingForUser({
          userId: user.id,
          draft: draft ?? { preferredEarnMethods: [], createdAt: new Date().toISOString() },
        });
        router.replace('/onboarding/starter-pack');
      }
      // AuthProvider will handle redirect
    } catch (err) {
      setError(mapAuthError(err));
      setLoading(false); // Only set false on error, success redirects
    }
  };

  return (
    <AuthScreenShell 
      title="Account erstellen" 
      subtitle="Starte deine CURVAO Sammlung."
    >
      <AuthTextInput
        label="NAME *"
        placeholder="Dein Vor- und Nachname"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        textContentType="name"
        returnKeyType="next"
      />

      <AuthTextInput
        label="USERNAME (OPTIONAL)"
        placeholder="dein_spielername"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        textContentType="username"
        returnKeyType="next"
      />

      <AuthTextInput
        label="E-MAIL *"
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
        label="PASSWORT *"
        placeholder="Mindestens 8 Zeichen"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="next"
      />

      <AuthTextInput
        label="PASSWORT BESTÄTIGEN *"
        placeholder="Passwort wiederholen"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="done"
      />

      <Pressable 
        style={styles.checkboxContainer} 
        onPress={() => setAcceptedTerms(!acceptedTerms)}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
          {acceptedTerms && <Ionicons name="checkmark" size={14} color="#000" />}
        </View>
        <Text style={styles.checkboxLabel}>
          Ich akzeptiere die <Text style={styles.linkText}>Nutzungsbedingungen</Text> und <Text style={styles.linkText}>Datenschutzhinweise</Text>.
        </Text>
      </Pressable>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <AuthButton 
          label="ACCOUNT ERSTELLEN" 
          onPress={handleRegister} 
          loading={loading}
        />

        <View style={styles.divider} />

        <Link href="/(auth)/login" asChild>
          <AuthButton label="Bereits einen Account? Anmelden" onPress={() => {}} variant="secondary" />
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingRight: 20,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: curvao.colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: curvao.colors.gold,
    borderColor: curvao.colors.gold,
  },
  checkboxLabel: {
    color: curvao.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    color: curvao.colors.gold,
    textDecorationLine: 'underline',
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
